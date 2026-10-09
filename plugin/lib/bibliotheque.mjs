// Bibliothèque d'exercices : chargement, contrôles de sécurité et de
// cohérence, compatibilité avec les règles du jour, index Markdown.
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parametresCharge } from './charge.mjs';
import { chargerCategories, niveauContact } from './categories.mjs';
import { RACINE_PLUGIN } from './deps.mjs';
import { controlerSchema } from './terrain.mjs';
import { lireYaml } from './yaml.mjs';

export const DOSSIER_BIBLIOTHEQUE = path.join(RACINE_PLUGIN, 'bibliotheque', 'exercices');

export const THEMES = {
  echauffement: 'Échauffement et activation',
  'manipulation-passes': 'Passes et manipulation',
  'jeu-reduit': 'Jeux réduits',
  contact: 'Contact progressif',
  'jeu-au-pied': 'Jeu au pied',
  defense: 'Placement défensif',
  'rugby-a-5': 'Rugby à 5 et loisir',
  'retour-au-calme': 'Retour au calme',
  prevention: 'Prévention (échauffements préventifs)',
  'preparation-physique': 'Préparation physique (terrain, salle, domicile)',
  'test-physique': 'Tests physiques (16 ans et plus)',
};

export function chargerBibliotheque(dossier = DOSSIER_BIBLIOTHEQUE) {
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => ({ fichier: path.join(dossier, f), ...lireYaml(path.join(dossier, f)) }));
}

// Ce qu'une catégorie permet au plus fort de sa saison (toutes formes et
// tous mois confondus) : un exercice qui dépasse ne peut jamais lui convenir.
export function maximumDeSaison(categorie, ref = chargerCategories()) {
  const formes = new Set(ref.categories[categorie].calendrier_formes.valeur.flatMap((p) => p.formes));
  const details = [...formes].map((f) => ref.formes[f]);
  const max = details.reduce((a, f) => Math.max(a, niveauContact(f.contact_max, ref)), 0);
  return {
    contact_max: ref.niveaux_contact[max],
    plaquage: details.some((f) => f.plaquage),
    melee: details.some((f) => f.melee),
    touche: details.some((f) => f.touche),
    ruck: details.some((f) => f.ruck),
  };
}

// L'exercice respecte-t-il des règles (du jour ou de saison) ? Renvoie la
// liste des raisons d'incompatibilité (vide si compatible).
export function incompatibilites(exercice, regles, ref = chargerCategories()) {
  const raisons = [];
  if (niveauContact(exercice.contact, ref) > niveauContact(regles.contact_max, ref)) {
    raisons.push(`contact « ${exercice.contact} » au-delà du maximum « ${regles.contact_max} »`);
  }
  for (const e of exercice.exige || []) if (!regles[e]) raisons.push(`${e} non permis`);
  return raisons;
}

export function controlerExercice(exercice, { ref = chargerCategories(), sources = new Set() } = {}) {
  const erreurs = [];
  const nom = path.basename(exercice.fichier || '', '.yaml');
  if (exercice.fichier && exercice.id !== nom) erreurs.push(`id « ${exercice.id} » différent du nom du fichier « ${nom} »`);
  if (exercice.effectif.min > exercice.effectif.max) erreurs.push('effectif : min supérieur à max');
  for (const c of exercice.categories) {
    for (const raison of incompatibilites(exercice, maximumDeSaison(c, ref), ref)) erreurs.push(`catégorie ${c} : ${raison} (sur toute la saison)`);
  }
  // Salle et charges selon l'âge (references/parametres-charge.yaml, section salle).
  const salle = parametresCharge().salle;
  const ordre = (c) => ref.categories[c].ordre;
  const minTechnique = Math.min(...salle.technique.categories.map(ordre));
  for (const c of exercice.categories) {
    if (exercice.lieu === 'salle' && ordre(c) < minTechnique) erreurs.push(`catégorie ${c} : pas de salle de musculation avant ${salle.technique.categories[0].toUpperCase()} (poids du corps seulement)`);
    if (exercice.charge_externe === 'progressive' && !salle.charges.categories.includes(c)) erreurs.push(`catégorie ${c} : charges progressives réservées aux 16 ans et plus (${salle.charges.categories.join(', ')})`);
    if (exercice.charge_externe === 'legere' && ordre(c) < minTechnique) erreurs.push(`catégorie ${c} : charges légères pas avant ${salle.technique.categories[0].toUpperCase()}`);
  }
  if ((exercice.lieu === 'salle' || exercice.charge_externe === 'legere') && exercice.categories.some((c) => salle.technique.categories.includes(c))
      && !exercice.securite.some((s) => /encadr/i.test(s))) erreurs.push('salle ou charges avec des moins de 16 ans : la sécurité doit dire que la séance est encadrée par un adulte');
  if (exercice.theme === 'test-physique' && exercice.categories.some((c) => !parametresCharge().publics.individuel.categories.includes(c))) erreurs.push('tests physiques réservés aux 16 ans et plus');
  const { longueur, largeur } = exercice.schema.surface;
  if (Math.abs(longueur - exercice.espace.longueur) > 0.01 || Math.abs(largeur - exercice.espace.largeur) > 0.01) {
    erreurs.push('les dimensions du schéma diffèrent de celles de l\'espace');
  }
  erreurs.push(...controlerSchema(exercice.schema).map((e) => `schéma : ${e}`));
  const refs = [...(exercice.sources || []), ...(exercice.pour_aller_plus_loin || []).map((p) => p.source)];
  for (const s of refs) if (sources.size && !sources.has(s)) erreurs.push(`source inconnue : ${s} (absente de sources.yaml)`);
  return erreurs;
}

const LIBELLE_CONTACT = { aucun: 'aucun', toucher: 'toucher', 'contact-progressif': 'progressif', plaquage: 'plaquage', plein: 'plein' };

export function genererIndex(exercices) {
  const lignes = [
    '# Bibliothèque d\'exercices',
    '',
    '<!-- Fichier généré par « coach-rugby.mjs index-bibliotheque » : ne pas modifier à la main. -->',
    '',
    `${exercices.length} fiches originales sous licence CC BY-SA 4.0. Chaque fiche`,
    'précise les catégories visées et son niveau de contact ; la séance vérifie',
    'en plus les règles de jeu du mois (`references/categories.yaml`).',
    '',
  ];
  for (const [theme, titre] of Object.entries(THEMES)) {
    const liste = exercices.filter((e) => e.theme === theme);
    if (!liste.length) continue;
    lignes.push(`## ${titre}`, '', '| Fiche | Catégories | Contact | Durée | Joueurs |', '|---|---|---|---|---|');
    for (const e of liste) {
      lignes.push(`| [${e.titre}](exercices/${e.id}.yaml) | ${e.categories.map((c) => c.toUpperCase()).join(', ')} | ${LIBELLE_CONTACT[e.contact]} | ${e.duree_min} min | ${e.effectif.min}–${e.effectif.max} |`);
    }
    lignes.push('');
  }
  return lignes.join('\n');
}
