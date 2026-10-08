// Emplacement du dossier saison du coach, toujours HORS du dépôt.
//
// Ordre de résolution :
//   1. COACH_RUGBY_DOSSIER : choix explicite (tests, coach averti) ; alias
//      EVAL_COACH_RUGBY_DOSSIER pour `claude plugin eval` ;
//   2. le dossier courant s'il contient .coach-rugby.yaml (cas de Cowork, où
//      le coach sélectionne son dossier de travail) ;
//   3. l'option du plugin : COACH_RUGBY_OPTION_DOSSIER (passée par les
//      skills depuis ${user_config.dossier_saison}) ou
//      CLAUDE_PLUGIN_OPTION_DOSSIER_SAISON (environnement des hooks) ;
//   4. ~/Rugby-Saisons.
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

export const FICHIER_CONFIG = '.coach-rugby.yaml';
export const FICHIER_JOUEURS_PROTEGES = '.joueurs-proteges.txt';
export const DOSSIER_PAR_DEFAUT = '~/Rugby-Saisons';

export function developperTilde(p) {
  if (!p) return p;
  if (p === '~') return homedir();
  if (p.startsWith('~/')) return path.join(homedir(), p.slice(2));
  return p;
}

export function dossierSaison({ cwd = process.cwd(), env = process.env } = {}) {
  const explicite = env.COACH_RUGBY_DOSSIER || env.EVAL_COACH_RUGBY_DOSSIER;
  if (explicite) return path.resolve(developperTilde(explicite));
  if (existsSync(path.join(cwd, FICHIER_CONFIG))) return path.resolve(cwd);
  const option =
    env.COACH_RUGBY_OPTION_DOSSIER || env.CLAUDE_PLUGIN_OPTION_DOSSIER_SAISON || env.CLAUDE_PLUGIN_OPTION_dossier_saison;
  return path.resolve(developperTilde(option || DOSSIER_PAR_DEFAUT));
}

export const fichierConfig = (dossier = dossierSaison()) => path.join(dossier, FICHIER_CONFIG);
export const fichierJoueursProteges = (dossier = dossierSaison()) => path.join(dossier, FICHIER_JOUEURS_PROTEGES);

// Racine git contenant `dossier`, ou null.
export function racineGit(dossier) {
  let d = path.resolve(dossier);
  while (true) {
    if (existsSync(path.join(d, '.git'))) return d;
    const parent = path.dirname(d);
    if (parent === d) return null;
    d = parent;
  }
}
