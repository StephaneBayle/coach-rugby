// Validation des fichiers YAML par JSON Schema (draft 2020-12).
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { charger, RACINE_PLUGIN } from './deps.mjs';

let ajv;

function instance() {
  if (ajv) return ajv;
  const Ajv2020 = charger('ajv/dist/2020').default;
  const formats = charger('ajv-formats').default;
  ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  formats(ajv);
  const dossier = path.join(RACINE_PLUGIN, 'schemas');
  for (const f of readdirSync(dossier).filter((f) => f.endsWith('.schema.json'))) {
    ajv.addSchema(JSON.parse(readFileSync(path.join(dossier, f), 'utf8')));
  }
  return ajv;
}

// Renvoie la liste des erreurs (vide si valide), en français lisible.
export function valider(nomSchema, donnees) {
  const v = instance().getSchema(`cr:${nomSchema}`);
  if (!v) throw new Error(`Schéma inconnu : ${nomSchema}`);
  if (v(donnees)) return [];
  return v.errors.map((e) => {
    const ou = e.instancePath || '(racine)';
    const detail = e.params && Object.keys(e.params).length ? ` ${JSON.stringify(e.params)}` : '';
    return `${ou} : ${e.message}${detail}`;
  });
}
