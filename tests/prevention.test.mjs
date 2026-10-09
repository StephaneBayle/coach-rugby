// Prévention, préparation physique (terrain et salle), tests physiques,
// programmes hors terrain (lot 4, étape 2) : repères d'âge, aucune donnée
// personnelle, progression sans classement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerBibliotheque, controlerExercice } from '../plugin/lib/bibliotheque.mjs';
import { controlerAccesSalle } from '../plugin/lib/charge.mjs';
import { controlerEquipe } from '../plugin/lib/controles.mjs';
import { validerChemin } from '../plugin/lib/dossier.mjs';
import { chargerProgrammes, controlerProgrammes } from '../plugin/lib/programmes.mjs';
import { controlerTests, progression } from '../plugin/lib/tests-physiques.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ex = path.join(racine, 'plugin', 'exemples');
const f3 = path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3');
const fiche = (id) => chargerBibliotheque().find((e) => e.id === id);
const cli = (env, ...a) => spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, ...env } });
const copie = () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-prev-')), 'Rugby-Saisons');
  cpSync(path.join(ex, 'fictif-seniors-f3-les-goelands'), d, { recursive: true });
  cpSync(path.join(ex, 'fictif-m10-les-ecureuils', 'm10'), path.join(d, 'm10'), { recursive: true });
  return d;
};

test("fiches de salle : pas avant M14, charges progressives à partir de M19, encadrement des moins de 16 ans", () => {
  const force = fiche('salle-circuit-force-rugby');
  assert.deepEqual(controlerExercice(force), []);
  assert.match(controlerExercice({ ...force, categories: ['m16'] }).join(), /charges progressives réservées aux 16 ans et plus/);
  const technique = fiche('salle-apprentissage-mouvements');
  assert.match(controlerExercice({ ...technique, categories: ['m12'] }).join(), /pas de salle de musculation avant M14/);
  assert.match(controlerExercice({ ...technique, securite: ['Pas à J-2'] }).join(), /encadrée par un adulte/);
  assert.match(controlerExercice({ ...fiche('test-sprint-20m'), categories: ['m16', 'm19'] }).join(), /tests physiques réservés aux 16 ans et plus/);
});

test('les échauffements préventifs citent Activate sans le reproduire, et toutes les nouvelles fiches restent sans contact', () => {
  for (const id of ['echauffement-preventif-edr', 'echauffement-preventif-jeunes', 'echauffement-preventif-adultes', 'echauffement-jour-de-match']) {
    assert.ok(fiche(id).sources.includes('world-rugby-activate'), id);
  }
  for (const e of chargerBibliotheque().filter((x) => ['prevention', 'preparation-physique', 'test-physique'].includes(x.theme))) assert.equal(e.contact, 'aucun', e.id);
});

test("salle de la structure : refusée à l'école de rugby, encadrement obligatoire avec des moins de 16 ans", () => {
  const salle = { disponible: true };
  assert.match(controlerEquipe({ id: 'm12', categories: ['m12'], salle }).join(), /pas avant M14/);
  assert.match(controlerEquipe({ id: 'm15', categories: ['m16'], salle }).join(), /indiquer qui encadre/);
  assert.deepEqual(controlerEquipe({ id: 'm15', categories: ['m16'], salle: { ...salle, encadrement: 'preparateur-physique' } }), []);
  assert.deepEqual(validerChemin(path.join(f3, 'equipe.yaml')).flatMap((x) => x.erreurs), []);
});

test('accès individuel à une salle : noté par code seulement pour les 16 ans et plus', () => {
  const effectif = { joueurs: [{ code: 'J01', disponible: true, acces_salle: true }] };
  assert.match(controlerAccesSalle(effectif, { categories: ['m16'] }).join(), /J01 : « accès salle » noté seulement pour les 16 ans et plus/);
  assert.deepEqual(controlerAccesSalle(effectif, { categories: ['seniors'] }), []);
  assert.deepEqual(validerChemin(path.join(f3, 'effectif.yaml')).flatMap((x) => x.erreurs), []);
});

test('tests physiques : 16 ans et plus, test connu, pas de doublon', () => {
  const r = { date: '2026-09-01', test: 'sprint-20m', code: 'J01', valeur: 3.2 };
  assert.match(controlerTests({ resultats: [r] }, { equipe: { categories: ['m16'] } }).join(), /réservés aux 16 ans et plus/);
  assert.match(controlerTests({ resultats: [{ ...r, test: 'bip-test' }] }).join(), /test inconnu/);
  assert.match(controlerTests({ resultats: [r, r] }).join(), /deux résultats/);
  assert.deepEqual(validerChemin(path.join(f3, 'tests.yaml')).flatMap((x) => x.erreurs), []);
});

test("progression : chaque joueur face à lui-même, « stable » dans la marge de mesure, jamais de classement", () => {
  const p = progression(lireYaml(path.join(f3, 'tests.yaml')));
  assert.deepEqual(p['sprint-20m'].J01, { premier: { date: '2026-07-20', valeur: 3.31 }, dernier: { date: '2026-09-01', valeur: 3.24 }, evolution: -0.07, mieux: true });
  assert.equal(p['sprint-20m'].J09.mieux, null, '+0,01 s : stable');
  assert.equal(p['saut-longueur'].J11.mieux, null, '-1 cm : stable');
  assert.equal(p['course-30-15'].J15.mieux, true);
  assert.ok(!('rang' in p['sprint-20m'].J01));
});

test('programmes hors terrain : valides, cohérents avec les fiches et les âges, sans aucune donnée personnelle', () => {
  const ref = chargerProgrammes();
  assert.deepEqual(controlerProgrammes(ref), []);
  const casse = structuredClone(ref);
  casse.programmes.find((p) => p.id === 'salle-technique-jeunes').securite = ['Pas à J-2'];
  assert.match(controlerProgrammes(casse).join(), /sans mention d'encadrement/);
  casse.programmes[0].fiches.push('fiche-inexistante');
  assert.match(controlerProgrammes(casse).join(), /fiche inconnue/);
  assert.deepEqual(validerChemin(path.join(racine, 'plugin', 'references', 'programmes-hors-terrain.yaml')).flatMap((x) => x.erreurs), []);
});

test('CLI : export des programmes (aucun code de joueur) et saisie des tests (refusée sous 16 ans, rien de gardé)', () => {
  const d = copie();
  const env = { COACH_RUGBY_DOSSIER: d };
  for (const p of chargerProgrammes().programmes) {
    const r = cli(env, 'exporter', 'programme', p.id);
    assert.equal(r.status, 0, r.stdout + r.stderr);
  }
  const dossier = path.join(d, '_programmes', 'exports');
  for (const f of readdirSync(dossier)) {
    const html = readFileSync(path.join(dossier, f), 'utf8');
    assert.doesNotMatch(html, /\bJ\d{2,3}\b/, f);
    assert.doesNotMatch(html, /\{\{|@repeter/, f);
  }
  assert.match(readFileSync(path.join(dossier, 'programme-salle-technique-jeunes-a4.html'), 'utf8'), /toujours avec un adulte formé qui encadre/);
  const ok = cli(env, 'tests', 'seniors-f3', '--date', '2026-12-01', '--test', 'saut-longueur', '--resultats', 'J01=235,j09=251');
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(cli(env, 'tests', 'seniors-f3', '--bilan').stdout, /J01 : 221 \(2026-07-20\) → 235 \(2026-12-01\), \+14 — progrès/);
  const refus = cli(env, 'tests', 'm10', '--date', '2026-12-01', '--test', 'sprint-20m', '--resultats', 'J01=4.1');
  assert.equal(refus.status, 1);
  assert.ok(!existsSync(path.join(d, 'm10', 'tests.yaml')));
});
