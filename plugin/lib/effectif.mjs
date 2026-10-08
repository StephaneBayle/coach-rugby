// Effectif en codes, table locale des prénoms, présences et progrès.
//
// RGPD : les fichiers de l'équipe ne contiennent que des codes (J01…). Les
// prénoms ne vivent que dans <equipe>/.prenoms.yaml, sur le poste du coach.
// Ce module est le SEUL à lire cette table ; les exports ne l'appellent
// jamais. La lecture de la table n'utilise que des modules node:* : la garde
// RGPD (hook sans dépendance) s'en sert aussi.
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const FICHIER_PRENOMS = '.prenoms.yaml';
const LIGNE = /^\s*(J\d{2,3})\s*:\s*["']?(.+?)["']?\s*$/;

// { J01: 'Prénom', … } pour une équipe (vide si pas de table).
export function lirePrenoms(dossierEquipe) {
  const f = path.join(dossierEquipe, FICHIER_PRENOMS);
  if (!existsSync(f)) return {};
  const table = {};
  for (const l of readFileSync(f, 'utf8').split('\n')) {
    if (l.trim().startsWith('#')) continue;
    const m = LIGNE.exec(l);
    if (m) table[m[1]] = m[2];
  }
  return table;
}

// Tous les prénoms de toutes les équipes d'un dossier saison.
export function prenomsDuDossier(dossierSaison) {
  if (!existsSync(dossierSaison)) return [];
  const noms = new Set();
  for (const d of readdirSync(dossierSaison)) {
    const e = path.join(dossierSaison, d);
    if (d.startsWith('.') || !statSync(e).isDirectory()) continue;
    for (const p of Object.values(lirePrenoms(e))) noms.add(p);
  }
  return [...noms];
}

// Ajoute à .joueurs-proteges.txt les prénoms des tables qui n'y sont pas
// encore. Renvoie la liste des prénoms ajoutés.
export function synchroniserProteges(dossierSaison) {
  const fichier = path.join(dossierSaison, '.joueurs-proteges.txt');
  const deja = existsSync(fichier)
    ? new Set(readFileSync(fichier, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')))
    : new Set();
  const nouveaux = prenomsDuDossier(dossierSaison).filter((p) => !deja.has(p));
  if (nouveaux.length) appendFileSync(fichier, `${existsSync(fichier) ? '' : '# Joueurs protégés — coach-rugby\n'}${nouveaux.join('\n')}\n`);
  return nouveaux;
}

// Écrit (ou complète) la table des prénoms. Les codes existants sont gardés.
export function ecrirePrenoms(dossierEquipe, ajouts) {
  const table = { ...lirePrenoms(dossierEquipe), ...ajouts };
  const lignes = [
    '# Prénoms des joueurs — reste sur votre ordinateur, jamais publié ni exporté.',
    '# Une ligne par joueur : code: Prénom',
    ...Object.keys(table).sort().map((c) => `${c}: ${table[c]}`),
  ];
  writeFileSync(path.join(dossierEquipe, FICHIER_PRENOMS), `${lignes.join('\n')}\n`);
  return table;
}

export function prochainCode(codes) {
  const n = codes.map((c) => Number(c.slice(1))).reduce((a, b) => Math.max(a, b), 0) + 1;
  return `J${String(n).padStart(2, '0')}`;
}

// Taux de présence par code sur une liste de dates (presences.yaml).
export function tauxDePresence(effectif, presences) {
  const actifs = effectif.joueurs.filter((j) => j.actif !== false).map((j) => j.code);
  const dates = presences.dates;
  return Object.fromEntries(actifs.map((c) => {
    const n = dates.filter((d) => d.presents.includes(c)).length;
    return [c, { presents: n, total: dates.length, taux: dates.length ? Math.round((100 * n) / dates.length) : null }];
  }));
}

// Codes absents (ni présents ni excusés) aux `n` dernières dates.
export function absencesRepetees(effectif, presences, n = 3) {
  const dernieres = [...presences.dates].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-n);
  if (dernieres.length < n) return [];
  return effectif.joueurs
    .filter((j) => j.actif !== false)
    .map((j) => j.code)
    .filter((c) => dernieres.every((d) => !d.presents.includes(c) && !(d.excuses || []).includes(c)));
}

// Contrôles de cohérence entre fichiers de l'équipe.
export function controlerCodes(codes, effectif, contexte) {
  const connus = new Set((effectif?.joueurs || []).map((j) => j.code));
  if (!effectif) return [`${contexte} : effectif.yaml introuvable pour vérifier les codes`];
  return [...new Set(codes)].filter((c) => !connus.has(c)).map((c) => `${contexte} : code ${c} absent de effectif.yaml`);
}
