// Invariants de structure du dépôt et du plugin livré.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plugin = path.join(racine, 'plugin');
const json = (f) => JSON.parse(readFileSync(path.join(racine, f), 'utf8'));

test('pas de dossier bin/ dans le plugin (Cowork et claude.ai le refuseraient)', () => {
  assert.equal(existsSync(path.join(plugin, 'bin')), false);
});

test('pas de CLAUDE.md dans le plugin livré', () => {
  assert.equal(existsSync(path.join(plugin, 'CLAUDE.md')), false);
});

test('la marketplace pointe vers ./plugin et porte le même nom que le plugin', () => {
  const m = json('.claude-plugin/marketplace.json');
  const p = json('plugin/.claude-plugin/plugin.json');
  assert.equal(m.plugins.length, 1);
  assert.equal(m.plugins[0].source, './plugin');
  assert.equal(m.plugins[0].name, p.name);
});

test('chaque option userConfig a une valeur par défaut (Cowork ne pose pas la question)', () => {
  const { userConfig } = json('plugin/.claude-plugin/plugin.json');
  for (const [cle, opt] of Object.entries(userConfig)) {
    assert.ok('default' in opt, `option ${cle} sans valeur par défaut`);
  }
});

test('la version du plugin suit SemVer', () => {
  assert.match(json('plugin/.claude-plugin/plugin.json').version, /^\d+\.\d+\.\d+$/);
});

test('chaque skill a un SKILL.md dont le name correspond au dossier', () => {
  const dossier = path.join(plugin, 'skills');
  for (const s of readdirSync(dossier).filter((d) => statSync(path.join(dossier, d)).isDirectory())) {
    const md = readFileSync(path.join(dossier, s, 'SKILL.md'), 'utf8');
    const nom = /^---\n[\s\S]*?^name:\s*(\S+)/m.exec(md)?.[1];
    assert.equal(nom, s, `skill ${s}`);
    assert.match(md, /^description:\s*\S/m, `skill ${s} sans description`);
  }
});
