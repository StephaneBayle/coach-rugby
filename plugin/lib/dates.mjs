// Dates « AAAA-MM-JJ » manipulées en UTC pour éviter les décalages d'heure.
// COACH_RUGBY_AUJOURDHUI fixe la date du jour (tests, évals, démonstrations).

const JOUR = 86_400_000;

export function lireDate(texte) {
  if (texte instanceof Date) return new Date(Date.UTC(texte.getUTCFullYear(), texte.getUTCMonth(), texte.getUTCDate()));
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texte));
  if (!m) throw new Error(`Date invalide : ${texte} (attendu AAAA-MM-JJ)`);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

export function ecrireDate(d) {
  return d.toISOString().slice(0, 10);
}

export function aujourdhui(env = process.env) {
  if (env.COACH_RUGBY_AUJOURDHUI) return lireDate(env.COACH_RUGBY_AUJOURDHUI);
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

export const ecartJours = (de, a) => Math.round((lireDate(a) - lireDate(de)) / JOUR);
export const ajouterJours = (d, n) => new Date(lireDate(d).getTime() + n * JOUR);
export const mois = (d) => lireDate(d).getUTCMonth() + 1;
