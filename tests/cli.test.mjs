// CLI : init, statut, valider, regles ; résolution du dossier saison.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dossierSaison } from '../plugin/lib/chemins.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs');
const lancer = (args, env = {}) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });

test('init crée le dossier saison sans rien écraser', () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-init-')), 'Rugby-Saisons');
  const r = lancer(['init', '--structure', 'pole-formation'], { COACH_RUGBY_DOSSIER: d });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(path.join(d, '.coach-rugby.yaml')));
  assert.ok(existsSync(path.join(d, '.joueurs-proteges.txt')));
  assert.ok(existsSync(path.join(d, '_bibliotheque-perso', 'exercices')));
  assert.match(readFileSync(path.join(d, '.coach-rugby.yaml'), 'utf8'), /type: pole-formation/);
  const r2 = lancer(['init'], { COACH_RUGBY_DOSSIER: d });
  assert.match(r2.stdout, /rien à créer/);
  assert.match(readFileSync(path.join(d, '.coach-rugby.yaml'), 'utf8'), /type: pole-formation/);
  assert.equal(lancer(['valider', d]).status, 0);
});

test('init prévient si le dossier saison est dans un dépôt git', () => {
  const base = mkdtempSync(path.join(tmpdir(), 'cr-git-'));
  mkdirSync(path.join(base, '.git'));
  const r = lancer(['init'], { COACH_RUGBY_DOSSIER: path.join(base, 'saisons') });
  assert.match(r.stdout, /dans un dépôt git/);
});

test('statut sur un exemple fictif, à date fixée', () => {
  const r = lancer(['statut'], {
    COACH_RUGBY_DOSSIER: path.join(racine, 'plugin', 'exemples', 'fictif-seniors-f3-les-goelands'),
    COACH_RUGBY_AUJOURDHUI: '2026-12-05',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Phase : phase-aller — semaine 21/);
  assert.match(r.stdout, /J-1/);
  assert.match(r.stdout, /trêve commence dans 9 jour/);
  assert.match(r.stdout, /à vérifier, saison 2026-2027/);
});

test('statut --json', () => {
  const r = lancer(['statut', 'm10', '--json'], {
    COACH_RUGBY_DOSSIER: path.join(racine, 'plugin', 'exemples', 'fictif-m10-les-ecureuils'),
    COACH_RUGBY_AUJOURDHUI: '2027-02-10',
  });
  const j = JSON.parse(r.stdout);
  assert.equal(j.equipes[0].situation.phase.id, 'plateaux-printemps');
  assert.equal(j.equipes[0].regles.formes[0].id, 'rugby-educatif-7');
});

test('valider sort en code 1 sur des données fausses', () => {
  const r = lancer(['valider', path.join(racine, 'tests', 'fixtures', 'invalides')]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /en erreur/);
});

test('regles : catégorie la plus jeune et source', () => {
  const r = lancer(['regles', 'm14,m12', '--date', '2026-11-10']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Moins de 12 ans/);
  assert.match(r.stdout, /ffr-cahier-edr-2026-2027, p\. 7/);
});

test('code 3 quand les dépendances sont introuvables (bascule sur le chemin B)', () => {
  const copie = mkdtempSync(path.join(tmpdir(), 'cr-sans-deps-'));
  // Copie du plugin sans node_modules, et HOME vide pour ne pas trouver le dossier de données.
  spawnSync('cp', ['-R', path.join(racine, 'plugin', 'lib'), path.join(racine, 'plugin', 'scripts'), path.join(racine, 'plugin', 'references'), copie]);
  const r = spawnSync(process.execPath, [path.join(copie, 'scripts', 'coach-rugby.mjs'), 'regles', 'm10'], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, HOME: copie },
  });
  assert.equal(r.status, 3, r.stdout + r.stderr);
  assert.match(r.stderr, /chemin manuel \(B\)/);
});

test('résolution du dossier : variable, puis dossier courant configuré, puis option, puis défaut', () => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'cr-cwd-'));
  assert.equal(dossierSaison({ cwd, env: { COACH_RUGBY_DOSSIER: '/tmp/x' } }), '/tmp/x');
  assert.equal(dossierSaison({ cwd, env: { COACH_RUGBY_OPTION_DOSSIER: '/tmp/y' } }), '/tmp/y');
  assert.match(dossierSaison({ cwd, env: {} }), /Rugby-Saisons$/);
  spawnSync('touch', [path.join(cwd, '.coach-rugby.yaml')]);
  assert.equal(dossierSaison({ cwd, env: { COACH_RUGBY_OPTION_DOSSIER: '/tmp/y' } }), cwd);
});
