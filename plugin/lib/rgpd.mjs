// Détection des données personnelles de joueurs dans un texte.
//
// N'importe QUE des modules node:* : ce module est chargé par le hook
// garde-rgpd, qui doit fonctionner même sans dépendances installées.
//
// Deux familles de détections :
//   1. les noms protégés (<dossier saison>/.joueurs-proteges.txt), comparés
//      sans tenir compte de la casse, des accents ni de la ponctuation, sur
//      mots entiers ;
//   2. des motifs reconnaissables : téléphone français, adresse e-mail (hors
//      liste blanche), date de naissance, numéro de licence.
//
// Un prénom isolé n'est PAS détectable sans trop de faux positifs : la
// relecture humaine reste nécessaire.
//
// Une ligne qui contient le marqueur « rgpd:fictif » est ignorée : il sert
// aux données de test volontairement fictives (tests, exemples).
import { existsSync, readFileSync } from 'node:fs';

export const MARQUEUR_FICTIF = 'rgpd:fictif';

export function normaliser(texte) {
  return ` ${String(texte)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;
}

export function lireNomsProteges(fichier) {
  if (!fichier || !existsSync(fichier)) return [];
  return readFileSync(fichier, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

const sansLignesFictives = (texte) =>
  String(texte)
    .split('\n')
    .filter((l) => !l.includes(MARQUEUR_FICTIF))
    .join('\n');

const ADRESSES_AUTORISEES = [
  /^noreply@anthropic\.com$/i,
  /@users\.noreply\.github\.com$/i,
  /@example\.(com|org|net|fr)$/i,
];

const MOIS = '(?:janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[ûu]t|septembre|octobre|novembre|d[ée]cembre)';

export const MOTIFS = [
  {
    id: 'telephone',
    libelle: 'numéro de téléphone',
    regex: /(?<![\d.])(?:\+33[\s.-]?|0033[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}(?![\d])/g,
  },
  {
    id: 'email',
    libelle: 'adresse e-mail',
    regex: /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi,
    garder: (m) => !ADRESSES_AUTORISEES.some((r) => r.test(m)),
  },
  {
    id: 'date-de-naissance',
    libelle: 'date de naissance',
    regex: new RegExp(
      `(?:n[ée]e?s?\\s+le|date\\s+de\\s+naissance|naissance|\\bDDN\\b)\\s*:?\\s*(?:\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}|\\d{1,2}(?:er)?\\s+${MOIS}\\s+\\d{4}|\\d{4}-\\d{2}-\\d{2})`,
      'gi',
    ),
  },
  {
    id: 'licence',
    libelle: 'numéro de licence',
    // « licence » suivi d'un identifiant de 6 à 12 caractères contenant un chiffre.
    regex: /\blicen[cs]es?\s+(?:FFR\s+)?(?:n[°o]\.?\s*|num[ée]ro\s*:?\s*|:\s*)?(?=[A-Z0-9]*\d)[A-Z0-9]{6,12}\b/gi,
  },
];

// Renvoie la liste des constats { type, libelle, extrait } (vide si rien).
export function analyser(texte, noms = []) {
  const t = sansLignesFictives(texte);
  const constats = [];
  const tn = normaliser(t);
  for (const n of noms) {
    const motif = normaliser(n);
    if (motif.trim() && tn.includes(motif)) constats.push({ type: 'nom-protege', libelle: 'nom protégé', extrait: n });
  }
  for (const m of MOTIFS) {
    for (const r of t.matchAll(m.regex)) {
      if (m.garder && !m.garder(r[0])) continue;
      constats.push({ type: m.id, libelle: m.libelle, extrait: r[0] });
    }
  }
  return constats;
}

// Message d'explication, sans recopier la donnée détectée en entier.
export function decrire(constats) {
  const masquer = (s) => (s.length <= 4 ? '…' : `${s.slice(0, 3)}…`);
  const parType = new Map();
  for (const c of constats) parType.set(c.libelle, [...(parType.get(c.libelle) || []), masquer(c.extrait)]);
  return [...parType].map(([l, ex]) => `${l} (${ex.length} : ${[...new Set(ex)].slice(0, 3).join(', ')})`).join(' ; ');
}
