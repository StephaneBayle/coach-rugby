// Chargement des dépendances Node de l'outillage (yaml, ajv).
//
// Installé comme plugin, l'outillage vit dans ${CLAUDE_PLUGIN_ROOT} (remplacé
// à chaque mise à jour) ; ses node_modules sont soit à côté (installation
// automatique de Claude Code), soit dans ${CLAUDE_PLUGIN_DATA} (installation de
// secours par le hook SessionStart). En développement et en CI, ils sont dans
// plugin/node_modules. On essaie tous ces emplacements.
//
// Si rien n'est trouvé, l'erreur porte le code DEPENDANCE_ABSENTE : la CLI
// sort alors en code 3 et le skill bascule sur le chemin manuel (B).
import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RACINE_PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PREFIXE = 'coach-rugby';

function candidats() {
  const liste = [];
  if (process.env.COACH_RUGBY_DEPS) liste.push(process.env.COACH_RUGBY_DEPS);
  // CLAUDE_PLUGIN_DATA peut être exporté par un AUTRE plugin dans le shell :
  // ne le retenir que s'il désigne bien le dossier de données de ce plugin.
  const data0 = process.env.CLAUDE_PLUGIN_DATA;
  if (data0 && path.basename(data0).startsWith(PREFIXE)) liste.push(path.join(data0, 'node_modules'));
  liste.push(path.join(RACINE_PLUGIN, 'node_modules'));
  // Les commandes lancées par Claude via Bash ne reçoivent pas CLAUDE_PLUGIN_DATA :
  // chercher le dossier de données du plugin à son emplacement documenté.
  const data = path.join(homedir(), '.claude', 'plugins', 'data');
  if (existsSync(data)) {
    for (const d of readdirSync(data)) {
      if (d.startsWith(PREFIXE)) liste.push(path.join(data, d, 'node_modules'));
    }
  }
  return liste.filter((p) => existsSync(p));
}

const cache = new Map();

export function charger(nom) {
  if (cache.has(nom)) return cache.get(nom);
  for (const dossier of candidats()) {
    try {
      const mod = createRequire(path.join(dossier, '_'))(nom);
      cache.set(nom, mod);
      return mod;
    } catch {
      // essayer l'emplacement suivant
    }
  }
  const err = new Error(
    `Dépendance introuvable : ${nom}. L'outillage Node n'est pas disponible ici : ` +
      'suivre le chemin manuel (B) décrit dans references/outillage.md.',
  );
  err.code = 'DEPENDANCE_ABSENTE';
  throw err;
}
