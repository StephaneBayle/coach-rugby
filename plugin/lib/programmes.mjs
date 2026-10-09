// Programmes hors terrain (trêve, intersaison, salle) : génériques, sans
// donnée personnelle, remis aux joueurs. Contrôle de cohérence avec les
// fiches citées et avec les repères d'âge de la salle.
import path from 'node:path';
import { chargerBibliotheque } from './bibliotheque.mjs';
import { parametresCharge } from './charge.mjs';
import { RACINE_PLUGIN } from './deps.mjs';
import { lireYaml } from './yaml.mjs';

export const chargerProgrammes = () => lireYaml(path.join(RACINE_PLUGIN, 'references', 'programmes-hors-terrain.yaml'));

export function controlerProgrammes(ref, { sources = new Set() } = {}) {
  const erreurs = [];
  const fiches = new Map(chargerBibliotheque().map((f) => [f.id, f]));
  const salle = parametresCharge().salle;
  const ids = new Set();
  for (const p of ref.programmes) {
    if (ids.has(p.id)) erreurs.push(`programme ${p.id} en double`);
    ids.add(p.id);
    for (const f of p.fiches || []) {
      const fiche = fiches.get(f);
      if (!fiche) erreurs.push(`${p.id} : fiche inconnue ${f}`);
      else for (const c of p.categories) if (!fiche.categories.includes(c)) erreurs.push(`${p.id} : la fiche ${f} ne vise pas la catégorie ${c}`);
    }
    if (p.lieu === 'salle') {
      for (const c of p.categories) {
        if (salle.poids_du_corps_seulement.categories.includes(c)) erreurs.push(`${p.id} : pas de salle pour ${c}`);
        if (salle.technique.categories.includes(c) && !p.securite.some((s) => /encadr/i.test(s))) erreurs.push(`${p.id} : salle avec des moins de 16 ans sans mention d'encadrement`);
      }
    }
    for (const s of p.sources || []) if (sources.size && !sources.has(s)) erreurs.push(`${p.id} : source inconnue ${s}`);
  }
  return erreurs;
}
