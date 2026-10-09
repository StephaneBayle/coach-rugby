// Charge réalisée (lot 4) : calculs, repères, seuils d'âge, CLI, garde.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bilanCharge, chargeEntree, controlerCharge, monotonie, parSemaine, prevuVsRealise, tendance } from '../plugin/lib/charge.mjs';
import { validerChemin } from '../plugin/lib/dossier.mjs';
import { valider } from '../plugin/lib/schemas.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ex = path.join(racine, 'plugin', 'exemples');
const f3 = path.join(ex, 'fictif-seniors-f3-les-goelands', 'seniors-f3');
const charge = lireYaml(path.join(f3, 'charge.yaml'));
const equipeF3 = lireYaml(path.join(f3, 'equipe.yaml'));
const cli = (env, ...a) => spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, ...env } });
const copie = () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-charge-')), 'Rugby-Saisons');
  cpSync(path.join(ex, 'fictif-seniors-f3-les-goelands'), d, { recursive: true });
  cpSync(path.join(ex, 'fictif-m10-les-ecureuils', 'm10'), path.join(d, 'm10'), { recursive: true });
  return d;
};

test('charge de séance : RPE × durée ; totaux par semaine (calcul à la main)', () => {
  assert.equal(chargeEntree({ rpe_groupe: 6, duree_min: 105 }), 630);
  const s = parSemaine(charge);
  assert.equal(s['2026-09-28'].total, 630 + 450 + 640);
  assert.equal(s['2026-10-05'].total, 840 + 525 + 720 + 360);
  assert.equal(s['2026-10-12'].total, 525 + 300 + 720);
});

test('tendance : moyenne des 4 semaines précédentes, repère de hausse au-delà de 30 %', () => {
  const s = parSemaine(charge);
  assert.deepEqual(tendance(s, '2026-10-05'), { total: 2445, reference: 1720, ecart_pct: 42, alerte: true, semaines_reference: 4 });
  const derby = tendance(s, '2026-10-12');
  assert.equal(derby.reference, Math.round((1720 * 3 + 2445) / 4));
  assert.equal(derby.alerte, false);
  assert.equal(tendance(s, '2026-09-14').reference, null, 'moins de 3 semaines de référence : pas de tendance');
});

test('monotonie de Foster (jours sans séance à 0)', () => {
  const s = parSemaine(charge);
  const v = [0, 630, 0, 450, 0, 0, 640];
  const m = v.reduce((a, b) => a + b, 0) / 7;
  const sd = Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / 7);
  assert.equal(monotonie(s['2026-09-28'], '2026-09-28'), Math.round((m / sd) * 100) / 100);
  assert.equal(monotonie({ jours: {} }, '2026-09-28'), null);
});

test('bilan : alertes formulées comme des repères, jamais comme un risque médical', () => {
  const b = bilanCharge(charge, '2026-10-09');
  assert.deepEqual(b.alertes.map((a) => a.code), ['hausse']);
  for (const a of b.alertes) assert.match(a.message, /repère|hypothèse/);
  // Aucun vocabulaire de risque ou de blessure, même à la forme négative.
  for (const a of b.alertes) assert.doesNotMatch(a.message, /blessure|risque|danger|surentra/i);
});

test('prévu face au réalisé', () => {
  const semaine = { seances_prevues: [{ date: '2026-10-13', intensite: 'moyenne' }, { date: '2026-10-15', intensite: 'affutage' }, { date: '2026-10-16', intensite: 'legere' }] };
  assert.deepEqual(prevuVsRealise(semaine, charge).map((x) => x.ecart), ['conforme', 'conforme', 'non-notee']);
  const dure = { seances_prevues: [{ date: '2026-10-06', intensite: 'legere' }] };
  assert.equal(prevuVsRealise(dure, charge)[0].ecart, 'plus-dure');
});

test('schéma : RPE de 0 à 10, aucun champ libre ni donnée de santé', () => {
  const e = { date: '2026-10-13', type: 'seance', duree_min: 90, rpe_groupe: 6 };
  assert.deepEqual(valider('charge', { equipe: 'x', entrees: [e] }), []);
  assert.ok(valider('charge', { equipe: 'x', entrees: [{ ...e, rpe_groupe: 11 }] }).length);
  assert.ok(valider('charge', { equipe: 'x', entrees: [{ ...e, commentaire: 'fatigué' }] }).length);
  assert.ok(valider('charge', { equipe: 'x', entrees: [{ ...e, douleur: 3 }] }).length);
  assert.ok(valider('charge', { equipe: 'x', entrees: [{ ...e, par_code: { J01: 12 } }] }).length);
});

test("seuils d'âge : pas de RPE à l'école de rugby, RPE par joueur réservé aux 16 ans et plus", () => {
  const e = { date: '2026-10-13', type: 'seance', duree_min: 75, rpe_groupe: 5 };
  assert.match(controlerCharge({ equipe: 'm10', entrees: [e] }, { equipe: { categories: ['m10'] } }).join(), /école de rugby/);
  assert.deepEqual(controlerCharge({ equipe: 'm14', entrees: [e] }, { equipe: { categories: ['m14'] } }), [], 'RPE du groupe permis en M14');
  const m16 = controlerCharge({ equipe: 'm16', entrees: [{ ...e, par_code: { J01: 6 } }] }, { equipe: { categories: ['m16'] } });
  assert.match(m16.join(), /RPE par joueur refusé pour J01 \(Moins de 16 ans\)/);
  const mixte = { equipe: { categories: ['m16', 'm19'] }, effectif: { joueurs: [{ code: 'J01', categorie: 'm19', disponible: true }, { code: 'J02', categorie: 'm16', disponible: true }] } };
  const r = controlerCharge({ equipe: 'g', entrees: [{ ...e, par_code: { J01: 6, J02: 6 } }] }, mixte).join();
  assert.doesNotMatch(r, /J01/, 'J01 est en M19');
  assert.match(r, /J02/);
  assert.match(controlerCharge({ equipe: 'm18f', entrees: [{ ...e, par_code: { J01: 6 } }] }, { equipe: { categories: ['m18f'] } }).join(), /refusé/, 'M18F exclue par prudence');
});

test('exemple F3 valide ; entrées en double refusées', () => {
  assert.deepEqual(validerChemin(path.join(f3, 'charge.yaml')).flatMap((x) => x.erreurs), []);
  const e = { date: '2026-10-13', type: 'seance', duree_min: 75, rpe_groupe: 5 };
  assert.match(controlerCharge({ equipe: 'seniors-f3', entrees: [e, e] }, { equipe: equipeF3 }).join(), /deux entrées/);
});

test('CLI charge : saisie, bilan ; une saisie refusée ne laisse rien', () => {
  const d = copie();
  const env = { COACH_RUGBY_DOSSIER: d, COACH_RUGBY_AUJOURDHUI: '2026-10-25' };
  assert.match(cli(env, 'charge', 'seniors-f3', '--date', '2026-10-30', '--duree', '90', '--rpe', '3').stderr, /pas encore passé/);
  const ok = cli(env, 'charge', 'seniors-f3', '--date', '2026-10-20', '--duree', '90', '--rpe', '3', '--par-code', 'j01=4,J02=3');
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /90 min × 3 = 270 ; 2 RPE individuel/);
  assert.equal(lireYaml(path.join(d, 'seniors-f3', 'charge.yaml')).entrees.at(-1).par_code.J01, 4);
  const bilan = cli(env, 'charge', 'seniors-f3', '--bilan', '--date', '2026-10-09');
  assert.match(bilan.stdout, /écart \+42 %/);
  assert.match(bilan.stdout, /pas des indicateurs médicaux/);
  const refus = cli(env, 'charge', 'm10', '--date', '2026-10-14', '--duree', '75', '--rpe', '4');
  assert.equal(refus.status, 1);
  assert.match(refus.stderr, /non enregistrée/);
  assert.ok(!existsSync(path.join(d, 'm10', 'charge.yaml')));
  const avant = readFileSync(path.join(d, 'seniors-f3', 'charge.yaml'), 'utf8');
  assert.equal(cli(env, 'charge', 'seniors-f3', '--date', '2026-10-21', '--duree', '90', '--rpe', '3', '--par-code', 'J99=4').status, 1);
  assert.equal(readFileSync(path.join(d, 'seniors-f3', 'charge.yaml'), 'utf8'), avant, 'fichier remis en état');
});

test('CI : charge et tests physiques de joueurs refusés dans le dépôt, hors exemples', () => {
  const depot = mkdtempSync(path.join(tmpdir(), 'cr-charge-ci-'));
  execFileSync('git', ['init', '-q'], { cwd: depot });
  mkdirSync(path.join(depot, 'equipe'));
  mkdirSync(path.join(depot, 'references'));
  writeFileSync(path.join(depot, 'equipe', 'charge.yaml'), 'equipe: x\n');
  writeFileSync(path.join(depot, 'equipe', 'tests.yaml'), 'equipe: x\n');
  writeFileSync(path.join(depot, 'equipe', 'charge-2026.csv'), 'Code\n');
  writeFileSync(path.join(depot, 'references', 'tests-physiques.yaml'), 'tests: []\n');
  execFileSync('git', ['add', '-f', '.'], { cwd: depot });
  const r = spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'garde-rgpd.mjs'), '--depot', depot], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.equal((r.stdout.match(/charge ou tests physiques/g) || []).length, 3, r.stdout);
  assert.doesNotMatch(r.stdout, /tests-physiques\.yaml/, 'une référence de tests n\'est pas une donnée de joueur');
});
