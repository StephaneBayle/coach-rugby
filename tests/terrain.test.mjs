// Schémas de terrain SVG : déterminisme, symboles, accessibilité, contrôles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerBibliotheque } from '../plugin/lib/bibliotheque.mjs';
import { controlerSchema, echelleDe, genererSvg } from '../plugin/lib/terrain.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gabarit = readFileSync(path.join(racine, 'plugin', 'gabarits', 'terrain.svg'), 'utf8');
const symbolesDefinis = new Set([...gabarit.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
const exercices = chargerBibliotheque();
const svgDe = (e) => genererSvg(e.schema, { titre: e.titre, description: e.but });

test('chaque fiche produit un SVG déterministe, titré et décrit', () => {
  for (const e of exercices) {
    const svg = svgDe(e);
    assert.equal(svg, svgDe(e), e.id);
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[-\d. ]+" role="img"/);
    assert.match(svg, /<title id="titre">.+<\/title>/);
    assert.match(svg, /<desc id="desc">.+<\/desc>/);
  }
});

test('chaque symbole utilisé est défini dans le gabarit', () => {
  for (const e of exercices) {
    for (const [, id] of svgDe(e).matchAll(/<use href="#([^"]+)"/g)) assert.ok(symbolesDefinis.has(id), `${e.id} : #${id}`);
  }
});

test('viewBox et échelle', () => {
  assert.equal(echelleDe({ longueur: 20, largeur: 15 }), 1);
  assert.equal(echelleDe({ longueur: 100, largeur: 70 }), 4);
  const svg = genererSvg({ surface: { type: 'atelier', longueur: 20, largeur: 15 }, elements: [] }, { titre: 't' });
  assert.match(svg, /viewBox="-2 -2 24 19"/);
});

test("la légende ne reprend que ce qui est utilisé", () => {
  const svg = genererSvg(
    { surface: { type: 'atelier', longueur: 20, largeur: 15 }, elements: [{ type: 'plot', x: 1, y: 1 }], trajets: [{ type: 'pied', de: [1, 1], a: [5, 5] }] },
    { titre: 't' },
  );
  assert.match(svg, />plot</);
  assert.match(svg, />jeu au pied</);
  assert.doesNotMatch(svg, />défenseur</);
});

test('contrôles : hors surface, type inconnu, prénom en étiquette', () => {
  const e = controlerSchema({
    surface: { type: 'atelier', longueur: 10, largeur: 10 },
    elements: [{ type: 'attaquant', x: 12, y: 5, label: 'A1' }, { type: 'arbitre', x: 1, y: 1 }, { type: 'attaquant', x: 2, y: 2, label: 'Zébulon' }],
    trajets: [{ type: 'course', de: [1, 1], a: [11, 1] }],
  });
  assert.ok(e.some((x) => /hors de la surface \(12, 5\)/.test(x)), e.join('\n'));
  assert.ok(e.some((x) => /type inconnu : arbitre/.test(x)));
  assert.ok(e.some((x) => /jamais un prénom/.test(x)));
  assert.ok(e.some((x) => /trajet course hors de la surface/.test(x)));
});

test('caractères spéciaux échappés dans le titre', () => {
  assert.match(genererSvg({ surface: { type: 'atelier', longueur: 10, largeur: 10 }, elements: [] }, { titre: 'A & B <c>' }), /A &amp; B &lt;c&gt;/);
});
