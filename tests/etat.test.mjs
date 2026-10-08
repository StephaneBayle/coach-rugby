// Position dans la saison, relances proactives et règles de jeu du jour.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reglesDuJour } from '../plugin/lib/categories.mjs';
import { aujourdhui } from '../plugin/lib/dates.mjs';
import { situer, suggestions } from '../plugin/lib/etat.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const ex = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'plugin', 'exemples');
const seniors = lireYaml(path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3', 'saison.yaml'));
const m10 = lireYaml(path.join(ex, 'fictif-m10-les-ecureuils', 'm10', 'saison.yaml'));
const codes = (l) => l.map((s) => s.code);

test('championnat : phase, semaine et prochaine échéance', () => {
  const s = situer(seniors, '2026-10-14');
  assert.equal(s.phase.id, 'phase-aller');
  assert.equal(s.semaine, 14);
  assert.equal(s.prochain.date, '2026-10-18');
  assert.equal(s.prochain.j_moins, 4);
  assert.equal(s.prochain.importance, 'derby');
});

test('semaine 1 = premier jour de la reprise ; avant la reprise, pas de semaine', () => {
  assert.equal(situer(seniors, '2026-07-13').semaine, 1);
  assert.equal(situer(seniors, '2026-07-19').semaine, 1);
  assert.equal(situer(seniors, '2026-07-20').semaine, 2);
  assert.equal(situer(seniors, '2026-06-15').semaine, null);
});

test("relances : affûtage avant un derby, préparation de la trêve, séance à prévoir", () => {
  assert.deepEqual(codes(suggestions(seniors, '2026-10-14')), ['affutage', 'premiere-seance']);
  const avantTreve = codes(suggestions(seniors, '2026-12-05', { derniereSeance: '2026-12-03' }));
  assert.deepEqual(avantTreve, ['affutage', 'preparer-treve']);
  assert.deepEqual(codes(suggestions(seniors, '2026-12-20')), ['bilan-mi-saison']);
  assert.deepEqual(codes(suggestions(seniors, '2026-11-20', { derniereSeance: '2026-11-05' })), ['relance-seance']);
  for (const s of suggestions(seniors, '2026-10-14')) assert.equal(s.statut, 'hypothese');
});

test('plateaux : relance logistique à J-10 et moins', () => {
  assert.equal(situer(m10, '2026-10-08').phase.id, 'plateaux-automne');
  assert.ok(codes(suggestions(m10, '2026-10-08')).includes('logistique-plateau'));
  assert.ok(!codes(suggestions(m10, '2026-09-20')).includes('logistique-plateau'));
});

test("règles M10 selon le mois (Cahier EDR 2026-2027) : T+2/JCO, JCO, puis rugby éducatif à 7", () => {
  const r = (date) => reglesDuJour({ categories: ['m10'], date });
  assert.deepEqual(r('2026-09-15').formes.map((f) => f.id), ['toucher-2s', 'jeu-au-contact']);
  assert.equal(r('2026-11-15').contact_max, 'plaquage');
  assert.equal(r('2026-11-15').melee, false);
  assert.equal(r('2027-02-10').formes[0].id, 'rugby-educatif-7');
  assert.equal(r('2027-02-10').ruck, true);
  assert.equal(r('2027-02-10').statut, 'a-verifier');
  assert.equal(r('2027-02-10').source, 'ffr-cahier-edr-2026-2027');
});

test('groupe mêlant des âges : la catégorie la plus jeune fixe les règles', () => {
  const r = reglesDuJour({ categories: ['m12', 'm10'], date: '2026-12-10' });
  assert.equal(r.categorie, 'm10');
  assert.equal(r.melee, false);
});

test('M8 en T+2 jusqu\'en décembre : contact limité au toucher', () => {
  assert.equal(reglesDuJour({ categories: ['m8'], date: '2026-11-04' }).contact_max, 'toucher');
  assert.equal(reglesDuJour({ categories: ['m8'], date: '2027-01-13' }).plaquage, true);
});

test('hors école de rugby, la pratique choisit la forme', () => {
  assert.equal(reglesDuJour({ categories: ['seniors'], pratique: '5', date: '2026-12-10' }).contact_max, 'toucher');
  assert.equal(reglesDuJour({ categories: ['seniors'], pratique: 'xv', date: '2026-12-10' }).formes[0].id, 'xv');
});

test('COACH_RUGBY_AUJOURDHUI fixe la date du jour', () => {
  assert.equal(aujourdhui({ COACH_RUGBY_AUJOURDHUI: '2026-12-20' }).toISOString().slice(0, 10), '2026-12-20');
});
