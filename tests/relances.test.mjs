// Relances liées à la planification (lot 2), à dates fixées.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { avancement, lirePlanification, suggestions } from '../plugin/lib/etat.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const ex = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'plugin', 'exemples');
const equipe = (d, e) => {
  const dossier = path.join(ex, d, e);
  return { dossier, equipe: lireYaml(path.join(dossier, 'equipe.yaml')), saison: lireYaml(path.join(dossier, 'saison.yaml')), planification: lirePlanification(dossier) };
};
const f3 = equipe('fictif-seniors-f3-les-goelands', 'seniors-f3');
const m10 = equipe('fictif-m10-les-ecureuils', 'm10');
const codes = (x, date, plan = x.planification) => suggestions(x.saison, date, { equipe: x.equipe, planification: plan }).map((s) => s.code);

test('avancement : cycles et semaine reconnus', () => {
  const a = Object.fromEntries(avancement(f3.dossier).map((e) => [e.id, e.fait]));
  assert.equal(a.cycles, true);
  assert.equal(a.semaine, true);
});

test("la veille d'une séance prévue sans séance préparée : seance-a-preparer remplace les relances génériques", () => {
  const c = codes(f3, '2026-10-14');
  assert.ok(c.includes('seance-a-preparer'), c.join(','));
  assert.ok(!c.includes('premiere-seance'));
  assert.ok(!c.includes('fin-mesocycle'), "pas de bilan de cycle pour un bloc d'affûtage");
});

test('semaine sans plan : preparer-semaine ; le vendredi, pour la semaine suivante', () => {
  assert.ok(codes(f3, '2026-10-21').includes('preparer-semaine'));
  const vendredi = suggestions(f3.saison, '2026-10-16', { equipe: f3.equipe, planification: f3.planification }).find((s) => s.code === 'preparer-semaine');
  assert.match(vendredi.message, /semaine prochaine \(du 2026-10-19\)/);
});

test('pas de cycles : planifier-cycles', () => {
  assert.ok(codes(f3, '2026-10-21', { ...f3.planification, cycles: null }).includes('planifier-cycles'));
  assert.ok(!codes(f3, '2026-10-21').includes('planifier-cycles'));
});

test('fin de cycle ordinaire annoncée avec le cycle suivant', () => {
  const s = suggestions(m10.saison, '2026-12-14', { equipe: m10.equipe, planification: m10.planification }).find((x) => x.code === 'fin-mesocycle');
  assert.match(s.message, /se termine\s+le 2026-12-18 ; le suivant : « Trêve »/);
});

test('changement de forme de jeu annoncé 35 jours avant (avant la trêve), pas avant', () => {
  assert.ok(codes(m10, '2026-12-10').includes('changement-forme'), 'cas du playtest 4 : 22 jours avant');
  assert.ok(codes(m10, '2026-11-27').includes('changement-forme'));
  assert.ok(!codes(m10, '2026-11-20').includes('changement-forme'));
  assert.ok(!codes(f3, '2026-12-11').includes('changement-forme'), 'pas de changement de forme en seniors');
});

test('reprise après la trêve', () => {
  assert.ok(codes(f3, '2027-01-06').includes('reprise-apres-treve'));
  assert.ok(!codes(f3, '2027-01-20').includes('reprise-apres-treve'));
});

test('sans lecture du dossier (planification absente), pas de relance de planification', () => {
  const c = suggestions(f3.saison, '2026-10-21', {}).map((s) => s.code);
  assert.ok(!c.some((x) => ['planifier-cycles', 'preparer-semaine', 'seance-a-preparer', 'fin-mesocycle'].includes(x)));
});
