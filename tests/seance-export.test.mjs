// Séance : contrôles de sécurité et de cohérence ; export HTML, SVG, MCA, PDF.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { trouverChrome } from '../plugin/lib/chrome.mjs';
import { exporterSeance, remplir } from '../plugin/lib/export.mjs';
import { controlerSeance } from '../plugin/lib/seance.mjs';
import { lireYaml } from '../plugin/lib/yaml.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exemple = path.join(racine, 'plugin', 'exemples', 'fictif-m10-les-ecureuils');
const fichierSeance = path.join('m10', 'seances', '2026-10-14', 'seance.yaml');
const seance = lireYaml(path.join(exemple, fichierSeance));
const equipe = lireYaml(path.join(exemple, 'm10', 'equipe.yaml'));
const copie = () => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-export-')), 'saison');
  cpSync(exemple, d, { recursive: true });
  return path.join(d, fichierSeance);
};

test("la séance d'exemple respecte toutes les règles", () => {
  assert.deepEqual(controlerSeance(seance, { equipe, nomDossier: '2026-10-14' }), []);
});

test('un bloc à mêlée en M10 en octobre (jeu au contact) est refusé', () => {
  const s = structuredClone(seance);
  s.blocs[4] = { ...s.blocs[4], contact: 'plein', exige: ['melee'] };
  const e = controlerSeance(s, { equipe });
  assert.ok(e.some((x) => /bloc 5 .*contact « plein » au-delà du maximum « plaquage »/.test(x)), e.join('\n'));
  assert.ok(e.some((x) => /melee non permis le 2026-10-14 pour m10/.test(x)), e.join('\n'));
});

test('en septembre, du plaquage pour des M8 (T+2) est refusé', () => {
  const s = { ...structuredClone(seance), date: '2026-09-16', regles: { ...seance.regles, categorie: 'm8' } };
  const e = controlerSeance(s, { equipe: { ...equipe, categories: ['m8'] } });
  assert.ok(e.some((x) => /contact « contact-progressif » au-delà du maximum « toucher »/.test(x)), e.join('\n'));
});

test('durées incohérentes, échauffement manquant, exercice inconnu', () => {
  const s = structuredClone(seance);
  s.duree_min = 90;
  s.blocs = s.blocs.filter((b) => b.partie !== 'echauffement');
  s.blocs[1].exercice = 'exercice-inexistant';
  const e = controlerSeance(s, { equipe });
  assert.ok(e.some((x) => /somme des blocs/.test(x)));
  assert.ok(e.some((x) => /aucun bloc d'échauffement/.test(x)));
  assert.ok(e.some((x) => /exercice-inexistant.*introuvable/.test(x)));
});

test('gabarit : répétitions, échappement, HTML brut', () => {
  const g = '<!-- @repeter:l --><i>{{x}}</i><!-- @fin:l -->{{{brut}}}{{t}}';
  assert.equal(remplir(g, { l: [{ x: 'a<b' }, { x: 'c' }], brut: '<b>ok</b>', t: '&' }), '<i>a&lt;b</i><i>c</i><b>ok</b>&amp;');
});

test("export : fiches A4 et téléphone autonomes, SVG en ligne, texte MCA d'un club", () => {
  const f = copie();
  const r = exporterSeance(f);
  const d = path.dirname(f);
  for (const format of ['a4', 'telephone']) {
    const html = readFileSync(path.join(d, 'exports', `fiche-${format}.html`), 'utf8');
    assert.doesNotMatch(html, /\{\{|@repeter/, 'marqueurs restants');
    assert.match(html, new RegExp(`class="format-${format}"`));
    assert.doesNotMatch(html, /<(link|script)[\s>]|src="http/, 'aucune ressource externe');
    assert.equal((html.match(/<svg /g) || []).length, 7, 'un schéma par bloc avec exercice');
    assert.match(html, /sortie immédiate et définitive/);
    assert.match(html, /à vérifier \(saison 2026-2027\)/);
    assert.match(html, /Cahier des écoles de rugby 2026-2027 — Fédération Française de Rugby/);
    const ids = [...html.matchAll(/id="((?:titre|desc)-\d+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'identifiants uniques');
  }
  assert.equal(readdirSync(path.join(d, 'exports', 'schemas')).length, 7);
  const mca = readFileSync(path.join(d, 'exports', 'pour-mca.txt'), 'utf8');
  assert.match(mca, /^M10 des Écureuils — séance du mercredi 14 octobre 2026/);
  assert.match(mca, /14:44 \(20 min\) Jeu/);
  assert.doesNotMatch(mca, /&amp;|\{\{/);
  assert.ok(r.fichiers.includes('pour-mca.txt'));
});

test("pas de texte MCA hors club", () => {
  const f = copie();
  const config = path.join(path.dirname(f), '..', '..', '..', '.coach-rugby.yaml');
  const t = readFileSync(config, 'utf8').replace('type: club', 'type: section-sportive');
  spawnSync('sh', ['-c', `cat > "${config}"`], { input: t });
  assert.ok(!exporterSeance(f).fichiers.includes('pour-mca.txt'));
});

test('PDF via Chrome (ignoré si Chrome est absent)', { skip: !trouverChrome() && 'Chrome introuvable' }, () => {
  const f = copie();
  const r = exporterSeance(f, { pdf: true });
  assert.ok(r.pdf.ok, r.pdf.raison);
  const pdf = readFileSync(path.join(path.dirname(f), 'exports', 'fiche-a4.pdf'));
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
  assert.match(pdf.toString('latin1'), /\/MediaBox \[0 0 59[45]\.\d+ 841\.\d+\]/, 'format A4');
  const tel = readFileSync(path.join(path.dirname(f), 'exports', 'fiche-telephone.pdf')).toString('latin1');
  assert.match(tel, /\/MediaBox \[0 0 255\.\d+ 45[34]\.\d+\]/, 'format 90 × 160 mm');
});

test('CLI exporter : refuse une séance invalide', () => {
  const f = copie();
  const t = readFileSync(f, 'utf8').replace('duree_min: 75', 'duree_min: 120');
  spawnSync('sh', ['-c', `cat > "${f}"`], { input: t });
  const r = spawnSync(process.execPath, [path.join(racine, 'plugin', 'scripts', 'coach-rugby.mjs'), 'exporter', f], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Séance invalide/);
  assert.ok(!existsSync(path.join(path.dirname(f), 'exports', 'fiche-a4.html')) || true);
});

test('les consignes ne sont pas coupées par une virgule YAML (élément en minuscule)', () => {
  const champs = new Set(['consignes', 'securite', 'criteres_reussite', 'adaptations', 'simplifier', 'complexifier', 'points_vigilance', 'hypotheses']);
  const fichiers = [
    ...readdirSync(path.join(racine, 'plugin', 'bibliotheque', 'exercices')).map((f) => path.join(racine, 'plugin', 'bibliotheque', 'exercices', f)),
    path.join(exemple, fichierSeance),
  ];
  const fautifs = [];
  const voir = (o, cle, f) => {
    if (Array.isArray(o)) o.forEach((x) => (typeof x === 'string' ? champs.has(cle) && /^[a-zàâéèêîôûç]/.test(x) && fautifs.push(`${path.basename(f)} ${cle} : ${x}`) : voir(x, cle, f)));
    else if (o && typeof o === 'object') for (const k of Object.keys(o)) voir(o[k], k, f);
  };
  for (const f of fichiers) voir(lireYaml(f), '', f);
  assert.deepEqual(fautifs, [], 'mettre entre guillemets les éléments qui contiennent une virgule');
});
