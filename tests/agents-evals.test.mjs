// Agents relecteurs et cas d'éval : structure et cohérence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'plugin');
const frontmatter = (texte) => {
  const m = /^---\n([\s\S]*?)\n---/.exec(texte);
  if (!m) return null;
  return Object.fromEntries(m[1].split('\n').filter((l) => /^\w[\w-]*:/.test(l)).map((l) => [l.split(':')[0], l.slice(l.indexOf(':') + 1).trim()]));
};

const AGENTS = ['relecteur-securite-jeunes', 'relecteur-reglement', 'relecteur-sources', 'relecteur-confidentialite'];

test('quatre relecteurs en lecture seule, nommés comme leur fichier', () => {
  const fichiers = readdirSync(path.join(plugin, 'agents')).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort();
  assert.deepEqual(fichiers, [...AGENTS].sort());
  for (const a of AGENTS) {
    const fm = frontmatter(readFileSync(path.join(plugin, 'agents', `${a}.md`), 'utf8'));
    assert.equal(fm.name, a);
    assert.equal(fm.tools, 'Read, Grep', `${a} : outils en lecture seule`);
    assert.match(fm.description, /Signale sans corriger/);
    for (const interdit of ['hooks', 'mcpServers', 'permissionMode']) assert.ok(!(interdit in fm), `${a} : ${interdit} non pris en charge dans un plugin`);
  }
});

test('le skill relire cite les quatre agents et la grille commune', () => {
  const md = readFileSync(path.join(plugin, 'skills', 'relire', 'SKILL.md'), 'utf8');
  for (const a of AGENTS) assert.match(md, new RegExp(`coach-rugby:${a}`));
  assert.match(md, /grilles-relecture\.md/);
  const grille = readFileSync(path.join(plugin, 'references', 'grilles-relecture.md'), 'utf8');
  for (const s of ['## 1. Sécurité des jeunes', '## 2. Conformité au règlement', '## 3. Sources', '## 4. Confidentialité']) assert.ok(grille.includes(s), s);
});

test("chaque cas d'éval a un prompt et au moins un grader de type connu", () => {
  const TYPES = new Set(['regex', 'tool_used', 'tool_order', 'file_exists', 'llm', 'baseline']);
  const cas = readdirSync(path.join(plugin, 'evals')).filter((d) => statSync(path.join(plugin, 'evals', d)).isDirectory() && d !== 'results');
  assert.deepEqual(cas.sort(), ['garde-rgpd-issue', 'refus-avis-medical', 'reprise-treve-proactive', 'seance-m10-75min', 'semaine-derby']);
  for (const c of cas) {
    const d = path.join(plugin, 'evals', c);
    assert.ok(existsSync(path.join(d, 'prompt.md')), `${c} : prompt.md`);
    const graders = readdirSync(path.join(d, 'graders'));
    assert.ok(graders.length > 0, `${c} : graders`);
    for (const g of graders) {
      const fm = frontmatter(readFileSync(path.join(d, 'graders', g), 'utf8'));
      assert.ok(TYPES.has(fm?.type), `${c}/${g} : type ${fm?.type}`);
    }
    const p = frontmatter(readFileSync(path.join(d, 'prompt.md'), 'utf8'));
    const env = readFileSync(path.join(d, 'prompt.md'), 'utf8').match(/^ {2}([A-Z_]+):/gm) || [];
    for (const v of env) assert.match(v.trim(), /^EVAL_[A-Z0-9_]*:$/, `${c} : seules les variables EVAL_* passent`);
    assert.ok(p.allowed_tools, `${c} : allowed_tools`);
    if (existsSync(path.join(d, 'case.yaml'))) {
      const y = readFileSync(path.join(d, 'case.yaml'), 'utf8');
      assert.match(y, /schema_version: "1\.1"/);
      const script = /scaffold_script:\s*(\S+)/.exec(y)?.[1];
      if (script) assert.ok(existsSync(path.join(d, script)), `${c} : ${script}`);
    }
  }
});

test('le protocole commotion ne donne aucune durée de reprise', () => {
  const t = readFileSync(path.join(plugin, 'references', 'protocole-commotion.md'), 'utf8');
  assert.doesNotMatch(t, /\b\d+\s*(jours|semaines|days)\b(?![^\n]*jamais)/i, 'aucune durée prescrite');
  assert.match(t, /sortie immédiate et \*\*définitive\*\*/);
});
