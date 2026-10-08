// Lecture et écriture YAML (dépendance « yaml »).
import { readFileSync, writeFileSync } from 'node:fs';
import { charger } from './deps.mjs';

export function lireYaml(fichier) {
  const YAML = charger('yaml');
  return YAML.parse(readFileSync(fichier, 'utf8'));
}

export function ecrireYaml(fichier, donnees, entete = '') {
  const YAML = charger('yaml');
  // Heures entre guillemets (« heure: "20:00" ») : non ambiguës pour les
  // lecteurs YAML 1.1 (#29).
  const texte = YAML.stringify(donnees, { lineWidth: 0 }).replace(/^(\s*(?:- )?heure: )(\d{2}:\d{2})$/gm, '$1"$2"');
  writeFileSync(fichier, entete ? `${entete.trimEnd()}\n${texte}` : texte);
}
