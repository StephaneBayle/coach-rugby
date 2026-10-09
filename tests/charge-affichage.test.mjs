// Charge sur la fiche semaine, tableaux de charge et de tests, résumé dans
// statut, relances de charge (lot 4, étape 3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lirePlanification, lireSuivi, suggestions } from '../plugin/lib/etat.mjs';
import { courbeCharge, exporterSemaine, preparerSemaine } from '../plugin/lib/export.mjs';
import { parSemaine } from '../plugin/lib/charge.mjs';
import { tableauCharge, tableauTests } from '../plugin/lib/tableur.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ex = path.join(racine, 'plugin', 'exemples');
const f3 = path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3');
const m10 = path.join(ex, 'fictif-m10-les-ecureuils', 'm10');
const lire = (d, f) => lireYaml(path.join(d, f));
const charge = lire(f3, 'charge.yaml');
const ExcelJS = createRequire(path.join(racine, 'plugin', 'package.json'))('exceljs');
const cli = (env, ...a) => spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, ...env } });
const copie = () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-aff-')), 'Rugby-Saisons');
  cpSync(path.join(ex, 'fictif-seniors-f3-les-goelands'), d, { recursive: true });
  cpSync(m10, path.join(d, 'm10'), { recursive: true });
  return d;
};

test('courbe SVG : 6 semaines, la semaine en cours en noir', () => {
  const svg = courbeCharge(parSemaine(charge), '2026-10-12');
  assert.equal((svg.match(/<rect /g) || []).length, 6);
  assert.match(svg, />2445</);
  assert.match(svg, /fill="#111"[^>]*\/><text[^>]*>1545</);
  assert.match(svg, /aria-label="Charge des 6 dernières semaines"/);
});

test('fiche semaine : section charge (prévu face au réalisé, tendance, repère), jamais de valeur par joueur', () => {
  const semaine = lire(path.join(f3, 'semaines', '2026-10-12'), 'semaine.yaml');
  const d = preparerSemaine(semaine, { equipe: lire(f3, 'equipe.yaml'), saison: lire(f3, 'saison.yaml'), cycles: lire(f3, 'cycles.yaml'), charge });
  assert.match(d.charge, /Charge réalisée/);
  assert.match(d.charge, /Semaine : 1545/);
  assert.match(d.charge, /-19 %/);
  assert.match(d.charge, /5\/10 × 105 min/);
  assert.match(d.charge, /pas des indicateurs médicaux/);
  assert.doesNotMatch(d.charge, /\bJ\d{2}\b/);
  assert.equal(preparerSemaine(semaine, { equipe: lire(f3, 'equipe.yaml'), saison: null, cycles: null }).charge, '', 'sans charge.yaml, pas de section');
  const dir = copie();
  const r = exporterSemaine(path.join(dir, 'seniors-f3', 'semaines', '2026-10-12', 'semaine.yaml'));
  const html = readFileSync(path.join(r.dossier, 'fiche-semaine-telephone.html'), 'utf8');
  assert.match(html, /<svg class="courbe"/);
  assert.doesNotMatch(html, /\{\{|@repeter/);
});

test('tableaux : charge par semaine, par séance, par joueur (16 ans et plus) ; tests par joueur sans classement', () => {
  const [semaines, seances, joueurs] = tableauCharge(charge);
  assert.equal(semaines.lignes.length, 6);
  assert.deepEqual(semaines.lignes.find((l) => l[0] === '2026-10-05').slice(0, 5), ['2026-10-05', 4, 2445, 1720, 42]);
  assert.equal(seances.lignes.length, charge.entrees.length);
  assert.deepEqual(joueurs.lignes.find((l) => l[0] === 'J01'), ['J01', '', 9 * 80]);
  assert.equal(tableauCharge({ entrees: [{ date: '2026-10-13', type: 'seance', duree_min: 60, rpe_groupe: 5 }] }).length, 2, 'pas de feuille par joueur sans RPE individuel');
  const t = tableauTests(lire(f3, 'tests.yaml'));
  assert.deepEqual(t.map((f) => f.nom), ['Sprint 20 m', 'Saut sans élan', 'Course 30-15']);
  assert.deepEqual(t[0].lignes.find((l) => l[0] === 'J09').slice(-2), [0.01, 'stable']);
  assert.ok(!t[0].entetes.some((e) => /rang|classement/i.test(e)));
});

test('CLI tableau : charge en xlsx relu ; tests seulement avec --avec-tests', async () => {
  const d = copie();
  const env = { COACH_RUGBY_DOSSIER: d };
  const r = cli(env, 'tableau', 'charge', 'seniors-f3');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /charge-par-joueur-16-ans-et-plus\.csv/);
  const w = new ExcelJS.Workbook();
  await w.xlsx.readFile(path.join(d, 'seniors-f3', 'exports', 'charge.xlsx'));
  assert.deepEqual(w.worksheets.map((s) => s.name), ['Charge par semaine', 'Séances', 'Par joueur (16 ans et plus)']);
  const refus = cli(env, 'tableau', 'tests', 'seniors-f3');
  assert.equal(refus.status, 1);
  assert.match(refus.stderr, /données personnelles/);
  assert.equal(cli(env, 'tableau', 'tests', 'seniors-f3', '--avec-tests').status, 0);
});

test('statut : résumé de charge, sans bilan trompeur quand rien n\'est noté', () => {
  const env = { COACH_RUGBY_DOSSIER: path.join(ex, 'fictif-seniors-f3-les-goelands') };
  assert.match(cli(env, 'statut', 'seniors-f3', '--date', '2026-10-09').stdout, /Charge : semaine du 2026-10-05 : 2445 \(moyenne des semaines précédentes 1720, \+42 %\)/);
  assert.match(cli(env, 'statut', 'seniors-f3', '--date', '2026-10-20').stdout, /rien de noté cette semaine \(dernière entrée le 2026-10-18\)/);
  assert.doesNotMatch(cli(env, 'statut', 'seniors-f3', '--date', '2026-12-20').stdout, /Charge :/, 'plus de deux semaines sans entrée');
});

test('relances : noter la charge, hausse, programme de trêve, tests physiques', () => {
  const equipe = lire(f3, 'equipe.yaml');
  const saison = lire(f3, 'saison.yaml');
  const suivi = lireSuivi(f3);
  const planification = lirePlanification(f3);
  const codes = (date, s = suivi) => suggestions(saison, date, { equipe, planification, suivi: s }).map((x) => x.code);
  assert.ok(codes('2026-10-09').includes('hausse-charge'));
  assert.ok(!codes('2026-10-14').includes('hausse-charge'));
  const sansDerby = { ...suivi, charge: { ...charge, entrees: charge.entrees.filter((e) => String(e.date) !== '2026-10-18') } };
  const noter = suggestions(saison, '2026-10-19', { equipe, planification, suivi: sansDerby }).find((x) => x.code === 'noter-charge');
  assert.match(noter.message, /2026-10-18/);
  assert.ok(!codes('2026-10-19').includes('noter-charge'));
  const dec = suggestions(saison, '2026-12-03', { equipe, planification, suivi });
  assert.ok(dec.some((x) => x.code === 'programme-treve'));
  assert.doesNotMatch(dec.find((x) => x.code === 'preparer-treve').message, /programme d'entretien/, 'pas de doublon');
  assert.ok(codes('2027-01-06').includes('tests-physiques'));
  assert.ok(!codes('2027-02-15').includes('tests-physiques'), 'plus de 21 jours après le début de la phase');
  const edr = suggestions(lire(m10, 'saison.yaml'), '2026-12-10', { equipe: lire(m10, 'equipe.yaml'), suivi: lireSuivi(m10) }).map((x) => x.code);
  assert.ok(!edr.includes('programme-treve'), "pas de programme hors terrain à l'école de rugby");
});
