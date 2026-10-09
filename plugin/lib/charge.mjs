// Charge d'entraînement réalisée : RPE × durée (méthode de Foster), par
// semaine, tendance sur les semaines précédentes, monotonie, et comparaison
// au prévu. Tous les seuils viennent de references/parametres-charge.yaml
// (hypothèses ou paramètres à vérifier) : rien n'est un seuil médical, une
// alerte est un repère pour piloter l'entraînement.
//
// RGPD : RPE du groupe pour tous à partir de M14 ; RPE par code seulement
// pour les catégories « individuel » (16 ans et plus). Aucune donnée de
// santé ni de forme.
import path from 'node:path';
import { categorieLaPlusJeune, chargerCategories } from './categories.mjs';
import { ajouterJours, ecartJours, ecrireDate } from './dates.mjs';
import { RACINE_PLUGIN } from './deps.mjs';
import { lundiDe } from './planification.mjs';
import { lireYaml } from './yaml.mjs';

let params;
export const parametresCharge = () => (params ??= lireYaml(path.join(RACINE_PLUGIN, 'references', 'parametres-charge.yaml')));

export const chargeEntree = (e) => e.rpe_groupe * e.duree_min;

// { <lundi>: { total, entrees, jours: { <date>: charge } } }
export function parSemaine(charge) {
  const semaines = {};
  for (const e of charge?.entrees || []) {
    const l = lundiDe(e.date);
    const s = (semaines[l] ??= { total: 0, entrees: 0, jours: {} });
    const c = chargeEntree(e);
    s.total += c;
    s.entrees += 1;
    const d = String(e.date);
    s.jours[d] = (s.jours[d] || 0) + c;
  }
  return semaines;
}

// Monotonie de Foster : moyenne journalière / écart-type sur les 7 jours
// (jours sans séance comptés à 0). null si tous les jours sont égaux.
export function monotonie(semaine, lundi) {
  if (!semaine) return null;
  const valeurs = Array.from({ length: 7 }, (_, i) => semaine.jours[ecrireDate(ajouterJours(lundi, i))] || 0);
  const moyenne = valeurs.reduce((a, b) => a + b, 0) / 7;
  const ecartType = Math.sqrt(valeurs.reduce((a, v) => a + (v - moyenne) ** 2, 0) / 7);
  return ecartType ? Math.round((moyenne / ecartType) * 100) / 100 : null;
}

// Tendance de la semaine du `lundi` face aux N semaines précédentes qui ont
// des entrées (une semaine vide, la trêve par exemple, n'est pas un zéro).
export function tendance(semaines, lundi, p = parametresCharge()) {
  const n = p.tendance.semaines_reference.valeur;
  const precedentes = Object.keys(semaines).filter((l) => l < lundi).sort().slice(-n);
  const total = semaines[lundi]?.total || 0;
  if (precedentes.length < p.tendance.semaines_minimum.valeur) return { total, reference: null, ecart_pct: null, alerte: false, semaines_reference: precedentes.length };
  const reference = Math.round(precedentes.reduce((a, l) => a + semaines[l].total, 0) / precedentes.length);
  const ecart = reference ? Math.round((100 * (total - reference)) / reference) : null;
  return { total, reference, ecart_pct: ecart, alerte: ecart !== null && ecart > p.tendance.alerte_hausse_pct.valeur, semaines_reference: precedentes.length };
}

// Bilan de la semaine qui contient `date`.
export function bilanCharge(charge, date, p = parametresCharge()) {
  const semaines = parSemaine(charge);
  const lundi = lundiDe(date);
  const t = tendance(semaines, lundi, p);
  const m = monotonie(semaines[lundi], lundi);
  const alertes = [];
  if (t.alerte) alertes.push({ code: 'hausse', message: `Charge de la semaine ${t.ecart_pct} % au-dessus de la moyenne des ${t.semaines_reference} semaines précédentes : repère pour envisager d'alléger (hypothèse, pas un risque de blessure).` });
  if (m !== null && m > p.monotonie.seuil.valeur) alertes.push({ code: 'monotonie', message: `Semaine peu variée (monotonie ${m}, repère ${p.monotonie.seuil.valeur}, à vérifier) : alterner séances dures et légères.` });
  return { lundi, ...t, monotonie: m, entrees: semaines[lundi]?.entrees || 0, alertes, semaines };
}

// Intensité prévue (semaine.yaml) face au RPE réalisé, séance par séance.
export function prevuVsRealise(semaine, charge, p = parametresCharge()) {
  const fourchettes = p.prevu_rpe.valeur;
  return (semaine?.seances_prevues || []).filter((s) => s.statut !== 'annulee').map((s) => {
    const e = (charge?.entrees || []).find((x) => String(x.date) === String(s.date) && x.type !== 'match');
    const [bas, haut] = fourchettes[s.intensite] || [0, 10];
    const ecart = !e ? 'non-notee' : e.rpe_groupe > haut ? 'plus-dure' : e.rpe_groupe < bas ? 'plus-legere' : 'conforme';
    return { date: String(s.date), intensite: s.intensite, rpe: e?.rpe_groupe ?? null, duree_min: e?.duree_min ?? null, ecart };
  });
}

// Catégories autorisées pour un joueur (sa catégorie, sinon la plus jeune
// de l'équipe).
const categorieDe = (code, effectif, equipe, ref) => effectif?.joueurs?.find((j) => j.code === code)?.categorie || categorieLaPlusJeune(equipe.categories, ref);

export function controlerCharge(charge, { equipe = null, effectif = null } = {}, p = parametresCharge()) {
  const erreurs = [];
  const ref = chargerCategories();
  if (!equipe) return erreurs;
  const jeune = categorieLaPlusJeune(equipe.categories, ref);
  if (!p.publics.rpe_groupe.categories.includes(jeune)) {
    erreurs.push(`pas de charge chiffrée (RPE) pour ${ref.categories[jeune].libelle} : à l'école de rugby, on garde l'intensité prévue (hypothèse)`);
    return erreurs;
  }
  const connus = new Set((effectif?.joueurs || []).map((j) => j.code));
  for (const e of charge.entrees) {
    for (const code of Object.keys(e.par_code || {})) {
      if (effectif && !connus.has(code)) erreurs.push(`${e.date} : code ${code} absent de effectif.yaml`);
      const cat = categorieDe(code, effectif, equipe, ref);
      if (!p.publics.individuel.categories.includes(cat)) erreurs.push(`${e.date} : RPE par joueur refusé pour ${code} (${ref.categories[cat].libelle}) : réservé aux 16 ans et plus ; garder le RPE du groupe`);
    }
  }
  const vus = new Set();
  for (const e of charge.entrees) {
    const cle = `${e.date}|${e.type}`;
    if (vus.has(cle)) erreurs.push(`${e.date} : deux entrées « ${e.type} » le même jour (les regrouper, ou utiliser « autre »)`);
    vus.add(cle);
  }
  return erreurs;
}

// Jours écoulés depuis la dernière entrée (pour les relances).
export const joursDepuisDerniere = (charge, date) => {
  const d = (charge?.entrees || []).map((e) => String(e.date)).sort().at(-1);
  return d ? ecartJours(d, date) : null;
};
