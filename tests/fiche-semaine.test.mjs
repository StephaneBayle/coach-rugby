// Fiche semaine : autonome, deux formats, vocabulaire de l'école de rugby, PDF.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { trouverChrome } from '../plugin/lib/chrome.mjs';
import { exporterSemaine } from '../plugin/lib/export.mjs';

const ex = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'plugin', 'exemples');
const copie = (club, equipe) => {
  const d = path.join(mkdtempSync(path.join(tmpdir(), 'cr-sem-')), 'saison');
  cpSync(path.join(ex, club), d, { recursive: true });
  return path.join(d, equipe, 'semaines', '2026-10-12', 'semaine.yaml');
};

test('fiche semaine F3 : 7 jours, derby en jour J, activation jeudi, cycle en cours, autonome', () => {
  const f = copie('fictif-seniors-f3-les-goelands', 'seniors-f3');
  exporterSemaine(f);
  for (const format of ['a4', 'telephone']) {
    const html = readFileSync(path.join(path.dirname(f), 'exports', `fiche-semaine-${format}.html`), 'utf8');
    assert.doesNotMatch(html, /\{\{|@repeter/);
    assert.doesNotMatch(html, /<(link|script)[\s>]|src="http/);
    assert.match(html, new RegExp(`class="format-${format}"`));
    assert.equal((html.match(/<td class="j">(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) /g) || []).length, 7, 'une ligne par jour');
    assert.match(html, /MATCH contre RC Voisinville \(derby\)/);
    assert.match(html, /jeudi 15 octobre<\/td><td class="j">J-3<\/td><td>19:30, 90 min<\/td><td><span class="intensite">activation \(affûtage\)/);
    assert.match(html, /▶ c04/);
    assert.match(html, /à vérifier \(saison 2026-2027\)/);
  }
});

test('fiche semaine M10 : jamais le mot « affûtage », plateau en jour J', () => {
  const f = copie('fictif-m10-les-ecureuils', 'm10');
  exporterSemaine(f, { formats: ['a4'] });
  const html = readFileSync(path.join(path.dirname(f), 'exports', 'fiche-semaine-a4.html'), 'utf8');
  assert.doesNotMatch(html, /affûtage/i);
  assert.match(html, /samedi 17 octobre<\/td><td class="j">jour J<\/td><td>PLATEAU/);
});

test('PDF de la fiche semaine (ignoré si Chrome est absent)', { skip: !trouverChrome() && 'Chrome introuvable' }, () => {
  const f = copie('fictif-seniors-f3-les-goelands', 'seniors-f3');
  const r = exporterSemaine(f, { pdf: true });
  assert.ok(r.pdf.ok, r.pdf.raison);
  const pdf = readFileSync(path.join(path.dirname(f), 'exports', 'fiche-semaine-a4.pdf')).toString('latin1');
  assert.match(pdf, /\/MediaBox \[0 0 59[45]\.\d+ 841\.\d+\]/);
});
