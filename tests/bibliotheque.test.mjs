// Bibliothèque d'exercices : validité, sécurité par catégorie, index à jour,
// compatibilité avec les règles du jour.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerBibliotheque, controlerExercice, DOSSIER_BIBLIOTHEQUE, genererIndex, incompatibilites } from '../plugin/lib/bibliotheque.mjs';
import { reglesDuJour } from '../plugin/lib/categories.mjs';
import { validerChemin } from '../plugin/lib/dossier.mjs';
import { valider } from '../plugin/lib/schemas.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exercices = chargerBibliotheque();
const fiche = (id) => exercices.find((e) => e.id === id);

test('40 fiches, toutes valides (schéma, sécurité par catégorie, schéma de terrain, sources)', () => {
  assert.equal(exercices.length, 40);
  const r = validerChemin(DOSSIER_BIBLIOTHEQUE);
  assert.deepEqual(r.flatMap((x) => x.erreurs.map((e) => `${path.basename(x.fichier)} : ${e}`)), []);
});

test('répartition par thème (lot 1, playtests du lot 2, prévention et préparation physique du lot 4)', () => {
  const compte = {};
  for (const e of exercices) compte[e.theme] = (compte[e.theme] || 0) + 1;
  assert.deepEqual(compte, {
    echauffement: 6, 'manipulation-passes': 5, 'jeu-reduit': 4, contact: 4,
    'jeu-au-pied': 2, defense: 2, 'rugby-a-5': 2, 'retour-au-calme': 2,
    prevention: 5, 'preparation-physique': 5, 'test-physique': 3,
  });
});

test('toutes les fiches sont sous CC BY-SA et ont au moins un point de sécurité', () => {
  for (const e of exercices) {
    assert.equal(e.licence, 'CC-BY-SA-4.0', e.id);
    assert.ok(e.securite.length > 0, e.id);
  }
});

test('INDEX.md est à jour', () => {
  const actuel = readFileSync(path.join(racine, 'plugin', 'bibliotheque', 'INDEX.md'), 'utf8');
  assert.equal(actuel, genererIndex(exercices), 'relancer : node plugin/scripts/coach-rugby.mjs index-bibliotheque');
});

test('une fiche à contact plein pour des M6 est refusée', () => {
  const e = { ...fiche('plaquage-educatif-progressif'), categories: ['m6'], contact: 'plein' };
  const erreurs = controlerExercice(e);
  assert.ok(erreurs.some((x) => /m6 : contact « plein » au-delà du maximum « toucher »/.test(x)), erreurs.join('\n'));
  assert.ok(erreurs.some((x) => /m6 : plaquage non permis/.test(x)), erreurs.join('\n'));
});

test('compatibilité selon le mois : chuter en M8 attend le jeu au contact (janvier)', () => {
  const chute = fiche('apprendre-a-chuter');
  assert.notDeepEqual(incompatibilites(chute, reglesDuJour({ categories: ['m8'], date: '2026-11-04' })), []);
  assert.deepEqual(incompatibilites(chute, reglesDuJour({ categories: ['m8'], date: '2027-01-13' })), []);
});

test('le plaquage éducatif est permis en M10 dès octobre (jeu au contact), pas la mêlée', () => {
  const r = reglesDuJour({ categories: ['m10'], date: '2026-10-14' });
  assert.deepEqual(incompatibilites(fiche('plaquage-educatif-progressif'), r), []);
  assert.deepEqual(incompatibilites({ contact: 'plein', exige: ['melee'] }, r), ['contact « plein » au-delà du maximum « plaquage »', 'melee non permis']);
});

test('le gabarit de contribution est une fiche valide', () => {
  const g = lireYaml(path.join(racine, 'plugin', 'gabarits', 'fiche-exercice.exemple.yaml'));
  assert.deepEqual(valider('exercice', g), []);
  assert.deepEqual(controlerExercice(g), []);
});
