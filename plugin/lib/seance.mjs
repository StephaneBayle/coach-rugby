// Contrôles d'une séance, au-delà du schéma : durées, structure, et surtout
// SÉCURITÉ — chaque bloc respecte les règles de jeu du jour recalculées
// d'après la catégorie la plus jeune du groupe (on ne se fie pas à la copie
// des règles inscrite dans la séance).
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chargerBibliotheque, incompatibilites } from './bibliotheque.mjs';
import { reglesDuJour } from './categories.mjs';
import { controlerSchema } from './terrain.mjs';
import { lireYaml } from './yaml.mjs';

export const TOLERANCE_DUREE_MIN = 5;

// Contexte d'une séance rangée dans <dossier>/<equipe>/seances/<date>/.
export function contexteSeance(fichierSeance) {
  const dossierEquipe = path.resolve(path.dirname(fichierSeance), '..', '..');
  const fe = path.join(dossierEquipe, 'equipe.yaml');
  const dossierSaison = path.dirname(dossierEquipe);
  const fc = path.join(dossierSaison, '.coach-rugby.yaml');
  return {
    dossierEquipe,
    dossierSaison,
    equipe: existsSync(fe) ? lireYaml(fe) : null,
    config: existsSync(fc) ? lireYaml(fc) : null,
  };
}

function exercicesConnus(dossierSaison) {
  const ids = new Set(chargerBibliotheque().map((e) => e.id));
  if (dossierSaison) {
    for (const e of chargerBibliotheque(path.join(dossierSaison, '_bibliotheque-perso', 'exercices'))) ids.add(e.id);
  }
  return ids;
}

export function controlerSeance(seance, { equipe = null, dossierSaison = null, nomDossier = null } = {}) {
  const erreurs = [];
  const total = seance.blocs.reduce((s, b) => s + b.duree_min, 0);
  if (Math.abs(total - seance.duree_min) > TOLERANCE_DUREE_MIN) {
    erreurs.push(`la somme des blocs (${total} min) s'écarte de plus de ${TOLERANCE_DUREE_MIN} min de la durée (${seance.duree_min} min)`);
  }
  const parties = seance.blocs.map((b) => b.partie);
  if (!parties.includes('echauffement')) erreurs.push('aucun bloc d\'échauffement');
  if (!parties.includes('retour-au-calme')) erreurs.push('aucun bloc de retour au calme');
  if (nomDossier && nomDossier !== seance.date) erreurs.push(`date « ${seance.date} » différente du nom du dossier « ${nomDossier} »`);
  if (equipe) {
    if (seance.equipe !== equipe.id) erreurs.push(`équipe « ${seance.equipe} » différente de celle du dossier « ${equipe.id} »`);
    const regles = reglesDuJour({ categories: equipe.categories, pratique: equipe.pratique, date: seance.date });
    if (seance.regles.categorie !== regles.categorie) erreurs.push(`règles établies pour ${seance.regles.categorie}, alors que la catégorie la plus jeune est ${regles.categorie}`);
    seance.blocs.forEach((b, i) => {
      for (const raison of incompatibilites(b, regles)) {
        erreurs.push(`bloc ${i + 1} « ${b.titre} » : ${raison} le ${seance.date} pour ${regles.categorie} (${regles.formes.map((f) => f.libelle).join(' ou ')})`);
      }
    });
  }
  const connus = exercicesConnus(dossierSaison);
  seance.blocs.forEach((b, i) => {
    if (b.exercice && !connus.has(b.exercice)) erreurs.push(`bloc ${i + 1} : exercice « ${b.exercice} » introuvable dans la bibliothèque`);
    if (b.schema) erreurs.push(...controlerSchema(b.schema).map((e) => `bloc ${i + 1} : schéma : ${e}`));
  });
  return erreurs;
}
