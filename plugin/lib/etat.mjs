// État d'une équipe : avancement (déduit des fichiers présents), position
// dans la saison (phase, semaine, prochaine échéance) et suggestions
// proactives. Les règles de suggestion sont des hypothèses pédagogiques,
// décrites dans references/phases-saison.md.
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ecartJours, ecrireDate, lireDate } from './dates.mjs';

// Étapes du parcours, chacune prouvée par la présence d'un fichier.
export const ETAPES = [
  { id: 'equipe', skill: 'coach', preuve: (d) => existsSync(path.join(d, 'equipe.yaml')) },
  { id: 'saison', skill: 'saison', preuve: (d) => existsSync(path.join(d, 'saison.yaml')) },
  { id: 'premiere-seance', skill: 'seance', preuve: (d) => seancesAvec(d, 'seance.yaml').length > 0 },
  { id: 'relue', skill: 'relire', preuve: (d) => seancesAvec(d, 'relecture.md').length > 0 },
  { id: 'exportee', skill: 'exporter', preuve: (d) => seancesAvec(d, path.join('exports', 'fiche-a4.html')).length > 0 },
];

// Dates (AAAA-MM-JJ) des séances qui contiennent `fichier`.
export function seancesAvec(dossierEquipe, fichier) {
  const s = path.join(dossierEquipe, 'seances');
  if (!existsSync(s)) return [];
  return readdirSync(s)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && existsSync(path.join(s, d, fichier)))
    .sort();
}

export function avancement(dossierEquipe) {
  return ETAPES.map((e) => ({ id: e.id, skill: e.skill, fait: e.preuve(dossierEquipe) }));
}

export const PHASES_ACTIVES = new Set([
  'reprise-prepa', 'phase-aller', 'phase-retour', 'phases-finales',
  'plateaux-automne', 'plateaux-printemps', 'tournois-fin-saison', 'rentree', 'periode-scolaire', 'examens',
]);
const DEBUT_DE_SAISON = ['reprise-prepa', 'rentree'];
export const TYPES_ECHEANCE = new Set(['match', 'plateau', 'tournoi', 'competition-scolaire', 'stage', 'evenement', 'examen']);

// Position dans la saison à une date donnée.
export function situer(saison, date) {
  const d = ecrireDate(lireDate(date));
  const phases = [...saison.phases].sort((a, b) => lireDate(a.debut) - lireDate(b.debut));
  const phase = phases.find((p) => ecartJours(p.debut, d) >= 0 && ecartJours(d, p.fin) >= 0) || null;
  const prochainePhase = phases.find((p) => ecartJours(d, p.debut) > 0) || null;
  const reprise = phases.find((p) => DEBUT_DE_SAISON.includes(p.id)) || phases[0];
  const ecart = ecartJours(reprise.debut, d);
  const semaine = ecart >= 0 && ecartJours(d, saison.fin) >= 0 ? Math.floor(ecart / 7) + 1 : null;
  const echeances = (saison.calendrier || [])
    .filter((e) => TYPES_ECHEANCE.has(e.type) && ecartJours(d, e.date) >= 0)
    .sort((a, b) => lireDate(a.date) - lireDate(b.date));
  const prochain = echeances[0] ? { ...echeances[0], j_moins: ecartJours(d, echeances[0].date) } : null;
  return { date: d, phase, prochainePhase, semaine, prochain, echeances: echeances.slice(0, 5) };
}

// Suggestions proactives. Chaque suggestion : { code, message, statut }.
export function suggestions(saison, date, { derniereSeance = null } = {}) {
  const s = situer(saison, date);
  const liste = [];
  const ajouter = (code, message) => liste.push({ code, message, statut: 'hypothese' });
  if (saison.mode === 'scolaire') {
    ajouter('mode-scolaire', 'Les relances propres au mode scolaire (périodes, examens) arrivent dans une prochaine version.');
  }
  const p = s.prochain;
  if (p && p.type === 'match' && ['haute', 'derby'].includes(p.importance) && p.j_moins <= 7) {
    ajouter(
      'affutage',
      p.j_moins <= 2
        ? `Échéance importante dans ${p.j_moins} jour(s) (${p.date}) : séance courte d'activation, rien de nouveau ni de fatigant.`
        : `Échéance importante dans ${p.j_moins} jour(s) (${p.date}) : prévoir une semaine d'affûtage, volume réduit et intensité maintenue.`,
    );
  }
  if (p && ['plateau', 'tournoi'].includes(p.type) && p.j_moins <= 10) {
    ajouter('logistique-plateau', `${p.type === 'plateau' ? 'Plateau' : 'Tournoi'} dans ${p.j_moins} jour(s) (${p.date}) : préparer les groupes, les rotations, le transport et la convocation.`);
  }
  const np = s.prochainePhase;
  if (np && np.id === 'treve' && ecartJours(s.date, np.debut) <= 14 && s.phase?.id !== 'treve') {
    ajouter('preparer-treve', `La trêve commence dans ${ecartJours(s.date, np.debut)} jour(s) (${np.debut}) : prévoir le message aux joueurs et un programme d'entretien.`);
  }
  if (s.phase?.id === 'treve') {
    ajouter('bilan-mi-saison', `Trêve en cours jusqu'au ${s.phase.fin} : moment idéal pour le bilan de mi-saison et la préparation de la reprise.`);
  }
  if (s.phase && PHASES_ACTIVES.has(s.phase.id)) {
    const depuis = derniereSeance ? ecartJours(derniereSeance, s.date) : null;
    if (depuis === null) ajouter('premiere-seance', 'Aucune séance enregistrée pour cette équipe : préparer la prochaine séance ?');
    else if (depuis > 10) ajouter('relance-seance', `Dernière séance enregistrée il y a ${depuis} jours : préparer la prochaine ?`);
  }
  if (s.phase?.id === 'intersaison-bilan' && np) {
    ajouter('preparer-reprise', `Intersaison : la phase « ${np.id} » commence le ${np.debut}. Faire le bilan et préparer la reprise.`);
  }
  return liste;
}
