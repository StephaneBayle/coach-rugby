// Lecture et écriture YAML (dépendance « yaml »).
import { readFileSync, writeFileSync } from 'node:fs';
import { charger } from './deps.mjs';

export function lireYaml(fichier) {
  const YAML = charger('yaml');
  return YAML.parse(readFileSync(fichier, 'utf8'));
}

export function ecrireYaml(fichier, donnees, entete = '') {
  const YAML = charger('yaml');
  const texte = YAML.stringify(donnees, { lineWidth: 0 });
  writeFileSync(fichier, entete ? `${entete.trimEnd()}\n${texte}` : texte);
}
