// Dossier saison du coach :
//
//   <dossier>/
//   ├── .coach-rugby.yaml          configuration (structure, préférences)
//   ├── .joueurs-proteges.txt      noms à ne jamais publier (un par ligne)
//   ├── _bibliotheque-perso/       exercices personnels du coach
//   └── <equipe>/                  une équipe ou un groupe par dossier
//       ├── equipe.yaml
//       ├── saison.yaml
//       ├── journal.md             notes datées (on ajoute, on n'efface pas)
//       └── seances/<AAAA-MM-JJ>/  seance.yaml, relecture.md, exports/
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { FICHIER_CONFIG, FICHIER_JOUEURS_PROTEGES, racineGit } from './chemins.mjs';
import { controlerExercice } from './bibliotheque.mjs';
import { controlerEquipe, controlerSaison } from './controles.mjs';
import { RACINE_PLUGIN } from './deps.mjs';
import { valider } from './schemas.mjs';
import { controlerCodes } from './effectif.mjs';
import { controlerCharge } from './charge.mjs';
import { controlerMatch } from './match.mjs';
import { controlerCycles, controlerSemaine } from './planification.mjs';
import { contexteSeance, controlerSeance } from './seance.mjs';
import { ecrireYaml, lireYaml } from './yaml.mjs';

const ENTETE_CONFIG = '# Configuration du dossier saison coach-rugby. Ce dossier reste sur votre ordinateur.';

// Crée le dossier saison s'il n'existe pas. Ne remplace jamais un fichier
// existant. Renvoie { crees: [...], alerte: texte|null }.
export function initialiser(dossier, { structure = 'club', nom } = {}) {
  const crees = [];
  mkdirSync(dossier, { recursive: true });
  const config = path.join(dossier, FICHIER_CONFIG);
  if (!existsSync(config)) {
    const libelles = structure === 'club' ? { groupe: 'équipe', encadrant: 'éducateur' } : { groupe: 'groupe', encadrant: 'entraîneur' };
    const donnees = { version_schema: 1, structure: { type: structure, ...(nom ? { nom } : {}), libelles }, preferences: { formats: ['a4', 'telephone'] } };
    ecrireYaml(config, donnees, ENTETE_CONFIG);
    crees.push(FICHIER_CONFIG);
  }
  const proteges = path.join(dossier, FICHIER_JOUEURS_PROTEGES);
  if (!existsSync(proteges)) {
    copyFileSync(path.join(RACINE_PLUGIN, 'gabarits', 'joueurs-proteges.exemple.txt'), proteges);
    crees.push(FICHIER_JOUEURS_PROTEGES);
  }
  const perso = path.join(dossier, '_bibliotheque-perso', 'exercices');
  if (!existsSync(perso)) {
    mkdirSync(perso, { recursive: true });
    crees.push('_bibliotheque-perso/exercices/');
  }
  const git = racineGit(dossier);
  const alerte = git
    ? `Attention : le dossier saison est dans un dépôt git (${git}). Vos données pourraient être publiées par erreur : choisissez un dossier hors de tout dépôt.`
    : null;
  return { crees, alerte };
}

export function equipes(dossier) {
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier)
    .filter((d) => !d.startsWith('.') && !d.startsWith('_'))
    .filter((d) => statSync(path.join(dossier, d)).isDirectory() && existsSync(path.join(dossier, d, 'equipe.yaml')))
    .sort();
}

// Schéma applicable à un fichier, d'après son nom.
export function schemaDe(fichier) {
  const base = path.basename(fichier);
  if (base === FICHIER_CONFIG) return 'config';
  if (base === 'equipe.yaml') return 'equipe';
  if (base === 'saison.yaml') return 'saison';
  if (base === 'categories.yaml') return 'categories';
  if (base === 'sources.yaml') return 'sources';
  if (base === 'planification.yaml') return 'planification';
  if (base === 'cycles.yaml') return 'cycles';
  if (base === 'semaine.yaml') return 'semaine';
  if (base === 'effectif.yaml') return 'effectif';
  if (base === 'presences.yaml') return 'presences';
  if (base === 'progres.yaml') return 'progres';
  if (base === 'competences.yaml') return 'competences';
  if (base === 'match.yaml') return 'match';
  if (base === 'charge.yaml') return 'charge';
  if (base === 'seance.yaml') return 'seance';
  if (/[\\/]bibliotheque[\\/]exercices[\\/][^\\/]+\.yaml$/.test(fichier) || /[\\/]_bibliotheque-perso[\\/]exercices[\\/][^\\/]+\.yaml$/.test(fichier)) return 'exercice';
  return null;
}

let sources;
function idsSources() {
  sources ??= new Set(lireYaml(path.join(RACINE_PLUGIN, 'references', 'sources.yaml')).sources.map((s) => s.id));
  return sources;
}

function validerFichier(fichier) {
  const schema = schemaDe(fichier);
  if (!schema) return null;
  let donnees;
  try {
    donnees = lireYaml(fichier);
  } catch (e) {
    if (e.code === 'DEPENDANCE_ABSENTE') throw e;
    return { fichier, erreurs: [`YAML illisible : ${e.message.split('\n')[0]}`] };
  }
  let erreurs;
  try {
    erreurs = valider(schema, donnees);
  } catch (e) {
    if (e.code === 'DEPENDANCE_ABSENTE') throw e;
    return { fichier, erreurs: [e.message] };
  }
  if (!erreurs.length) {
    if (schema === 'saison') erreurs = controlerSaison(donnees);
    if (schema === 'equipe') erreurs = controlerEquipe(donnees, path.basename(path.dirname(fichier)));
    if (schema === 'exercice') erreurs = controlerExercice({ fichier, ...donnees }, { sources: idsSources() });
    if (schema === 'cycles') {
      const fs = path.join(path.dirname(fichier), 'saison.yaml');
      erreurs = controlerCycles(donnees, { saison: existsSync(fs) ? lireYaml(fs) : null });
    }
    if (schema === 'semaine') {
      const d = path.resolve(path.dirname(fichier), '..', '..');
      const lire = (f) => (existsSync(path.join(d, f)) ? lireYaml(path.join(d, f)) : null);
      erreurs = controlerSemaine(donnees, { equipe: lire('equipe.yaml'), saison: lire('saison.yaml'), cycles: lire('cycles.yaml'), nomDossier: path.basename(path.dirname(fichier)) });
    }
    if (schema === 'effectif') {
      const codes = donnees.joueurs.map((j) => j.code);
      erreurs = codes.filter((c, i) => codes.indexOf(c) !== i).map((c) => `code ${c} en double`);
      if (donnees.equipe !== path.basename(path.dirname(fichier))) erreurs.push(`équipe « ${donnees.equipe} » différente du dossier`);
    }
    if (schema === 'presences' || schema === 'progres') {
      const fe = path.join(path.dirname(fichier), 'effectif.yaml');
      const effectif = existsSync(fe) ? lireYaml(fe) : null;
      const codes = schema === 'presences'
        ? donnees.dates.flatMap((d) => [...d.presents, ...(d.excuses || [])])
        : donnees.observations.map((o) => o.code);
      erreurs = controlerCodes(codes, effectif, schema);
      if (schema === 'presences') {
        for (const d of donnees.dates) {
          const doublon = (d.excuses || []).filter((c) => d.presents.includes(c));
          if (doublon.length) erreurs.push(`${d.date} : ${doublon.join(', ')} à la fois présent et excusé`);
        }
      } else {
        const ids = new Set(lireYaml(path.join(RACINE_PLUGIN, 'references', 'competences.yaml')).competences.map((c) => c.id));
        for (const o of donnees.observations) if (!ids.has(o.competence)) erreurs.push(`compétence inconnue : ${o.competence}`);
      }
    }
    if (schema === 'charge') {
      const d = path.dirname(fichier);
      const lire = (f) => (existsSync(path.join(d, f)) ? lireYaml(path.join(d, f)) : null);
      erreurs = controlerCharge(donnees, { equipe: lire('equipe.yaml'), effectif: lire('effectif.yaml') });
      if (donnees.equipe !== path.basename(d)) erreurs.push(`équipe « ${donnees.equipe} » différente du dossier`);
    }
    if (schema === 'match') {
      const d = path.resolve(path.dirname(fichier), '..', '..');
      const lire = (f) => (existsSync(path.join(d, f)) ? lireYaml(path.join(d, f)) : null);
      erreurs = controlerMatch(donnees, { equipe: lire('equipe.yaml'), effectif: lire('effectif.yaml') });
      if (path.basename(path.dirname(fichier)) !== donnees.date) erreurs.push(`date « ${donnees.date} » différente du nom du dossier`);
    }
    if (schema === 'seance') {
      const { equipe, dossierSaison } = contexteSeance(fichier);
      erreurs = controlerSeance(donnees, { equipe, dossierSaison, nomDossier: path.basename(path.dirname(fichier)) });
    }
  }
  return { fichier, erreurs };
}

// Valide un fichier, ou tous les fichiers connus d'un dossier (récursif).
export function validerChemin(chemin) {
  if (!existsSync(chemin)) return [{ fichier: chemin, erreurs: ['chemin introuvable'] }];
  if (statSync(chemin).isFile()) {
    const r = validerFichier(chemin);
    return r ? [r] : [{ fichier: chemin, erreurs: ['type de fichier inconnu (aucun schéma associé)'] }];
  }
  const resultats = [];
  const parcourir = (d) => {
    for (const e of readdirSync(d).sort()) {
      if (e === 'node_modules' || e === 'exports' || e === 'results') continue;
      const p = path.join(d, e);
      if (statSync(p).isDirectory()) parcourir(p);
      else {
        const r = validerFichier(p);
        if (r) resultats.push(r);
      }
    }
  };
  parcourir(chemin);
  return resultats;
}

export function chargerEquipe(dossier, id) {
  const d = path.join(dossier, id);
  const equipe = lireYaml(path.join(d, 'equipe.yaml'));
  const fs = path.join(d, 'saison.yaml');
  const saison = existsSync(fs) ? lireYaml(fs) : null;
  return { dossier: d, equipe, saison };
}
