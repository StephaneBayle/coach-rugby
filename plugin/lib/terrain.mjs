// Génération des schémas de terrain en SVG à partir du bloc `schema:` d'une
// fiche d'exercice. Correspondance 1:1 avec references/conventions-terrain.md :
// Claude produit le même SVG à la main (chemin B) en suivant ces conventions.
//
// N'importe que des modules node:* (pas de dépendance).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const ELEMENTS = {
  attaquant: 'attaquant',
  porteur: 'porteur de balle',
  defenseur: 'défenseur',
  educateur: 'éducateur',
  ballon: 'ballon',
  plot: 'plot',
  piquet: 'piquet',
  bouclier: 'bouclier',
};

export const TRAJETS = {
  course: { libelle: 'course', style: '' },
  passe: { libelle: 'passe', style: 'stroke-dasharray="1 0.6"' },
  pied: { libelle: 'jeu au pied', style: 'stroke-dasharray="0.25 0.45" stroke-linecap="round"' },
  replacement: { libelle: 'replacement', style: 'stroke-opacity="0.6"' },
};

let defs;
function symboles() {
  if (defs) return defs;
  const gabarit = readFileSync(path.join(RACINE, 'gabarits', 'terrain.svg'), 'utf8');
  const m = /<!-- @symboles -->([\s\S]*?)<!-- @fin-symboles -->/.exec(gabarit);
  defs = m[1].trim().split('\n').map((l) => `    ${l.trim()}`).join('\n');
  return defs;
}

const n = (v) => Number(Number(v).toFixed(2)).toString();
const echapper = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Facteur d'échelle des symboles et des textes : lisibles de l'atelier
// (20 × 15 m) au grand terrain (100 × 70 m).
export const echelleDe = (surface) => Math.max(1, Math.max(surface.longueur, surface.largeur) / 25);

// Erreurs de cohérence d'un schéma (éléments hors surface, types inconnus).
export function controlerSchema(schema) {
  const erreurs = [];
  const { longueur: L, largeur: l } = schema.surface;
  const dedans = ([x, y]) => x >= 0 && x <= L && y >= 0 && y <= l;
  for (const e of schema.elements || []) {
    if (!ELEMENTS[e.type]) erreurs.push(`élément de type inconnu : ${e.type}`);
    if (!dedans([e.x, e.y])) erreurs.push(`${e.type} ${e.label || ''} hors de la surface (${e.x}, ${e.y})`.replace('  ', ' '));
    if (e.label && !/^[A-Z][0-9]{0,2}$/.test(e.label)) erreurs.push(`étiquette « ${e.label} » : utiliser A1, D2, E… (jamais un prénom)`);
  }
  for (const t of schema.trajets || []) {
    if (!TRAJETS[t.type]) erreurs.push(`trajet de type inconnu : ${t.type}`);
    for (const p of [t.de, t.a, t.via].filter(Boolean)) if (!dedans(p)) erreurs.push(`trajet ${t.type} hors de la surface (${p.join(', ')})`);
  }
  for (const z of schema.zones || []) {
    if (z.x < 0 || z.y < 0 || z.x + z.longueur > L || z.y + z.largeur > l) erreurs.push(`zone « ${z.label || ''} » hors de la surface`);
  }
  return erreurs;
}

// SVG autonome (symboles inclus), déterministe.
export function genererSvg(schema, { titre, description }) {
  const { longueur: L, largeur: l } = schema.surface;
  const k = echelleDe(schema.surface);
  const r = 0.9 * k;
  const typesElements = [...new Set((schema.elements || []).map((e) => e.type))];
  const typesTrajets = [...new Set((schema.trajets || []).map((t) => t.type))];
  const nLegende = typesElements.length + typesTrajets.length;
  // Légende sur 3 colonnes, proportionnée à la largeur du dessin.
  const largeurTotale = L + 4 * k;
  const kl = largeurTotale / 36;
  const colonnes = 3;
  const hauteurLegende = nLegende ? (Math.ceil(nLegende / colonnes) * 2.2 + 1.2) * kl : 0;
  const lignes = [];
  lignes.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(-2 * k)} ${n(-2 * k)} ${n(L + 4 * k)} ${n(l + 4 * k + hauteurLegende)}" role="img" aria-labelledby="titre desc" font-family="sans-serif">`);
  lignes.push(`  <title id="titre">${echapper(titre)}</title>`);
  lignes.push(`  <desc id="desc">${echapper(description || titre)}</desc>`);
  lignes.push('  <defs>', symboles(), '  </defs>');
  lignes.push(`  <rect x="0" y="0" width="${n(L)}" height="${n(l)}" fill="#fff" stroke="#111" stroke-width="${n(0.2 * k)}"/>`);
  for (const ligne of schema.surface.lignes || []) {
    lignes.push(`  <line x1="${n(ligne.x)}" y1="0" x2="${n(ligne.x)}" y2="${n(l)}" stroke="#111" stroke-width="${n(0.12 * k)}" stroke-dasharray="${n(0.8 * k)} ${n(0.5 * k)}"/>`);
    if (ligne.label) lignes.push(`  <text x="${n(ligne.x)}" y="${n(-0.6 * k)}" font-size="${n(1 * k)}" text-anchor="middle" fill="#111">${echapper(ligne.label)}</text>`);
  }
  for (const z of schema.zones || []) {
    lignes.push(`  <rect x="${n(z.x)}" y="${n(z.y)}" width="${n(z.longueur)}" height="${n(z.largeur)}" fill="url(#hachures)" stroke="#111" stroke-width="${n(0.1 * k)}"/>`);
    if (z.label) lignes.push(`  <text x="${n(z.x + 0.3 * k)}" y="${n(z.y + 1 * k)}" font-size="${n(0.9 * k)}" fill="#111" stroke="#fff" stroke-width="${n(0.3 * k)}" paint-order="stroke">${echapper(z.label)}</text>`);
  }
  for (const t of schema.trajets || []) {
    const [x1, y1] = t.de;
    const [x2, y2] = t.a;
    const d = t.via ? `M${n(x1)},${n(y1)} Q${n(t.via[0])},${n(t.via[1])} ${n(x2)},${n(y2)}` : `M${n(x1)},${n(y1)} L${n(x2)},${n(y2)}`;
    const largeur = t.type === 'replacement' ? 0.15 : 0.22;
    lignes.push(`  <path d="${d}" fill="none" stroke="#111" stroke-width="${n(largeur * k)}" ${TRAJETS[t.type].style} marker-end="url(#fleche)"/>`.replace('  marker', ' marker'));
  }
  for (const e of schema.elements || []) {
    const taille = e.type === 'ballon' || e.type === 'plot' ? r * 0.75 : r;
    lignes.push(`  <use href="#${e.type}" x="${n(e.x - taille)}" y="${n(e.y - taille)}" width="${n(2 * taille)}" height="${n(2 * taille)}"/>`);
    if (e.label) lignes.push(`  <text x="${n(e.x + r * 1.15)}" y="${n(e.y - r * 0.9)}" font-size="${n(1.1 * k)}" fill="#111">${echapper(e.label)}</text>`);
  }
  if (nLegende) {
    const y0 = l + 2 * k + 1.2 * kl;
    const items = [
      ...typesElements.map((t) => ({ t, libelle: ELEMENTS[t], symbole: true })),
      ...typesTrajets.map((t) => ({ t, libelle: TRAJETS[t].libelle, symbole: false })),
    ];
    items.forEach((it, i) => {
      const x = -2 * k + 0.5 * kl + (i % colonnes) * 12 * kl;
      const y = y0 + Math.floor(i / colonnes) * 2.2 * kl;
      if (it.symbole) lignes.push(`  <use href="#${it.t}" x="${n(x)}" y="${n(y - 0.75 * kl)}" width="${n(1.5 * kl)}" height="${n(1.5 * kl)}"/>`);
      else lignes.push(`  <path d="M${n(x)},${n(y)} L${n(x + 1.6 * kl)},${n(y)}" stroke="#111" stroke-width="${n(0.2 * kl)}" ${TRAJETS[it.t].style} marker-end="url(#fleche)"/>`);
      lignes.push(`  <text x="${n(x + 2.2 * kl)}" y="${n(y + 0.35 * kl)}" font-size="${n(0.95 * kl)}" fill="#111">${echapper(it.libelle)}</text>`);
    });
  }
  lignes.push('</svg>', '');
  return lignes.join('\n');
}
