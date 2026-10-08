// Recherche de Google Chrome / Chromium et impression PDF en headless.
// Sans Chrome, la fiche HTML s'imprime depuis n'importe quel navigateur
// (Imprimer > Enregistrer en PDF).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const CANDIDATS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

export function trouverChrome(env = process.env) {
  const explicite = env.COACH_RUGBY_CHROME || env.CLAUDE_PLUGIN_OPTION_CHEMIN_CHROME || env.CLAUDE_PLUGIN_OPTION_chemin_chrome;
  if (explicite) return existsSync(explicite) ? explicite : null;
  return CANDIDATS.find((c) => existsSync(c)) || null;
}

// Imprime `html` (fichier) en `pdf`. La taille de page vient du @page du HTML.
export function imprimerPdf(html, pdf, chrome = trouverChrome()) {
  if (!chrome) return { ok: false, raison: 'Chrome introuvable' };
  const r = spawnSync(
    chrome,
    ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(html).href],
    { encoding: 'utf8', timeout: 60_000 },
  );
  if (r.status !== 0 || !existsSync(pdf)) return { ok: false, raison: (r.stderr || r.error?.message || 'échec de Chrome').split('\n')[0] };
  return { ok: true };
}
