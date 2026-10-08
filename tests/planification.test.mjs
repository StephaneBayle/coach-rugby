// Planification : brouillons de cycles et de semaine, contrôles, CLI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { changementsDeForme, controlerCycles, controlerSemaine, lundiDe, proposerCycles, proposerSemaine, publicDe } from '../plugin/lib/planification.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ex = path.join(racine, 'plugin', 'exemples');
const charger = (d, e) => ({ equipe: lireYaml(path.join(ex, d, e, 'equipe.yaml')), saison: lireYaml(path.join(ex, d, e, 'saison.yaml')) });
const m10 = charger('fictif-m10-les-ecureuils', 'm10');
const f3 = charger('fictif-seniors-f3-les-goelands', 'seniors-f3');

test('public : école de rugby ou adultes', () => {
  assert.equal(publicDe(m10.equipe), 'edr');
  assert.equal(publicDe(f3.equipe), 'adultes');
});

test('lundi de la semaine', () => {
  assert.equal(lundiDe('2026-10-14'), '2026-10-12');
  assert.equal(lundiDe('2026-10-12'), '2026-10-12');
  assert.equal(lundiDe('2026-10-18'), '2026-10-12');
});

test('changements de forme de jeu M10 : octobre puis janvier', () => {
  assert.deepEqual(changementsDeForme(m10.equipe, '2026-09-01', '2027-06-30').map((c) => c.date), ['2026-10-01', '2027-01-01']);
});

test('cycles M10 : valides, sans affûtage, passage au rugby éducatif à 7 repéré après la trêve', () => {
  const c = proposerCycles(m10.saison, m10.equipe);
  assert.deepEqual(controlerCycles(c, { saison: m10.saison }), []);
  assert.ok(!c.mesocycles.some((m) => m.intensite === 'affutage'));
  const janvier = c.mesocycles.find((m) => m.debut === '2027-01-04');
  assert.equal(janvier.declencheur, 'changement-forme');
  assert.match(janvier.notes, /Rugby éducatif à 7/);
  assert.ok(c.mesocycles.every((m) => m.phase !== 'intersaison-bilan'));
});

test('cycles F3 : un bloc d\'affûtage de 7 jours se termine sur chaque derby ou match important', () => {
  const c = proposerCycles(f3.saison, f3.equipe);
  assert.deepEqual(controlerCycles(c, { saison: f3.saison }), []);
  const derby = c.mesocycles.find((m) => m.declencheur === 'echeance:2026-10-18');
  assert.deepEqual([derby.debut, derby.fin, derby.intensite], ['2026-10-12', '2026-10-18', 'affutage']);
  const importants = f3.saison.calendrier.filter((e) => ['haute', 'derby'].includes(e.importance)).length;
  assert.equal(c.mesocycles.filter((m) => m.intensite === 'affutage').length, importants);
});

test('semaine F3 du derby : activation à la dernière séance, J-n justes', () => {
  const cycles = proposerCycles(f3.saison, f3.equipe);
  const s = proposerSemaine('2026-10-14', { ...f3, cycles });
  assert.equal(s.debut, '2026-10-12');
  assert.equal(s.mesocycle, cycles.mesocycles.find((m) => m.declencheur === 'echeance:2026-10-18').id);
  assert.deepEqual(s.seances_prevues.map((x) => [x.date, x.j_moins, x.intensite]), [['2026-10-13', 5, 'moyenne'], ['2026-10-15', 3, 'affutage']]);
  assert.deepEqual(controlerSemaine(s, { ...f3, cycles }), []);
});

test('semaine F3 après un match : récupération à J+2', () => {
  const s = proposerSemaine('2026-09-21', { ...f3, cycles: proposerCycles(f3.saison, f3.equipe) });
  assert.equal(s.seances_prevues[0].date, '2026-09-22');
  assert.equal(s.seances_prevues[0].intensite, 'recuperation');
});

test('semaine M10 : séance plaisir avant le plateau, jamais d\'affûtage', () => {
  const cycles = proposerCycles(m10.saison, m10.equipe);
  const avant = proposerSemaine('2026-11-25', { ...m10, cycles });
  assert.deepEqual(avant.seances_prevues.map((x) => [x.date, x.j_moins, x.intensite]), [['2026-11-25', 3, 'moyenne']]);
  const vendredi = { ...m10.equipe, creneaux: [{ jour: 'vendredi', heure: '17:30', duree_min: 60 }] };
  const plaisir = proposerSemaine('2026-11-25', { ...m10, equipe: vendredi, cycles });
  assert.deepEqual(plaisir.seances_prevues.map((x) => [x.date, x.j_moins, x.intensite]), [['2026-11-27', 1, 'legere']]);
  assert.match(plaisir.seances_prevues[0].intention, /plaisir avant le plateau/);
  const s = proposerSemaine('2026-10-14', { ...m10, cycles });
  assert.ok(s.seances_prevues.every((x) => x.intensite !== 'affutage'));
});

test('trêve : aucune séance, et le changement de forme est signalé', () => {
  const s = proposerSemaine('2026-12-28', { ...m10, cycles: proposerCycles(m10.saison, m10.equipe) });
  assert.deepEqual(s.seances_prevues, []);
  assert.ok(s.points_vigilance.some((v) => /2027-01-01/.test(v)));
});

test('contrôles : séance forte à J-2 d\'un derby, chevauchement, affûtage en EDR', () => {
  const s = { equipe: 'seniors-f3', debut: '2026-10-12', theme: 't', echeances: [{ type: 'match', date: '2026-10-18', importance: 'derby' }],
    seances_prevues: [{ date: '2026-10-16', duree_min: 90, intention: 'x', intensite: 'forte' }] };
  assert.match(controlerSemaine(s, f3).join('\n'), /J-2 d'une échéance derby/);
  assert.match(controlerSemaine({ ...s, debut: '2026-10-13' }).join('\n'), /pas un lundi/);
  const edr = { ...s, equipe: 'm10', echeances: [], seances_prevues: [{ date: '2026-10-14', duree_min: 75, intention: 'x', intensite: 'affutage' }] };
  assert.match(controlerSemaine(edr, { equipe: m10.equipe }).join('\n'), /école de rugby/);
  const c = proposerCycles(f3.saison, f3.equipe);
  c.mesocycles[1].debut = c.mesocycles[0].fin;
  assert.match(controlerCycles(c, { saison: f3.saison }).join('\n'), /se chevauchent/);
});

test('exemples : cycles et semaines valides', () => {
  const r = spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), 'valider', ex], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /cycles\.yaml/);
  assert.match(r.stdout, /semaine\.yaml/);
});

test('CLI : planifier et semaine --ecrire créent les fichiers sans jamais écraser', () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-plan-')), 'saisons');
  cpSync(path.join(ex, 'fictif-seniors-f3-les-goelands'), d, { recursive: true });
  const cli = (...a) => spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, COACH_RUGBY_DOSSIER: d } });
  assert.equal(cli('planifier', 'seniors-f3', '--ecrire').status, 1, 'cycles.yaml existe déjà');
  const r = cli('semaine', 'seniors-f3', '--date', '2026-11-04', '--ecrire');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(existsSync(path.join(d, 'seniors-f3', 'semaines', '2026-11-02', 'semaine.yaml')));
  assert.equal(cli('semaine', 'seniors-f3', '--date', '2026-11-04', '--ecrire').status, 1);
  assert.match(cli('semaine', 'seniors-f3', '--date', '2026-10-14').stdout, /affûtage — Activation/);
  assert.match(readFileSync(path.join(d, 'seniors-f3', 'cycles.yaml'), 'utf8'), /EXEMPLE FICTIF/);
});

test('playtest 2 : dans un bloc d\'affûtage, la séance de J-5 a une intention cohérente', () => {
  const s = proposerSemaine('2026-10-14', { ...f3, cycles: proposerCycles(f3.saison, f3.equipe) });
  assert.match(s.seances_prevues[0].intention, /volume réduit, rien de nouveau/);
});

test('playtest 4 : J-n masqué à travers la trêve ou au-delà de 14 jours', () => {
  const s = proposerSemaine('2026-12-14', { ...m10, cycles: proposerCycles(m10.saison, m10.equipe) });
  assert.equal(s.seances_prevues[0].j_moins, null);
});

test('playtest 3 : un tournoi important a son bloc d\'affûtage (adultes)', () => {
  const saison = { ...f3.saison, calendrier: [...f3.saison.calendrier, { date: '2026-11-21', type: 'tournoi', importance: 'haute' }] };
  const c = proposerCycles(saison, f3.equipe);
  const bloc = c.mesocycles.find((m) => m.declencheur === 'echeance:2026-11-21');
  assert.equal(bloc.intensite, 'affutage');
  assert.match(bloc.notes, /Tournoi important/);
});
