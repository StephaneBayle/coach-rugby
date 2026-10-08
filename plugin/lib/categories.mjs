// Règles de jeu applicables à une équipe à une date donnée, d'après les
// paramètres datés de references/categories.yaml. Aucune valeur
// réglementaire n'est écrite ici : tout vient du fichier de références.
import path from 'node:path';
import { RACINE_PLUGIN } from './deps.mjs';
import { mois } from './dates.mjs';
import { lireYaml } from './yaml.mjs';

let cache;

export function chargerCategories() {
  cache ??= lireYaml(path.join(RACINE_PLUGIN, 'references', 'categories.yaml'));
  return cache;
}

// Forme associée à la pratique d'une équipe hors école de rugby.
const FORME_DE_PRATIQUE = { xv: 'xv', x: 'x', 7: 'sevens', 5: 'rugby-a-5', loisir: 'rugby-a-5' };

export function niveauContact(niveau, ref = chargerCategories()) {
  const i = ref.niveaux_contact.indexOf(niveau);
  if (i < 0) throw new Error(`Niveau de contact inconnu : ${niveau}`);
  return i;
}

// La catégorie la plus jeune d'un groupe fixe les règles (entraînement
// inter-âges : forme de la catégorie la plus jeune).
export function categorieLaPlusJeune(categories, ref = chargerCategories()) {
  return [...categories].sort((a, b) => ref.categories[a].ordre - ref.categories[b].ordre)[0];
}

// Règles du jour : formes autorisées, contact maximal, permissions
// (plaquage, mêlée, touche, ruck), avec statut et source.
export function reglesDuJour({ categories, pratique = 'ecole-de-rugby', date }, ref = chargerCategories()) {
  const categorie = categorieLaPlusJeune(categories, ref);
  const cat = ref.categories[categorie];
  const m = mois(date);
  const periode = cat.calendrier_formes.valeur.find((p) => p.mois.includes(m));
  if (!periode) throw new Error(`Aucune forme de jeu définie pour ${categorie} au mois ${m}`);
  let formes = periode.formes;
  if (!cat.ecole_de_rugby) {
    const voulue = FORME_DE_PRATIQUE[pratique];
    if (voulue && formes.includes(voulue)) formes = [voulue];
    else formes = [formes[0]];
  }
  const details = formes.map((f) => ({ id: f, ...ref.formes[f] }));
  const max = details.reduce((a, f) => Math.max(a, niveauContact(f.contact_max, ref)), 0);
  const permis = (cle) => details.some((f) => f[cle]);
  return {
    categorie,
    libelle: cat.libelle,
    ecole_de_rugby: cat.ecole_de_rugby,
    formes: details.map(({ id, libelle, effectif }) => ({ id, libelle, effectif })),
    contact_max: ref.niveaux_contact[max],
    plaquage: permis('plaquage'),
    melee: permis('melee'),
    touche: permis('touche'),
    ruck: permis('ruck'),
    note: periode.note,
    statut: cat.calendrier_formes.statut,
    source: cat.calendrier_formes.source,
    page: cat.calendrier_formes.page,
    saison: ref.saison,
    avertissement: ref.avertissement,
    duree_seance_conseillee_min: cat.duree_seance_conseillee_min,
    encadrement: cat.encadrement,
    regles_transverses: (ref.regles_transverses || []).filter((r) => !r.concerne || r.concerne.includes(categorie)),
  };
}
