// Garde RGPD : hook PreToolUse et analyse du dépôt (CI).
//
// Les données personnelles de test sont assemblées par concaténation : le
// code source de ce fichier ne contient ainsi aucun motif détectable, et le
// job CI donnees-personnelles reste vert.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyser } from '../plugin/lib/rgpd.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const garde = path.join(racine, 'plugin', 'scripts', 'garde-rgpd.mjs');

const NOM = 'Zébulon ' + 'Testard';
const DDN = 'né le ' + '12/03/2016';
const TEL = '06 12 ' + '34 56 78';
const MAIL = 'zebulon.testard' + '@' + 'club-fictif.fr';
const LICENCE = 'licence n° ' + '1234567';

// Dossier saison temporaire avec un joueur protégé.
const saison = mkdtempSync(path.join(tmpdir(), 'cr-garde-saison-'));
writeFileSync(path.join(saison, '.coach-rugby.yaml'), 'version_schema: 1\nstructure: { type: club }\n');
writeFileSync(path.join(saison, '.joueurs-proteges.txt'), `# test\n${NOM}\n`);

function depot(remote = 'https://github.com/StephaneBayle/coach-rugby.git') {
  const d = mkdtempSync(path.join(tmpdir(), 'cr-garde-depot-'));
  const g = (...a) => execFileSync('git', a, { cwd: d, stdio: 'ignore' });
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 'test@example.com');
  g('config', 'user.name', 'Test');
  g('remote', 'add', 'origin', remote);
  writeFileSync(path.join(d, 'README.md'), 'Dépôt de test\n');
  g('add', '.');
  g('commit', '-q', '-m', 'init');
  return d;
}

function hook(entree) {
  return spawnSync(process.execPath, [garde], {
    input: JSON.stringify(entree),
    encoding: 'utf8',
    env: { ...process.env, COACH_RUGBY_DOSSIER: saison },
  });
}
const bash = (command, cwd) => hook({ tool_name: 'Bash', tool_input: { command }, cwd });
const ecrire = (file_path, content, cwd) => hook({ tool_name: 'Write', tool_input: { file_path, content }, cwd });

test('analyser : motifs détectés', () => {
  const types = (t) => analyser(t).map((c) => c.type);
  assert.deepEqual(types(`Contact : ${TEL}`), ['telephone']);
  assert.deepEqual(types(`Joueur ${DDN}`), ['date-de-naissance']);
  assert.deepEqual(types('né le ' + '3 mars 2016'), ['date-de-naissance']);
  assert.deepEqual(types(`écrire à ${MAIL}`), ['email']);
  assert.deepEqual(types(LICENCE), ['licence']);
  const sansAccentEnMajuscules = NOM.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  assert.deepEqual(analyser(`absent : ${sansAccentEnMajuscules}.`, [NOM]).map((c) => c.type), ['nom-protege']);
  assert.deepEqual(analyser(`le petit ${NOM.toLowerCase()} a couru`, [NOM]).map((c) => c.type), ['nom-protege']);
});

test('analyser : pas de faux positif courant', () => {
  for (const t of [
    'license MIT AND CC-BY-SA-4.0',
    'licence CC BY-SA 4.0',
    'Co-Authored-By: Claude <noreply@anthropic.com>',
    'saison 2026-2027, match le 2026-10-18 à 15:00',
    'séance de 75 min pour 14 enfants, 2 éducateurs',
    'ecart de 12 34 56 points',
    // Faux positif corrigé en 0.2.0 : « …ne le <date> » n'est pas « né le ».
    'le cycle se termine' + ' le 2026-12-18',
    'la semaine' + ' le 12/10/2026',
  ]) assert.deepEqual(analyser(t), [], t);
});

test('limite assumée : un prénom isolé non listé n’est pas détecté', () => {
  assert.deepEqual(analyser('Bravo à Zébulon pour son essai'), []);
});

test('marqueur rgpd:fictif : la ligne est ignorée', () => {
  assert.deepEqual(analyser(`exemple ${TEL} // rgpd:fictif`), []);
});

test('bloque un commit qui ajoute un nom protégé', () => {
  const d = depot();
  writeFileSync(path.join(d, 'notes.md'), `Séance : ${NOM} absent\n`);
  execFileSync('git', ['add', '.'], { cwd: d });
  const r = bash('git commit -m "notes"', d);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /nom protégé/);
  assert.doesNotMatch(r.stderr, new RegExp(NOM), 'le message ne recopie pas le nom');
});

test('laisse passer un commit qui RETIRE un nom protégé', () => {
  const d = depot();
  writeFileSync(path.join(d, 'notes.md'), `${NOM}\n`);
  execFileSync('git', ['add', '.'], { cwd: d });
  execFileSync('git', ['commit', '-q', '-m', 'avant'], { cwd: d });
  writeFileSync(path.join(d, 'notes.md'), 'retiré\n');
  execFileSync('git', ['add', '.'], { cwd: d });
  assert.equal(bash('git commit -m "retrait"', d).status, 0);
});

test("ignore le lockfile npm (adresses d'auteurs de paquets), comme le mode CI", () => {
  const d = depot();
  mkdirSync(path.join(d, 'plugin'));
  writeFileSync(path.join(d, 'plugin', 'package-lock.json'), `{ "deprecated": "contacter ${MAIL}" }\n`);
  execFileSync('git', ['add', '.'], { cwd: d });
  assert.equal(bash('git commit -m "deps"', d).status, 0);
  writeFileSync(path.join(d, 'notes.md'), `${MAIL}\n`);
  execFileSync('git', ['add', '.'], { cwd: d });
  assert.equal(bash('git commit -m "notes"', d).status, 2, 'les autres fichiers restent contrôlés');
});

test('bloque les options globales de git qui masquent la sous-commande', () => {
  const d = depot();
  writeFileSync(path.join(d, 'a.md'), `${TEL}\n`);
  execFileSync('git', ['add', '.'], { cwd: d });
  assert.equal(bash(`git -C "${d}" -c core.quotepath=off commit -m x`, tmpdir()).status, 2);
});

test('bloque une issue gh qui contient une date de naissance', () => {
  const r = bash(`gh issue create -R StephaneBayle/coach-rugby -t "Bug" -b "Mon joueur ${DDN}"`, tmpdir());
  assert.equal(r.status, 2);
  assert.match(r.stderr, /date de naissance/);
});

test('bloque un --body-file qui contient un téléphone', () => {
  const f = path.join(mkdtempSync(path.join(tmpdir(), 'cr-corps-')), 'corps.md');
  writeFileSync(f, `Appeler le ${TEL}\n`);
  assert.equal(bash(`gh pr create -R StephaneBayle/coach-rugby --body-file ${f}`, tmpdir()).status, 2);
});

test('laisse passer une issue propre', () => {
  assert.equal(bash('gh issue create -R StephaneBayle/coach-rugby -t "Idée" -b "Un jeu à 5 contre 5 pour 14 enfants"', tmpdir()).status, 0);
});

test("bloque l'écriture d'une adresse e-mail dans le dépôt, accepte noreply@anthropic.com", () => {
  const d = depot();
  assert.equal(ecrire(path.join(d, 'doc.md'), `Contact : ${MAIL}`, d).status, 2);
  assert.equal(ecrire(path.join(d, 'doc.md'), 'Co-Authored-By: Claude <noreply@anthropic.com>', d).status, 0);
});

test('écrire dans le dossier saison est toujours autorisé', () => {
  const d = depot();
  assert.equal(ecrire(path.join(saison, 'notes.md'), `${NOM} ${DDN}`, d).status, 0);
});

test('ne fait rien dans un autre dépôt', () => {
  const d = depot('https://github.com/quelquun/autre-projet.git');
  writeFileSync(path.join(d, 'a.md'), `${NOM}\n`);
  execFileSync('git', ['add', '.'], { cwd: d });
  assert.equal(bash('git commit -m x', d).status, 0);
  assert.equal(ecrire(path.join(d, 'b.md'), TEL, d).status, 0);
});

test('mode --depot : refuse une liste de joueurs versionnée et une donnée personnelle', () => {
  const d = depot();
  writeFileSync(path.join(d, '.joueurs-proteges.txt'), '# vide\n');
  mkdirSync(path.join(d, 'docs'));
  writeFileSync(path.join(d, 'docs', 'contact.md'), `${TEL}\n`);
  execFileSync('git', ['add', '-f', '.'], { cwd: d });
  const r = spawnSync(process.execPath, [garde, '--depot', d], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /fichier interdit/);
  assert.match(r.stdout, /numéro de téléphone/);
});

test('mode --depot : le dépôt coach-rugby lui-même est propre', () => {
  const r = spawnSync(process.execPath, [garde, '--depot', racine], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
});
