// Schémas, contrôles de cohérence, exemples fictifs et références.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validerChemin } from '../plugin/lib/dossier.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const plugin = path.resolve(ici, '..', 'plugin');
const erreurs = (chemin) => validerChemin(chemin).flatMap((r) => r.erreurs.map((e) => `${path.basename(r.fichier)} : ${e}`));

test('les références (catégories, sources) sont valides', () => {
  assert.deepEqual(erreurs(path.join(plugin, 'references')), []);
});

test('les exemples fictifs sont valides', () => {
  const r = validerChemin(path.join(plugin, 'exemples'));
  assert.ok(r.length >= 6, 'au moins 6 fichiers validés');
  assert.deepEqual(r.flatMap((x) => x.erreurs), []);
});

test('un groupe de section sportive en mode scolaire est valide (structures hors club)', () => {
  assert.deepEqual(erreurs(path.join(ici, 'fixtures', 'valides', 'section-sportive')), []);
});

test('un trou entre deux phases et une phase hors mode sont refusés', () => {
  const e = erreurs(path.join(ici, 'fixtures', 'invalides', 'trou-de-phase'));
  assert.ok(e.some((x) => /trou de 6 jour/.test(x)), e.join('\n'));
  assert.ok(e.some((x) => /phase-aller.*non prévue en mode plateaux/.test(x)), e.join('\n'));
});

test("l'id d'une équipe doit être le nom de son dossier", () => {
  const e = erreurs(path.join(ici, 'fixtures', 'invalides', 'id-different'));
  assert.ok(e.some((x) => /différent du nom du dossier/.test(x)), e.join('\n'));
});

test("une liste de joueurs nommés n'a pas sa place dans equipe.yaml", () => {
  const e = erreurs(path.join(ici, 'fixtures', 'invalides', 'liste-de-joueurs'));
  assert.ok(e.some((x) => /additional properties.*joueurs/.test(x)), e.join('\n'));
});

test('#29 : les heures écrites sont entre guillemets', async () => {
  const { ecrireYaml } = await import('../plugin/lib/yaml.mjs');
  const { mkdtempSync, readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const f = path.join(mkdtempSync(path.join(tmpdir(), 'cr-h-')), 'x.yaml');
  ecrireYaml(f, { heure: '20:00', seances: [{ date: '2026-11-10', heure: '19:30' }] });
  const t = readFileSync(f, 'utf8');
  assert.match(t, /^heure: "20:00"$/m);
  assert.match(t, /^\s+heure: "19:30"$/m);
});
