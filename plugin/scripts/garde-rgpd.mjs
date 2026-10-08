#!/usr/bin/env node
// Hook PreToolUse : empêche qu'une donnée personnelle de joueur (nom protégé,
// téléphone, e-mail, date de naissance, numéro de licence) entre dans le
// dépôt coach-rugby ou parte sur GitHub (commit, push, tag, issue, PR,
// release, discussion).
//
// Portée : uniquement le dépôt coach-rugby (remote contenant « coach-rugby »)
// ou une commande gh qui le vise. Ailleurs, ne fait rien. Écrire dans le
// dossier saison est toujours autorisé.
// Blocage : code de sortie 2, explication sur stderr (renvoyée à Claude).
//
// Autre usage (CI) : `garde-rgpd.mjs --depot <dossier>` analyse tous les
// fichiers suivis par git et sort en code 1 en cas de constat.
//
// N'importe QUE des modules node:* (fonctionne sans dépendances installées).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { dossierSaison, fichierJoueursProteges, racineGit } from '../lib/chemins.mjs';
import { prenomsDuDossier } from '../lib/effectif.mjs';
import { analyser, decrire, lireNomsProteges } from '../lib/rgpd.mjs';

const MARQUE_DEPOT = 'coach-rugby';
// Fichiers générés dont le contenu vient de tiers : le lockfile npm reprend
// les messages des paquets, adresses de leurs auteurs comprises.
const GENERE = /(^|\/)package-lock\.json$/;

function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function estDepotCoachRugby(racine) {
  if (!racine) return false;
  const config = path.join(racine, '.git', 'config');
  return existsSync(config) && readFileSync(config, 'utf8').includes(MARQUE_DEPOT);
}

// ---------------------------------------------------------------- mode CI
// Fichiers interdits dans le dépôt, hors exemples fictifs et fixtures de test.
const HORS_FICTIF = (f) => !/^(plugin\/exemples|tests\/fixtures)\//.test(f);
const FICHIERS_INTERDITS = [
  { test: (f) => /(^|\/)\.joueurs-proteges\.txt$/.test(f), raison: 'liste de joueurs protégés' },
  { test: (f) => /(^|\/)\.prenoms\.ya?ml$/.test(f), raison: 'table des prénoms de joueurs' },
  { test: (f) => /(^|\/)progres[^/]*\.ya?ml$/i.test(f) && HORS_FICTIF(f), raison: 'progrès de joueurs' },
  { test: (f) => /(^|\/)\.coach-rugby\.yaml$/.test(f) && HORS_FICTIF(f), raison: 'configuration d\'un dossier saison réel' },
  { test: (f) => /(^|\/)(effectif|presences?)[^/]*\.(ya?ml|csv|xlsx?)$/i.test(f) && HORS_FICTIF(f), raison: 'effectif ou présences' },
];

function scannerDepot(dossier) {
  const fichiers = git(dossier, ['ls-files']).split('\n').filter(Boolean);
  const problemes = [];
  for (const f of fichiers) {
    const interdit = FICHIERS_INTERDITS.find((r) => r.test(f));
    if (interdit) problemes.push(`${f} : fichier interdit (${interdit.raison})`);
    const chemin = path.join(dossier, f);
    if (!existsSync(chemin) || /\.(png|jpe?g|gif|pdf|zip|ico|woff2?)$/i.test(f) || GENERE.test(f)) continue;
    const texte = readFileSync(chemin, 'utf8');
    const constats = analyser(texte);
    if (constats.length) problemes.push(`${f} : ${decrire(constats)}`);
    if (/^plugin\/exemples\/.*\.ya?ml$/.test(f) && /^\s*prenoms?\s*:/m.test(texte)) problemes.push(`${f} : champ « prenom » dans un exemple`);
  }
  return { fichiers: fichiers.length, problemes };
}

const arguments_ = process.argv.slice(2);
if (arguments_[0] === '--depot') {
  const dossier = path.resolve(arguments_[1] || '.');
  const { fichiers, problemes } = scannerDepot(dossier);
  if (problemes.length) {
    process.stdout.write(`Données personnelles possibles (${problemes.length}) :\n${problemes.map((p) => `  - ${p}`).join('\n')}\n` +
      'Remplacer par des nombres ou des codes (J01), ou marquer une donnée de test volontairement fictive avec « rgpd:fictif ».\n');
    process.exit(1);
  }
  process.stdout.write(`Aucune donnée personnelle détectée (${fichiers} fichiers).\n`);
  process.exit(0);
}

// -------------------------------------------------------------- mode hook
function lireEntree() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function bloquer(constats, contexte) {
  process.stderr.write(
    `Bloqué par coach-rugby (protection des joueurs) : ${contexte} contient ${decrire(constats)}. ` +
      'Ne jamais publier de donnée personnelle de joueur : remplacer par un nombre (« 14 enfants ») ou un code (J01). ' +
      `Les données des coachs restent dans leur dossier saison (${dossierSaison()}). ` +
      'Donnée de test volontairement fictive : ajouter le marqueur « rgpd:fictif » sur la ligne.\n',
  );
  process.exit(2);
}

// Texte réellement envoyé par un diff : messages de commit et lignes ajoutées.
// Une ligne supprimée ne divulgue rien : la scanner empêcherait de retirer une
// donnée du dépôt. Les commits sont séparés par \0 (--format=%x00%B).
function texteEnvoye(sortie) {
  let dansDiff = false;
  let ignore = false;
  const garde = [];
  for (const l of sortie.split('\n')) {
    if (l.startsWith('\0')) { dansDiff = false; garde.push(l.slice(1)); continue; }
    if (l.startsWith('diff --git')) { dansDiff = true; ignore = GENERE.test(l.split(' b/').pop()); continue; }
    if (!dansDiff) { garde.push(l); continue; }
    if (!ignore && l.startsWith('+') && !l.startsWith('+++')) garde.push(l.slice(1));
  }
  return garde.join('\n');
}

// Invocations « git [options globales] <commit|push|tag|merge> » d'une
// commande Bash, avec le dossier où chacune s'exécute.
const INVOCATION_GIT = /\bgit((?:\s+(?:-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+)|--[\w-]+(?:=\S+)?))*)\s+(commit|push|tag|merge)\b/g;
const sansGuillemets = (s) => s.replace(/^(["'])(.*)\1$/, '$2');

function invocationsGit(cmd, cwd) {
  const cds = [...cmd.matchAll(/(?:^|[;&|(]\s*)cd\s+("[^"]*"|'[^']*'|[^\s;&|)]+)/g)];
  return [...cmd.matchAll(INVOCATION_GIT)].map((m) => {
    let dossier = cwd;
    const cd = cds.filter((c) => c.index < m.index).pop();
    if (cd) dossier = path.resolve(cwd, sansGuillemets(cd[1]));
    for (const c of m[1].matchAll(/-C\s+("[^"]*"|'[^']*'|\S+)/g)) dossier = path.resolve(dossier, sansGuillemets(c[1]));
    return { sousCommande: m[2], racine: racineGit(dossier) };
  });
}

const entree = lireEntree();
const outil = entree.tool_name;
const params = entree.tool_input || {};
const cwd = entree.cwd || process.cwd();
const dossier = dossierSaison({ cwd });
// Noms protégés : la liste, plus tous les prénoms des tables d'équipe.
const noms = [...new Set([...lireNomsProteges(fichierJoueursProteges(dossier)), ...prenomsDuDossier(dossier)])];

if (outil === 'Bash') {
  const cmd = String(params.command || '');
  const invocations = invocationsGit(cmd, cwd);
  const versGh = /\bgh\s+(issue|pr|release|api|repo|label|discussion|gist)\b/.test(cmd);
  if (!invocations.length && !versGh) process.exit(0);
  const racines = [...new Set([racineGit(cwd), ...invocations.map((i) => i.racine)].filter(Boolean))];
  if (!racines.some(estDepotCoachRugby) && !cmd.includes(MARQUE_DEPOT)) process.exit(0);

  let texte = cmd;
  for (const { sousCommande, racine } of invocations) {
    if (!racine || !estDepotCoachRugby(racine)) continue;
    if (sousCommande === 'commit') {
      // Index et modifications non indexées : `-a`, `--only` ou un chemin en
      // argument les envoient aussi.
      texte += `\n${texteEnvoye(git(racine, ['diff', '--cached']))}`;
      texte += `\n${texteEnvoye(git(racine, ['diff']))}`;
    }
    if (sousCommande === 'push') {
      const amont = git(racine, ['log', '-p', '--format=%x00%B', '@{upstream}..HEAD']);
      texte += `\n${texteEnvoye(amont || git(racine, ['log', '-p', '--format=%x00%B', '-n', '50']))}`;
    }
  }
  // Fichiers passés en corps (gh … --body-file / -F / --notes-file).
  for (const m of cmd.matchAll(/(?:--body-file|-F|--notes-file)\s+("?)([^\s"]+)\1/g)) {
    const f = path.resolve(cwd, m[2]);
    if (m[2] !== '-' && existsSync(f)) texte += `\n${readFileSync(f, 'utf8')}`;
  }
  const constats = analyser(texte, noms);
  if (constats.length) bloquer(constats, 'la commande ou les modifications envoyées');
  process.exit(0);
}

if (['Write', 'Edit', 'MultiEdit'].includes(outil)) {
  const fichier = params.file_path;
  if (!fichier) process.exit(0);
  const cible = path.resolve(cwd, fichier);
  if (cible === dossier || cible.startsWith(dossier + path.sep)) process.exit(0);
  if (!estDepotCoachRugby(racineGit(path.dirname(cible)))) process.exit(0);
  const texte = [params.content, params.new_string, ...(params.edits || []).map((e) => e.new_string)]
    .filter(Boolean)
    .join('\n');
  const constats = analyser(texte, noms);
  if (constats.length) bloquer(constats, `l'écriture de ${path.basename(cible)} dans le dépôt coach-rugby`);
}
process.exit(0);
