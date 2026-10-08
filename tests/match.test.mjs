// Match et temps de jeu : rotation équitable, contrôles, CLI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { controlerMatch, effectifsPermis } from '../plugin/lib/match.mjs';
import { reglesDuJour } from '../plugin/lib/categories.mjs';
import { attenteMax, bilanEquite, decouperPeriodes, planifierRotation } from '../plugin/lib/temps-de-jeu.mjs';
import { suggestions } from '../plugin/lib/etat.mjs';
import { preparerMatch } from '../plugin/lib/export.mjs';
import { validerChemin } from '../plugin/lib/dossier.mjs';
import { ecrireYaml, lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ex = path.join(racine, 'plugin', 'exemples');
const m10 = { equipe: lireYaml(path.join(ex, 'fictif-m10-les-ecureuils', 'm10', 'equipe.yaml')), effectif: lireYaml(path.join(ex, 'fictif-m10-les-ecureuils', 'm10', 'effectif.yaml')) };
const f3 = { equipe: lireYaml(path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3', 'equipe.yaml')), effectif: lireYaml(path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3', 'effectif.yaml')) };
const plateau = lireYaml(path.join(ex, 'fictif-m10-les-ecureuils', 'm10', 'matchs', '2026-10-17', 'match.yaml'));
const derby = lireYaml(path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3', 'matchs', '2026-10-18', 'match.yaml'));
const codes = (n) => Array.from({ length: n }, (_, i) => `J${String(i + 1).padStart(2, '0')}`);

test('périodes découpées rencontre par rencontre', () => {
  const p = decouperPeriodes([{ duree_min: 12 }, { duree_min: 10 }], 5);
  assert.deepEqual(p.map((x) => [x.debut_min, x.fin_min, x.rencontre]), [[0, 5, 1], [5, 10, 1], [10, 12, 1], [12, 17, 2], [17, 22, 2]]);
});

test("rotation équitable : écart d'une période au plus, cas de l'éval (13 enfants, 4 × 10 min, 5 sur le terrain)", () => {
  const joueurs = codes(13);
  const r = planifierRotation({ joueurs, surLeTerrain: 5, rencontres: Array(4).fill({ duree_min: 10 }), dureePeriode: 5 });
  assert.ok(r.possible);
  assert.ok(r.periodes.every((p) => p.sur_le_terrain.length === 5));
  const b = bilanEquite(r.periodes, joueurs, 40);
  assert.ok(b.ecart <= 5, `écart ${b.ecart}`);
  assert.equal(Object.values(b.minutes).reduce((a, c) => a + c, 0), 40 * 5);
});

test('rotation déterministe et impossible si trop peu de joueurs', () => {
  const a = planifierRotation({ joueurs: codes(9), surLeTerrain: 7, rencontres: [{ duree_min: 14 }], dureePeriode: 7 });
  const b = planifierRotation({ joueurs: [...codes(9)].reverse(), surLeTerrain: 7, rencontres: [{ duree_min: 14 }], dureePeriode: 7 });
  assert.deepEqual(a.periodes, b.periodes);
  assert.equal(planifierRotation({ joueurs: codes(4), surLeTerrain: 5, rencontres: [{ duree_min: 10 }] }).possible, false);
});

test('personne ne reste deux périodes de suite sur le banc quand c\'est évitable', () => {
  const joueurs = codes(7);
  const r = planifierRotation({ joueurs, surLeTerrain: 5, rencontres: Array(3).fill({ duree_min: 10 }), dureePeriode: 5 });
  for (const c of joueurs) {
    const banc = r.periodes.map((p) => !p.sur_le_terrain.includes(c));
    assert.ok(!banc.some((x, i) => x && banc[i + 1]), `${c} deux fois de suite sur le banc`);
  }
});

test('effectifs permis par la forme du jour', () => {
  assert.deepEqual(effectifsPermis(reglesDuJour({ categories: ['m10'], date: '2026-10-17' })), [5, 7]);
  assert.deepEqual(effectifsPermis(reglesDuJour({ categories: ['seniors'], pratique: 'xv', date: '2026-10-18' })), [15]);
});

test('exemples : plateau M10 et derby F3 valides', () => {
  assert.deepEqual(controlerMatch(plateau, m10), []);
  assert.deepEqual(controlerMatch(derby, f3), []);
  const r = validerChemin(ex).filter((x) => x.fichier.endsWith('match.yaml'));
  assert.equal(r.length, 2);
  assert.deepEqual(r.flatMap((x) => x.erreurs), []);
});

test('contrôles : trop de joueurs sur le terrain, poste de première ligne sans mêlée, codes inconnus ou indisponibles', () => {
  const e = controlerMatch({ ...structuredClone(plateau), regles: { ...plateau.regles, sur_le_terrain: 10 } }, m10).join('\n');
  assert.match(e, /10 joueurs sur le terrain : la forme du jour .* prévoit 5 ou 7/);
  const p = structuredClone(plateau);
  p.composition = { titulaires: [{ code: 'J01', poste: 'talonneur' }, { code: 'J02' }, { code: 'J03' }, { code: 'J04' }, { code: 'J05' }] };
  assert.match(controlerMatch(p, m10).join('\n'), /première ligne alors que la forme du jour n'a pas de mêlée/);
  const d = structuredClone(derby);
  d.composition.remplacants = ['J21', 'J99'];
  const ed = controlerMatch(d, f3).join('\n');
  assert.match(ed, /J21 est indisponible/);
  assert.match(ed, /J99 absent de effectif\.yaml/);
});

test("contrôles : sécurité (tête, protège-dents) et équité à l'école de rugby", () => {
  const p = structuredClone(plateau);
  p.securite = [];
  const e = controlerMatch(p, m10).join('\n');
  assert.match(e, /choc à la tête/);
  assert.match(e, /protège-dents/);
  const q = structuredClone(plateau);
  q.temps_de_jeu.periodes = q.temps_de_jeu.periodes.map((x) => ({ ...x, sur_le_terrain: ['J01', 'J02', 'J03', 'J04', 'J05'] }));
  assert.match(controlerMatch(q, m10).join('\n'), /écart de temps de jeu de 30 min/);
});

test('CLI rotation : calcule, enregistre et valide', () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-rot-')), 'Rugby-Saisons');
  cpSync(path.join(ex, 'fictif-m10-les-ecureuils'), d, { recursive: true });
  const f = path.join(d, 'm10', 'matchs', '2026-10-17', 'match.yaml');
  const m = lireYaml(f);
  delete m.temps_de_jeu;
  m.convoques = codes(13);
  ecrireYaml(f, m);
  const r = spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), 'rotation', f, '--ecrire'], { encoding: 'utf8', env: { ...process.env, COACH_RUGBY_DOSSIER: d } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /13 joueurs, 5 sur le terrain/);
  assert.match(r.stdout, /trop de joueurs pour une seule équipe/);
  assert.equal(lireYaml(f).temps_de_jeu.periodes.length, 6);
});

test("attente la plus longue : annoncée, et inévitable au-delà de deux fois plus de joueurs que de places (playtest 5)", () => {
  const r12 = planifierRotation({ joueurs: codes(12), surLeTerrain: 5, rencontres: Array(3).fill({ duree_min: 10 }), dureePeriode: 5 });
  const a = attenteMax(r12.periodes, codes(12));
  assert.ok(a.deuxDeSuite.length > 0, 'à 12 pour 5, certains attendent deux périodes de suite');
  assert.equal(a.max, 10, "mais jamais plus de deux périodes");
  const r7 = planifierRotation({ joueurs: codes(7), surLeTerrain: 5, rencontres: Array(3).fill({ duree_min: 10 }), dureePeriode: 5 });
  assert.deepEqual(attenteMax(r7.periodes, codes(7)).deuxDeSuite, []);
});

test("décalage : ce ne sont pas toujours les mêmes qui jouent la période en plus", () => {
  const plus = (decalage) => {
    const r = planifierRotation({ joueurs: codes(13), surLeTerrain: 5, rencontres: Array(3).fill({ duree_min: 10 }), dureePeriode: 5, decalage });
    return Object.entries(r.minutes).filter(([, m]) => m === 15).map(([c]) => c);
  };
  assert.deepEqual(plus(0), ['J01', 'J02', 'J03', 'J04']);
  assert.notDeepEqual(plus(1), plus(0));
  assert.equal(plus(1).length, 4);
});

test('CLI rotation : attente annoncée, cible marquée non atteinte quand elle ne peut pas être tenue', () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-rot2-')), 'Rugby-Saisons');
  cpSync(path.join(ex, 'fictif-m10-les-ecureuils'), d, { recursive: true });
  const f = path.join(d, 'm10', 'matchs', '2026-10-17', 'match.yaml');
  const m = lireYaml(f);
  delete m.temps_de_jeu;
  m.convoques = codes(12);
  ecrireYaml(f, m);
  const r = spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), 'rotation', f, '--ecrire'], { encoding: 'utf8', env: { ...process.env, COACH_RUGBY_DOSSIER: d } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /Attente la plus longue sur le banc : 10 min/);
  assert.match(r.stdout, /inévitable/);
  assert.match(lireYaml(f).temps_de_jeu.cible, /non atteinte ici : 12 joueurs pour 5 places/);
});

test('première ligne : un joueur hors de ses postes est signalé (playtest 6)', () => {
  const d = structuredClone(derby);
  d.composition.titulaires[2] = { code: 'J22', poste: 'pilier-droit' };
  d.composition.remplacants = d.composition.remplacants.filter((c) => c !== 'J22');
  assert.match(controlerMatch(d, f3).join('\n'), /J22 placé en pilier-droit alors que ses postes sont troisieme-ligne-aile/);
  assert.deepEqual(controlerMatch(derby, f3), []);
});

test('score sur la fiche ; pas de relance d\'affûtage le jour du match', () => {
  const d = { ...structuredClone(derby), score: { nous: 23, adversaire: 17 } };
  assert.match(preparerMatch(d, { equipe: f3.equipe }).apres, /Score : 23 – 17 contre RC Voisinville/);
  const saison = lireYaml(path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3', 'saison.yaml'));
  const c = (date) => suggestions(saison, date, { equipe: f3.equipe }).map((x) => x.code);
  assert.ok(c('2026-10-17').includes('affutage'));
  assert.ok(!c('2026-10-18').includes('affutage'));
});
