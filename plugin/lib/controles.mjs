// Contrôles métier, au-delà des schémas : cohérence des phases, des dates et
// des identifiants. Chaque fonction renvoie une liste d'erreurs en français.
import { ecartJours, lireDate } from './dates.mjs';

export const PHASES_PAR_MODE = {
  championnat: ['intersaison-bilan', 'reprise-prepa', 'phase-aller', 'treve', 'phase-retour', 'phases-finales'],
  plateaux: ['intersaison-bilan', 'reprise-prepa', 'plateaux-automne', 'treve', 'plateaux-printemps', 'tournois-fin-saison'],
  scolaire: ['intersaison-bilan', 'rentree', 'periode-scolaire', 'vacances-scolaires', 'examens', 'fin-annee'],
};

export function controlerSaison(saison) {
  const erreurs = [];
  const { debut, fin, mode } = saison;
  if (ecartJours(debut, fin) < 0) erreurs.push(`la saison finit (${fin}) avant de commencer (${debut})`);
  const permises = PHASES_PAR_MODE[mode] || [];
  const phases = [...(saison.phases || [])].sort((a, b) => lireDate(a.debut) - lireDate(b.debut));
  phases.forEach((p, i) => {
    if (!permises.includes(p.id)) erreurs.push(`phase « ${p.id} » non prévue en mode ${mode} (attendu : ${permises.join(', ')})`);
    if (ecartJours(p.debut, p.fin) < 0) erreurs.push(`phase ${p.id} : fin (${p.fin}) avant début (${p.debut})`);
    if (ecartJours(debut, p.debut) < 0 || ecartJours(p.fin, fin) < 0) erreurs.push(`phase ${p.id} hors des dates de la saison`);
    const suivante = phases[i + 1];
    if (suivante) {
      const ecart = ecartJours(p.fin, suivante.debut);
      if (ecart < 1) erreurs.push(`phases ${p.id} et ${suivante.id} se chevauchent`);
      if (ecart > 1) erreurs.push(`trou de ${ecart - 1} jour(s) entre ${p.id} et ${suivante.id}`);
    }
  });
  for (const e of saison.calendrier || []) {
    if (ecartJours(debut, e.date) < 0 || ecartJours(e.date, fin) < 0) erreurs.push(`événement du ${e.date} hors des dates de la saison`);
  }
  return erreurs;
}

export function controlerEquipe(equipe, nomDossier) {
  const erreurs = [];
  if (nomDossier && equipe.id !== nomDossier) erreurs.push(`id « ${equipe.id} » différent du nom du dossier « ${nomDossier} »`);
  return erreurs;
}
