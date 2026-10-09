// Tests physiques (16 ans et plus) : contrôles et progression de chaque
// joueur, d'un test à l'autre. Jamais de norme ni de classement entre
// joueurs.
import path from 'node:path';
import { categorieLaPlusJeune, chargerCategories } from './categories.mjs';
import { parametresCharge } from './charge.mjs';
import { RACINE_PLUGIN } from './deps.mjs';
import { lireYaml } from './yaml.mjs';

let ref;
export const referenceTests = () => (ref ??= lireYaml(path.join(RACINE_PLUGIN, 'references', 'tests-physiques.yaml')));

export function controlerTests(tests, { equipe = null, effectif = null } = {}) {
  const erreurs = [];
  const connus = new Map(referenceTests().tests.map((t) => [t.id, t]));
  const categories = chargerCategories();
  const individuel = parametresCharge().publics.individuel.categories;
  const joueurs = new Map((effectif?.joueurs || []).map((j) => [j.code, j]));
  const doublons = new Set();
  for (const r of tests.resultats) {
    if (!connus.has(r.test)) erreurs.push(`${r.date} : test inconnu « ${r.test} » (references/tests-physiques.yaml)`);
    if (effectif && !joueurs.has(r.code)) erreurs.push(`${r.date} : code ${r.code} absent de effectif.yaml`);
    if (equipe) {
      const cat = joueurs.get(r.code)?.categorie || categorieLaPlusJeune(equipe.categories, categories);
      if (!individuel.includes(cat)) erreurs.push(`${r.date} : tests physiques réservés aux 16 ans et plus (${r.code}, ${categories.categories[cat].libelle})`);
    }
    const cle = `${r.date}|${r.test}|${r.code}`;
    if (doublons.has(cle)) erreurs.push(`${r.date} : ${r.code} a deux résultats au test ${r.test}`);
    doublons.add(cle);
  }
  return erreurs;
}

// { <test>: { <code>: { premier, dernier, evolution, mieux } } } — par
// joueur, sans comparaison entre joueurs.
export function progression(tests) {
  const connus = new Map(referenceTests().tests.map((t) => [t.id, t]));
  const parTest = {};
  for (const r of [...tests.resultats].sort((a, b) => (String(a.date) < String(b.date) ? -1 : 1))) {
    const p = ((parTest[r.test] ??= {})[r.code] ??= { premier: null, dernier: null });
    p.premier ??= { date: String(r.date), valeur: r.valeur };
    p.dernier = { date: String(r.date), valeur: r.valeur };
  }
  for (const [test, codes] of Object.entries(parTest)) {
    const t = connus.get(test);
    for (const p of Object.values(codes)) {
      const d = Math.round((p.dernier.valeur - p.premier.valeur) * 10 ** (t?.decimales ?? 2)) / 10 ** (t?.decimales ?? 2);
      p.evolution = p.premier.date === p.dernier.date ? null : d;
      const stable = p.evolution === null || Math.abs(d) < (t?.ecart_notable ?? 0) || d === 0;
      p.mieux = stable ? null : t?.meilleur === 'plus-petit' ? d < 0 : d > 0;
    }
  }
  return parTest;
}
