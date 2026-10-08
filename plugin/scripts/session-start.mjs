#!/usr/bin/env node
// Hook SessionStart, au mieux de ses moyens et silencieux quand il n'a rien
// d'utile à dire :
//   1. installe les dépendances de l'outillage en secours, dans
//      ${CLAUDE_PLUGIN_DATA}, si l'installation automatique de Claude Code ne
//      les a pas mises à côté du plugin ;
//   2. donne une ligne par équipe (phase, semaine, prochaine échéance), pour
//      que Claude puisse relancer le coach au bon moment ;
//   3. prévient si le dossier saison est dans un dépôt git.
//
// N'importe QUE des modules node:* : l'outillage (yaml, ajv) n'est appelé que
// par un sous-processus, dont l'échec est ignoré.
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dossierSaison, racineGit } from '../lib/chemins.mjs';
import { synchroniserProteges } from '../lib/effectif.mjs';

const racine = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const donnees = process.env.CLAUDE_PLUGIN_DATA;
const messages = [];

// 1. Dépendances de secours.
const aCote = existsSync(path.join(racine, 'node_modules', 'yaml'));
if (!aCote && donnees && path.basename(donnees).startsWith('coach-rugby')) {
  const source = path.join(racine, 'package.json');
  const cible = path.join(donnees, 'package.json');
  const lire = (f) => (existsSync(f) ? readFileSync(f, 'utf8') : '');
  if (existsSync(source) && (lire(source) !== lire(cible) || !existsSync(path.join(donnees, 'node_modules', 'yaml')))) {
    try {
      mkdirSync(donnees, { recursive: true });
      copyFileSync(source, cible);
      const verrou = path.join(racine, 'package-lock.json');
      if (existsSync(verrou)) copyFileSync(verrou, path.join(donnees, 'package-lock.json'));
      const commande = existsSync(verrou) ? ['ci', '--omit=dev'] : ['install', '--omit=dev'];
      execFileSync('npm', [...commande, '--no-audit', '--no-fund', '--silent'], { cwd: donnees, stdio: ['ignore', 'ignore', 'pipe'], timeout: 90_000 });
    } catch {
      // Retirer la copie pour réessayer à la prochaine session. Pas de
      // message : les skills basculent d'eux-mêmes sur le chemin manuel.
      rmSync(cible, { force: true });
    }
  }
}

// 2. Prénoms des tables d'équipe ajoutés aux joueurs protégés, puis une
//    ligne par équipe.
const dossier = dossierSaison();
try {
  synchroniserProteges(dossier);
} catch {
  // dossier absent ou illisible : rien à protéger
}
if (existsSync(path.join(dossier, '.coach-rugby.yaml'))) {
  const r = spawnSync(process.execPath, [path.join(racine, 'scripts', 'coach-rugby.mjs'), 'statut', '--json'], {
    encoding: 'utf8',
    timeout: 15_000,
    env: { ...process.env, COACH_RUGBY_DOSSIER: dossier },
  });
  if (r.status === 0) {
    try {
      const { equipes } = JSON.parse(r.stdout);
      for (const e of equipes) {
        const s = e.situation;
        if (!s) {
          messages.push(`coach-rugby — ${e.nom} : saison non cadrée (/coach-rugby:saison).`);
          continue;
        }
        const p = s.prochain ? `, prochaine échéance ${s.prochain.type} le ${s.prochain.date} (J-${s.prochain.j_moins})` : '';
        const sg = (e.suggestions || []).map((x) => x.code).join(', ');
        messages.push(`coach-rugby — ${e.nom} : ${s.phase ? s.phase.id : 'hors saison'}${s.semaine ? `, semaine ${s.semaine}` : ''}${p}${sg ? ` ; relances possibles : ${sg}` : ''}.`);
      }
    } catch {
      // sortie inattendue : se taire
    }
  }
}

// 3. Dossier saison dans un dépôt git.
const git = existsSync(dossier) ? racineGit(dossier) : null;
if (git) {
  messages.push(`coach-rugby : attention, le dossier saison (${dossier}) est dans un dépôt git (${git}) — les données des joueurs pourraient être publiées par erreur. Proposer au coach de le déplacer.`);
}

if (messages.length) console.log(messages.join('\n'));
