// Hook SessionStart : silencieux sans dossier, une ligne par équipe, alerte git.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(racine, 'plugin', 'scripts', 'session-start.mjs');
const lancer = (env) =>
  spawnSync(process.execPath, [script], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, HOME: process.env.HOME, CLAUDE_PLUGIN_ROOT: path.join(racine, 'plugin'), ...env },
  });

test('silencieux quand le dossier saison n’existe pas encore', () => {
  const r = lancer({ COACH_RUGBY_DOSSIER: path.join(mkdtempSync(path.join(tmpdir(), 'cr-ss-')), 'absent') });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('une ligne par équipe avec phase, semaine et relances', () => {
  const r = lancer({
    COACH_RUGBY_DOSSIER: path.join(racine, 'plugin', 'exemples', 'fictif-seniors-f3-les-goelands'),
    COACH_RUGBY_AUJOURDHUI: '2026-10-14',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Équipe première des Goélands : phase-aller, semaine 14, prochaine échéance match le 2026-10-18 \(J-4\) ; relances possibles : affutage/);
});

test('alerte si le dossier saison est dans un dépôt git', () => {
  const base = mkdtempSync(path.join(tmpdir(), 'cr-ss-git-'));
  mkdirSync(path.join(base, '.git'));
  writeFileSync(path.join(base, '.git', 'config'), '[remote "origin"]\n\turl = https://example.org/x.git\n');
  const d = path.join(base, 'saisons');
  cpSync(path.join(racine, 'plugin', 'exemples', 'fictif-m10-les-ecureuils'), d, { recursive: true });
  const r = lancer({ COACH_RUGBY_DOSSIER: d, COACH_RUGBY_AUJOURDHUI: '2026-10-08' });
  assert.match(r.stdout, /M10 des Écureuils : plateaux-automne/);
  assert.match(r.stdout, /dans un dépôt git/);
});
