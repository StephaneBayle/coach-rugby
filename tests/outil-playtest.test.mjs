// Outil de playtest (développement) : agents, skill et scénarios cohérents.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

test("agents de playtest : coach simulé en lecture seule, critique qui écrit le rapport", () => {
  assert.match(lire('.claude/agents/coach-simule.md'), /^tools: Read$/m);
  assert.match(lire('.claude/agents/coach-simule.md'), /J'ARRÊTE : <oui \| non>/);
  const critique = lire('.claude/agents/critique-playtest.md');
  assert.match(critique, /^tools: Read, Write$/m);
  for (const s of ['Biais connus de la simulation', 'Limites de ce playtest', 'Recommandations']) assert.ok(critique.includes(s), s);
});

test("l'outil de playtest n'est pas livré dans le plugin", () => {
  assert.ok(!existsSync(path.join(racine, 'plugin', 'skills', 'playtest')));
  assert.ok(!existsSync(path.join(racine, 'plugin', 'agents', 'coach-simule.md')));
  assert.match(lire('.claude/skills/playtest/SKILL.md'), /^disable-model-invocation: true$/m);
});

test('huit scénarios, chacun avec profil, départ, pièges et critères', () => {
  const scenarios = readdirSync(path.join(racine, 'playtests', 'scenarios')).filter((f) => f.endsWith('.md'));
  assert.equal(scenarios.length, 8);
  for (const s of scenarios) {
    const t = lire(path.join('playtests', 'scenarios', s));
    for (const section of ['## Profil du coach', '## Départ', '## Pièges à placer', '## Critères de réussite']) assert.ok(t.includes(section), `${s} : ${section}`);
    assert.match(t, /Date fixée :?\s+\*\*\d{4}-\d{2}-\d{2}\*\*/, `${s} : date fixée`);
    assert.match(t, /Tout est fictif/);
  }
});
