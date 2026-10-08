// Relances du suivi (lot 3) : préparer et débriefer un match, absences
// répétées, point sur les progrès. À dates fixées, en codes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { avancement, lireSuivi, suggestions } from '../plugin/lib/etat.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const ex = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'plugin', 'exemples');
const equipe = (d, e) => {
  const dossier = path.join(ex, d, e);
  return { dossier, equipe: lireYaml(path.join(dossier, 'equipe.yaml')), saison: lireYaml(path.join(dossier, 'saison.yaml')), suivi: lireSuivi(dossier) };
};
const f3 = equipe('fictif-seniors-f3-les-goelands', 'seniors-f3');
const m10 = equipe('fictif-m10-les-ecureuils', 'm10');
const relances = (x, date, suivi = x.suivi) => suggestions(x.saison, date, { equipe: x.equipe, suivi });
const codes = (...a) => relances(...a).map((s) => s.code);

test('avancement : effectif et match reconnus', () => {
  const a = Object.fromEntries(avancement(m10.dossier).map((e) => [e.id, e.fait]));
  assert.equal(a.effectif, true);
  assert.equal(a.match, true);
});

test('preparer-match à J-3 sans match.yaml, remplace la logistique du plateau', () => {
  const sans = { ...m10.suivi, matchs: {} };
  const c = codes(m10, '2026-10-14', sans);
  assert.ok(c.includes('preparer-match'), c.join(','));
  assert.ok(!c.includes('logistique-plateau'));
  assert.match(relances(m10, '2026-10-14', sans).find((s) => s.code === 'preparer-match').message, /rotation du temps de jeu/);
  assert.ok(!codes(m10, '2026-10-14').includes('preparer-match'), 'match.yaml déjà préparé');
  assert.ok(!codes(m10, '2026-10-12', sans).includes('preparer-match'), 'pas avant J-3');
  const derby = relances(f3, '2026-10-16', { ...f3.suivi, matchs: {} }).find((s) => s.code === 'preparer-match');
  assert.match(derby.message, /contre RC Voisinville .*la composition/);
});

test('debriefer-match de 1 à 7 jours après, sauf débriefing déjà noté', () => {
  assert.ok(codes(m10, '2026-10-18').includes('debriefer-match'), 'plateau sans débriefing');
  assert.match(relances(m10, '2026-10-18').find((s) => s.code === 'debriefer-match').message, /faire le bilan/);
  assert.ok(!codes(m10, '2026-10-25').includes('debriefer-match'), 'plus de 7 jours');
  assert.ok(!codes(f3, '2026-10-19').includes('debriefer-match'), 'derby déjà débriefé');
  assert.match(relances(f3, '2026-10-19', { ...f3.suivi, matchs: {} }).find((s) => s.code === 'debriefer-match').message, /statistiques/);
});

test('absences répétées : en codes, sans motif', () => {
  const s = relances(m10, '2026-10-15').find((x) => x.code === 'absences-repetees');
  assert.match(s.message, /J15/);
  assert.match(s.message, /sans demander de motif/);
  assert.ok(!codes(f3, '2026-10-15').includes('absences-repetees'), 'pas de présences en F3');
});

test('point-progres après 6 semaines sans observation', () => {
  assert.ok(!codes(m10, '2026-11-10').includes('point-progres'));
  assert.ok(codes(m10, '2026-11-20').includes('point-progres'));
});

test('toutes les relances du suivi sont des hypothèses, en codes', () => {
  for (const d of ['2026-10-15', '2026-10-18', '2026-11-20']) for (const s of relances(m10, d)) {
    assert.equal(s.statut, 'hypothese');
    assert.doesNotMatch(s.message, /prénom/i);
  }
});
