// Recherche de Google Chrome / Chromium et impression PDF en headless.
// Sans Chrome, la fiche HTML s'imprime depuis n'importe quel navigateur
// (Imprimer > Enregistrer en PDF).
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, statSync } from 'node:fs';
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
// Messages de Chrome sans conséquence (macOS headless), à ne pas remonter.
const BRUIT = /cv_display_link_mac|CVDisplayLink|GPU process|dbus/i;

// Chrome headless échoue parfois de façon passagère (constaté sur macOS) :
// on réessaie une fois avant de renoncer.
export function imprimerPdf(html, pdf, chrome = trouverChrome(), { essais = 2 } = {}) {
  if (!chrome) return { ok: false, raison: 'Chrome introuvable' };
  let raison = 'échec de Chrome';
  for (let i = 0; i < essais; i++) {
    rmSync(pdf, { force: true });
    const r = spawnSync(
      chrome,
      ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(html).href],
      { encoding: 'utf8', timeout: 60_000 },
    );
    if (r.status === 0 && existsSync(pdf) && statSync(pdf).size > 0) return { ok: true, essais: i + 1 };
    raison = (r.stderr || '').split('\n').find((l) => l.trim() && !BRUIT.test(l)) || r.error?.message || `code de sortie ${r.status}`;
  }
  return { ok: false, raison };
}
