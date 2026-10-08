// Effectif en codes, table locale des prénoms, présences, progrès (RGPD).
//
// Les prénoms de test sont assemblés par concaténation : le code source ne
// contient ainsi aucun prénom « en clair ».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { absencesRepetees, ecrirePrenoms, lirePrenoms, prenomsDuDossier, prochainCode, synchroniserProteges, tauxDePresence } from '../plugin/lib/effectif.mjs';
import { valider } from '../plugin/lib/schemas.mjs';
import { validerChemin } from '../plugin/lib/dossier.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ex = path.join(racine, 'plugin', 'exemples', 'fictif-m10-les-ecureuils');
const PRENOM = 'Zébu' + 'lon';
const AUTRE = 'Ber' + 'tille';
const cli = (env, ...a) => spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, ...env } });
const copie = () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-eff-')), 'Rugby-Saisons');
  cpSync(ex, d, { recursive: true });
  return d;
};

test('schéma effectif : aucun nom, indisponibilité sans motif', () => {
  assert.deepEqual(valider('effectif', { equipe: 'm10', joueurs: [{ code: 'J01', disponible: true }] }), []);
  assert.ok(valider('effectif', { equipe: 'm10', joueurs: [{ code: 'J01', disponible: true, prenom: PRENOM }] }).length > 0);
  assert.ok(valider('effectif', { equipe: 'm10', joueurs: [{ code: 'J01', disponible: false, motif: 'blessure' }] }).length > 0);
  assert.ok(valider('effectif', { equipe: 'm10', joueurs: [{ code: PRENOM, disponible: true }] }).length > 0, 'un code est J suivi de chiffres');
});

test('schéma progrès : trois niveaux, aucun commentaire', () => {
  const o = { code: 'J01', competence: 'fixer-et-passer', niveau: 'acquis', date: '2026-10-07' };
  assert.deepEqual(valider('progres', { equipe: 'm10', observations: [o] }), []);
  assert.ok(valider('progres', { equipe: 'm10', observations: [{ ...o, niveau: 'excellent' }] }).length > 0);
  assert.ok(valider('progres', { equipe: 'm10', observations: [{ ...o, commentaire: 'x' }] }).length > 0);
});

test('exemples M10 : effectif, présences et progrès valides et cohérents', () => {
  const r = validerChemin(path.join(ex, 'm10'));
  assert.deepEqual(r.flatMap((x) => x.erreurs), []);
  assert.ok(r.some((x) => x.fichier.endsWith('progres.yaml')));
});

test('contrôles : code inconnu, présent et excusé à la fois, compétence inconnue', () => {
  const d = copie();
  const fp = path.join(d, 'm10', 'presences.yaml');
  writeFileSync(fp, 'equipe: m10\ndates:\n  - { date: 2026-10-14, type: seance, presents: [J01, J99], excuses: [J01] }\n');
  const e = validerChemin(fp).flatMap((x) => x.erreurs).join('\n');
  assert.match(e, /J99 absent de effectif\.yaml/);
  assert.match(e, /J01 à la fois présent et excusé/);
  const fg = path.join(d, 'm10', 'progres.yaml');
  writeFileSync(fg, 'equipe: m10\nobservations:\n  - { code: J01, competence: voler, niveau: acquis, date: 2026-10-14 }\n');
  assert.match(validerChemin(fg).flatMap((x) => x.erreurs).join('\n'), /compétence inconnue : voler/);
});

test('table des prénoms : lecture, écriture, synchronisation avec les joueurs protégés', () => {
  const d = copie();
  const e = path.join(d, 'm10');
  ecrirePrenoms(e, { J01: PRENOM, J02: AUTRE });
  assert.deepEqual(lirePrenoms(e), { J01: PRENOM, J02: AUTRE });
  assert.deepEqual(prenomsDuDossier(d).sort(), [AUTRE, PRENOM].sort());
  assert.deepEqual(synchroniserProteges(d).sort(), [AUTRE, PRENOM].sort());
  assert.deepEqual(synchroniserProteges(d), [], 'pas de doublon');
  assert.match(readFileSync(path.join(d, '.joueurs-proteges.txt'), 'utf8'), new RegExp(PRENOM));
});

test('garde RGPD : un prénom de la table est bloqué dans le dépôt, même absent de la liste protégée', () => {
  const d = copie();
  ecrirePrenoms(path.join(d, 'm10'), { J03: PRENOM });
  const depot = mkdtempSync(path.join(tmpdir(), 'cr-eff-depot-'));
  execFileSync('git', ['init', '-q'], { cwd: depot });
  execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/StephaneBayle/coach-rugby.git'], { cwd: depot });
  const r = spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'garde-rgpd.mjs')], {
    input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: path.join(depot, 'a.md'), content: `absent : ${PRENOM}` }, cwd: depot }),
    encoding: 'utf8', env: { ...process.env, COACH_RUGBY_DOSSIER: d },
  });
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /nom protégé/);
});

test('CI : table des prénoms et progrès versionnés sont refusés', () => {
  const depot = mkdtempSync(path.join(tmpdir(), 'cr-eff-ci-'));
  execFileSync('git', ['init', '-q'], { cwd: depot });
  mkdirSync(path.join(depot, 'equipe'));
  writeFileSync(path.join(depot, 'equipe', '.prenoms.yaml'), 'J01: X\n');
  writeFileSync(path.join(depot, 'equipe', 'progres.yaml'), 'equipe: x\n');
  execFileSync('git', ['add', '-f', '.'], { cwd: depot });
  const r = spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'garde-rgpd.mjs'), '--depot', depot], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /table des prénoms/);
  assert.match(r.stdout, /progrès de joueurs/);
});

test("aucune table de prénoms dans le dépôt, et aucun export ne lit la table", () => {
  const trouves = execFileSync('git', ['ls-files'], { cwd: racine, encoding: 'utf8' }).split('\n').filter((f) => /\.prenoms\.ya?ml$/.test(f));
  assert.deepEqual(trouves, []);
  const lecteurs = readdirSync(path.join(racine, 'plugin', 'lib'))
    .filter((f) => f.endsWith('.mjs') && f !== 'effectif.mjs')
    .filter((f) => /lirePrenoms|prenomsDuDossier|\.prenoms\.ya?ml/.test(readFileSync(path.join(racine, 'plugin', 'lib', f), 'utf8')));
  assert.deepEqual(lecteurs, [], 'seul effectif.mjs lit la table (les exports ne doivent jamais la lire)');
});

test('présences : taux et absences répétées', () => {
  const effectif = lireYaml(path.join(ex, 'm10', 'effectif.yaml'));
  const presences = lireYaml(path.join(ex, 'm10', 'presences.yaml'));
  const t = tauxDePresence(effectif, presences);
  assert.deepEqual(t.J01, { presents: 4, total: 4, taux: 100 });
  assert.deepEqual(absencesRepetees(effectif, presences), ['J15']);
  assert.equal(prochainCode(['J01', 'J09', 'J10']), 'J11');
});

test('CLI : effectif --ajouter et presences --bilan, --prenoms affiche la table', () => {
  const d = copie();
  ecrirePrenoms(path.join(d, 'm10'), { J01: PRENOM });
  const env = { COACH_RUGBY_DOSSIER: d };
  assert.match(cli(env, 'effectif', 'm10', '--ajouter', '2').stdout, /18 joueur\(s\)/);
  assert.doesNotMatch(cli(env, 'effectif', 'm10').stdout, new RegExp(PRENOM), 'pas de prénom sans --prenoms');
  assert.match(cli(env, 'effectif', 'm10', '--prenoms').stdout, new RegExp(`J01 \\(${PRENOM}\\)`));
  assert.ok(existsSync(path.join(d, '.joueurs-proteges.txt')));
  assert.match(cli(env, 'presences', 'm10', '--bilan').stdout, /Absents aux 3 dernières dates : J15/);
  assert.equal(cli(env, 'presences', 'm10', '--date', '2026-10-14', '--presents', 'J01,J99').status, 1);
});
