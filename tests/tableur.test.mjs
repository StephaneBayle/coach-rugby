// Tableaux (CSV, xlsx), fiche match et feuille de présence : lisibles, et
// toujours en codes, même quand la table des prénoms existe.
//
// Les prénoms de test sont assemblés par concaténation : le code source ne
// contient ainsi aucun prénom « en clair ».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ecrirePrenoms } from '../plugin/lib/effectif.mjs';
import { exporterFeuillePresence, exporterMatch } from '../plugin/lib/export.mjs';
import { ecrireCsv, tableauPresences, tableauTempsDeJeu } from '../plugin/lib/tableur.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ex = path.join(racine, 'plugin', 'exemples');
const ExcelJS = createRequire(path.join(racine, 'plugin', 'package.json'))('exceljs');
const PRENOM = 'Zébu' + 'lon';
const cli = (env, ...a) => spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, ...env } });
const copie = () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-tab-')), 'Rugby-Saisons');
  cpSync(path.join(ex, 'fictif-m10-les-ecureuils'), d, { recursive: true });
  cpSync(path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3'), path.join(d, 'seniors-f3'), { recursive: true });
  // Table des prénoms remplie : aucun export ne doit la lire.
  ecrirePrenoms(path.join(d, 'm10'), { J01: PRENOM, J02: PRENOM + 'e' });
  ecrirePrenoms(path.join(d, 'seniors-f3'), { J01: PRENOM });
  return d;
};
const fichiersDe = (dossier) => readdirSync(dossier, { recursive: true }).map((f) => path.join(dossier, f)).filter((f) => /\.(html|csv|txt)$/.test(f));

test('tableau des présences : codes × dates, P / E, taux', () => {
  const m10 = path.join(ex, 'fictif-m10-les-ecureuils', 'm10');
  const t = tableauPresences(lireYaml(path.join(m10, 'effectif.yaml')), lireYaml(path.join(m10, 'presences.yaml')));
  assert.equal(t.entetes[0], 'Code');
  assert.match(t.entetes[2], /^2026-09-16 \(séance\)$/);
  assert.deepEqual(t.lignes[0].slice(0, 2), ['J01', '']);
  assert.deepEqual(t.lignes[0].slice(-2), ['4/4', 100]);
  assert.ok(t.lignes.every((l) => l[1] === ''), 'colonne prénom vide');
});

test('tableau du temps de jeu : minutes par rencontre et total', () => {
  const m = lireYaml(path.join(ex, 'fictif-m10-les-ecureuils', 'm10', 'matchs', '2026-10-17', 'match.yaml'));
  const [t, rotation] = tableauTempsDeJeu(m);
  assert.deepEqual(t.entetes.slice(2), ['Rencontre 1 (min)', 'Rencontre 2 (min)', 'Rencontre 3 (min)', 'Total (min)', '% du temps']);
  const totaux = t.lignes.map((l) => l.at(-2));
  assert.equal(totaux.reduce((a, b) => a + b, 0), 30 * 5);
  assert.ok(Math.max(...totaux) - Math.min(...totaux) <= 5);
  assert.equal(rotation.lignes.length, m.temps_de_jeu.periodes.length);
});

test('CSV : BOM, séparateur « ; », guillemets échappés', () => {
  const f = path.join(mkdtempSync(path.join(tmpdir(), 'cr-csv-')), 't.csv');
  ecrireCsv(f, { entetes: ['A', 'B'], lignes: [['x;y', 'dit "oui"']] });
  assert.equal(readFileSync(f, 'utf8'), '﻿A;B\r\n"x;y";"dit ""oui"""\r\n');
});

test('CLI tableau : xlsx et csv lisibles, en codes', async () => {
  const d = copie();
  const env = { COACH_RUGBY_DOSSIER: d };
  for (const quoi of ['presences', 'temps-de-jeu', 'progres']) {
    const r = cli(env, 'tableau', quoi, 'm10');
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /\.xlsx/);
  }
  const w = new ExcelJS.Workbook();
  await w.xlsx.readFile(path.join(d, 'm10', 'exports', 'presences.xlsx'));
  const ws = w.getWorksheet('Présences');
  assert.equal(ws.getRow(1).getCell(1).value, 'Code');
  assert.equal(ws.getRow(2).getCell(1).value, 'J01');
  const tdj = new ExcelJS.Workbook();
  await tdj.xlsx.readFile(path.join(d, 'm10', 'exports', 'temps-de-jeu-2026-10-17.xlsx'));
  assert.deepEqual(tdj.worksheets.map((s) => s.name), ['Temps de jeu', 'Rotation']);
  const csv = cli(env, 'tableau', 'presences', 'm10', '--format', 'csv');
  assert.doesNotMatch(csv.stdout, /\.xlsx/);
  assert.equal(cli(env, 'tableau', 'temps-de-jeu', 'seniors-f3').status, 1, 'pas de rotation enregistrée pour le derby');
  assert.equal(cli(env, 'tableau', 'inconnu', 'm10').status, 1);
});

test('fiche match : rotation, composition, statistiques, mention de la feuille officielle', () => {
  const d = copie();
  const p = exporterMatch(path.join(d, 'm10', 'matchs', '2026-10-17', 'match.yaml'));
  assert.deepEqual(p.fichiers, ['fiche-match-a4.html', 'fiche-match-telephone.html']);
  const plateau = readFileSync(path.join(p.dossier, 'fiche-match-a4.html'), 'utf8');
  assert.match(plateau, /Rotation du temps de jeu/);
  assert.match(plateau, /FDM EDR/);
  assert.match(plateau, /Choc à la tête/);
  assert.doesNotMatch(plateau, /\{\{|@repeter/);
  const r = exporterMatch(path.join(d, 'seniors-f3', 'matchs', '2026-10-18', 'match.yaml'));
  const derby = readFileSync(path.join(r.dossier, 'fiche-match-telephone.html'), 'utf8');
  assert.match(derby, /Oval-e/);
  assert.match(derby, /demi d'ouverture/);
  assert.match(derby, /Plaquages réussis/);
  assert.match(derby, /Remplaçants :<\/b> J16/);
});

test('feuille de présence : codes actifs, colonne prénom vide', () => {
  const d = copie();
  const r = exporterFeuillePresence(path.join(d, 'm10'));
  const html = readFileSync(path.join(r.dossier, 'feuille-presence-a4.html'), 'utf8');
  assert.equal((html.match(/<td class="code">J\d+<\/td><td><\/td>/g) || []).length, 16);
  assert.doesNotMatch(html, /\{\{|@repeter/);
});

test("aucun export ne contient de prénom, même quand la table est remplie", () => {
  const d = copie();
  const env = { COACH_RUGBY_DOSSIER: d };
  for (const a of [
    ['exporter', path.join(d, 'm10', 'matchs', '2026-10-17', 'match.yaml')],
    ['exporter', path.join(d, 'seniors-f3', 'matchs', '2026-10-18', 'match.yaml')],
    ['exporter', path.join(d, 'm10', 'effectif.yaml')],
    ['exporter', path.join(d, 'm10', 'seances', '2026-10-14', 'seance.yaml')],
    ['tableau', 'presences', 'm10', '--format', 'csv'],
    ['tableau', 'temps-de-jeu', 'm10', '--format', 'csv'],
    ['tableau', 'progres', 'm10', '--format', 'csv'],
  ]) {
    const r = cli(env, ...a);
    assert.equal(r.status, 0, `${a.join(' ')} : ${r.stdout}${r.stderr}`);
    assert.doesNotMatch(r.stdout, new RegExp(PRENOM));
  }
  const exports = [...fichiersDe(path.join(d, 'm10')), ...fichiersDe(path.join(d, 'seniors-f3'))].filter((f) => f.includes(`${path.sep}exports${path.sep}`));
  assert.ok(exports.length >= 8, `${exports.length} exports`);
  for (const f of exports) assert.doesNotMatch(readFileSync(f, 'utf8'), new RegExp(PRENOM), f);
});
