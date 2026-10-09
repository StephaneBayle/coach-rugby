// État d'une équipe : avancement (déduit des fichiers présents), position
// dans la saison (phase, semaine, prochaine échéance) et suggestions
// proactives. Les règles de suggestion sont des hypothèses pédagogiques,
// décrites dans references/phases-saison.md.
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ajouterJours, ecartJours, ecrireDate, lireDate } from './dates.mjs';
import { absencesRepetees } from './effectif.mjs';
import { bilanCharge, parametresCharge } from './charge.mjs';
import { categorieLaPlusJeune } from './categories.mjs';
import { changementsDeForme, lundiDe, publicDe } from './planification.mjs';
import { lireYaml } from './yaml.mjs';

// Étapes du parcours, chacune prouvée par la présence d'un fichier.
export const ETAPES = [
  { id: 'equipe', skill: 'coach', preuve: (d) => existsSync(path.join(d, 'equipe.yaml')) },
  { id: 'saison', skill: 'saison', preuve: (d) => existsSync(path.join(d, 'saison.yaml')) },
  { id: 'cycles', skill: 'planifier', preuve: (d) => existsSync(path.join(d, 'cycles.yaml')) },
  { id: 'semaine', skill: 'semaine', preuve: (d) => Object.keys(lireSemaines(d)).length > 0 },
  { id: 'effectif', skill: 'effectif', preuve: (d) => existsSync(path.join(d, 'effectif.yaml')) },
  { id: 'premiere-seance', skill: 'seance', preuve: (d) => seancesAvec(d, 'seance.yaml').length > 0 },
  { id: 'relue', skill: 'relire', preuve: (d) => seancesAvec(d, 'relecture.md').length > 0 },
  { id: 'exportee', skill: 'exporter', preuve: (d) => seancesAvec(d, path.join('exports', 'fiche-a4.html')).length > 0 },
  { id: 'match', skill: 'match', preuve: (d) => Object.keys(lireMatchs(d)).length > 0 },
];

// Dates (AAAA-MM-JJ) des séances qui contiennent `fichier`.
export function seancesAvec(dossierEquipe, fichier) {
  const s = path.join(dossierEquipe, 'seances');
  if (!existsSync(s)) return [];
  return readdirSync(s)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && existsSync(path.join(s, d, fichier)))
    .sort();
}

// Semaines planifiées d'une équipe : { <lundi>: contenu de semaine.yaml }.
export function lireSemaines(dossierEquipe) {
  const s = path.join(dossierEquipe, 'semaines');
  if (!existsSync(s)) return {};
  return Object.fromEntries(
    readdirSync(s)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && existsSync(path.join(s, d, 'semaine.yaml')))
      .map((d) => [d, lireYaml(path.join(s, d, 'semaine.yaml'))]),
  );
}

// Matchs préparés d'une équipe : { <date>: contenu de match.yaml }.
export function lireMatchs(dossierEquipe) {
  const m = path.join(dossierEquipe, 'matchs');
  if (!existsSync(m)) return {};
  return Object.fromEntries(
    readdirSync(m)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && existsSync(path.join(m, d, 'match.yaml')))
      .map((d) => [d, lireYaml(path.join(m, d, 'match.yaml'))]),
  );
}

// Suivi des joueurs, pour les relances : effectif, présences, progrès, matchs.
// En codes seulement : la table des prénoms n'est jamais lue ici.
export function lireSuivi(dossierEquipe) {
  const lire = (f) => (existsSync(path.join(dossierEquipe, f)) ? lireYaml(path.join(dossierEquipe, f)) : null);
  return { effectif: lire('effectif.yaml'), presences: lire('presences.yaml'), progres: lire('progres.yaml'), matchs: lireMatchs(dossierEquipe), charge: lire('charge.yaml'), tests: lire('tests.yaml') };
}

// Planification d'une équipe, pour les relances : cycles, semaines, séances faites.
export function lirePlanification(dossierEquipe) {
  const fc = path.join(dossierEquipe, 'cycles.yaml');
  return {
    cycles: existsSync(fc) ? lireYaml(fc) : null,
    semaines: lireSemaines(dossierEquipe),
    seances: new Set(seancesAvec(dossierEquipe, 'seance.yaml')),
  };
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
export function situer(saison, date, { cycles = null } = {}) {
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
  const mesocycle = (cycles?.mesocycles || []).find((m) => ecartJours(m.debut, d) >= 0 && ecartJours(d, m.fin) >= 0) || null;
  return { date: d, phase, prochainePhase, semaine, prochain, echeances: echeances.slice(0, 5), mesocycle };
}

// Suggestions proactives. Chaque suggestion : { code, message, statut }.
export function suggestions(saison, date, { derniereSeance = null, equipe = null, planification = null, suivi = null } = {}) {
  const s = situer(saison, date, { cycles: planification?.cycles });
  const liste = [];
  const ajouter = (code, message) => liste.push({ code, message, statut: 'hypothese' });
  if (saison.mode === 'scolaire') {
    ajouter('mode-scolaire', 'Les relances propres au mode scolaire (périodes, examens) arrivent dans une prochaine version.');
  }
  const p = s.prochain;
  const ecoleDeRugby = equipe && publicDe(equipe) === 'edr';
  if (p && ['match', 'tournoi'].includes(p.type) && ['haute', 'derby'].includes(p.importance) && p.j_moins >= 1 && p.j_moins <= 7 && !ecoleDeRugby) {
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
  if (suivi) {
    const relances = relancesDeSuivi(s, saison, suivi);
    // Préparer le match couvre la logistique du plateau.
    if (relances.some((r) => r.code === 'preparer-match')) liste.splice(0, liste.length, ...liste.filter((x) => x.code !== 'logistique-plateau'));
    relances.forEach((r) => ajouter(r.code, r.message));
    const charge = relancesDeCharge(s, saison, suivi, { equipe, planification });
    charge.forEach((r) => ajouter(r.code, r.message));
    // Le programme de trêve précise « préparer la trêve » : pas de doublon.
    const treve = liste.find((x) => x.code === 'preparer-treve');
    if (treve && charge.some((r) => r.code === 'programme-treve')) treve.message = treve.message.replace(" et un programme d'entretien", '');
  }
  if (planification) {
    const plan = relancesDePlanification(s, saison, { equipe, ...planification });
    plan.forEach((r) => ajouter(r.code, r.message));
    // Une séance précise à préparer rend inutiles les relances génériques.
    if (plan.some((r) => r.code === 'seance-a-preparer')) return liste.filter((x) => !['premiere-seance', 'relance-seance'].includes(x.code));
  }
  return liste;
}

// Relances liées aux cycles et aux semaines (lot 2). Hypothèses pédagogiques.
function relancesDePlanification(s, saison, { equipe, cycles, semaines = {}, seances = new Set() }) {
  const liste = [];
  const r = (code, message) => liste.push({ code, message });
  const active = s.phase && PHASES_ACTIVES.has(s.phase.id);
  if (!cycles) r('planifier-cycles', 'La saison est cadrée mais pas découpée en cycles : préparer les grands blocs de la saison (/coach-rugby:planifier) ?');
  const lundi = lundiDe(s.date);
  const jourSemaine = lireDate(s.date).getUTCDay(); // 0 dimanche … 6 samedi
  const lundiSuivant = ecrireDate(ajouterJours(lundi, 7));
  // Du vendredi au dimanche, on prépare la semaine suivante.
  const finDeSemaine = [5, 6, 0].includes(jourSemaine);
  if (active && finDeSemaine && !semaines[lundiSuivant]) r('preparer-semaine', `Préparer le plan de la semaine prochaine (du ${lundiSuivant}) ?`);
  else if (active && !finDeSemaine && !semaines[lundi]) r('preparer-semaine', `Pas encore de plan pour la semaine du ${lundi} : le préparer (/coach-rugby:semaine) ?`);
  const demain = ecrireDate(ajouterJours(s.date, 1));
  for (const sem of [semaines[lundi], semaines[lundiSuivant]].filter(Boolean)) {
    for (const p of sem.seances_prevues || []) {
      if ([s.date, demain].includes(p.date) && (p.statut || 'prevue') === 'prevue' && !seances.has(p.date)) {
        r('seance-a-preparer', `Séance prévue ${p.date === s.date ? 'aujourd\'hui' : 'demain'} (${p.date}) — ${p.intention} : la préparer (/coach-rugby:seance) ?`);
      }
    }
  }
  const m = s.mesocycle;
  if (m && active && ecartJours(s.date, m.fin) <= 7 && !m.declencheur?.startsWith('echeance:')) {
    const suivant = (cycles?.mesocycles || []).find((x) => ecartJours(m.fin, x.debut) === 1);
    r('fin-mesocycle', `Le cycle « ${m.theme} » se termine le ${m.fin}${suivant ? ` ; le suivant : « ${suivant.theme} »` : ''}. Faire un petit bilan du cycle.`);
  }
  if (equipe) {
    // 35 jours : la transition se prépare souvent avant la trêve.
    const prochain = changementsDeForme(equipe, s.date, ajouterJours(s.date, 35))[0];
    if (prochain) r('changement-forme', `La forme de jeu change le ${prochain.date} : ${prochain.de} → ${prochain.vers} (à vérifier). Préparer la progression (règles, sécurité) dans les séances qui viennent.`);
  }
  const treve = saison.phases.find((p) => p.id === 'treve' && ecartJours(p.fin, s.date) >= 1 && ecartJours(p.fin, s.date) <= 7);
  if (treve) r('reprise-apres-treve', `Reprise après la trêve (finie le ${treve.fin}) : remonter l'intensité progressivement sur deux semaines.`);
  return liste;
}

const TYPES_MATCH = ['match', 'plateau', 'tournoi'];
const LIBELLE_MATCH = { match: 'Match', plateau: 'Plateau', tournoi: 'Tournoi' };

function relancesDeSuivi(s, saison, { effectif, presences, progres, matchs = {} }) {
  const liste = [];
  const r = (code, message) => liste.push({ code, message });
  const p = s.prochain;
  if (p && TYPES_MATCH.includes(p.type) && p.j_moins <= 3 && !matchs[p.date]) {
    r('preparer-match', `${LIBELLE_MATCH[p.type]} ${p.j_moins === 0 ? 'aujourd\'hui' : `dans ${p.j_moins} jour(s)`} (${p.date})${p.adversaire ? ` contre ${p.adversaire}` : ''} : préparer la convocation, ${p.type === 'match' ? 'la composition' : 'la rotation du temps de jeu'} et la fiche match (/coach-rugby:match) ?`);
  }
  for (const e of saison.calendrier || []) {
    const depuis = ecartJours(e.date, s.date);
    if (!TYPES_MATCH.includes(e.type) || depuis < 1 || depuis > 7 || matchs[e.date]?.debriefing) continue;
    const quoi = e.type === 'match' ? 'noter le score, les statistiques et le débriefing' : 'faire le bilan (ce qui a réussi, ce qui reste à travailler)';
    r('debriefer-match', `${LIBELLE_MATCH[e.type]} du ${e.date}${e.adversaire ? ` contre ${e.adversaire}` : ''} : ${quoi}, et en tirer les thèmes des prochaines séances (/coach-rugby:match) ?`);
  }
  if (effectif && presences?.dates?.length) {
    const absents = absencesRepetees(effectif, presences);
    if (absents.length) r('absences-repetees', `Absents aux 3 dernières dates : ${absents.join(', ')}. Prendre des nouvelles, sans demander de motif.`);
  }
  if (progres?.observations?.length && s.phase && PHASES_ACTIVES.has(s.phase.id)) {
    const derniere = progres.observations.map((o) => o.date).sort().at(-1);
    const depuis = ecartJours(derniere, s.date);
    if (depuis > 42) r('point-progres', `Progrès notés pour la dernière fois le ${derniere} (il y a ${Math.floor(depuis / 7)} semaines) : refaire un point sur deux ou trois compétences (/coach-rugby:effectif) ?`);
  }
  return liste;
}

// Relances de charge et de préparation physique (lot 4) : seulement pour les
// équipes concernées (RPE à partir de M14, tests à 16 ans et plus).
function relancesDeCharge(s, saison, { charge, tests, matchs = {} }, { equipe = null, planification = null } = {}) {
  const liste = [];
  const r = (code, message) => liste.push({ code, message });
  const p = parametresCharge();
  const jeune = equipe ? categorieLaPlusJeune(equipe.categories) : null;
  const active = s.phase && PHASES_ACTIVES.has(s.phase.id);
  if (charge?.entrees?.length && active) {
    // Séance ou match des deux derniers jours sans charge notée.
    const notees = new Set(charge.entrees.map((e) => String(e.date)));
    const recents = [ecrireDate(ajouterJours(s.date, -1)), ecrireDate(ajouterJours(s.date, -2))];
    const prevues = Object.values(planification?.semaines || {}).flatMap((sem) => (sem.seances_prevues || []).filter((x) => (x.statut || 'prevue') !== 'annulee').map((x) => String(x.date)));
    const faites = [...(planification?.seances || [])];
    const rencontres = (saison.calendrier || []).filter((e) => TYPES_MATCH.includes(e.type)).map((e) => String(e.date));
    const aNoter = recents.filter((d) => !notees.has(d) && (prevues.includes(d) || faites.includes(d) || rencontres.includes(d) || matchs[d]));
    if (aNoter.length) r('noter-charge', `Charge à noter pour le ${aNoter.sort().join(' et le ')} : durée et intensité ressentie du groupe, de 0 à 10 (/coach-rugby:charge) ?`);
    const b = bilanCharge(charge, s.date);
    const hausse = b.alertes.find((a) => a.code === 'hausse');
    if (hausse) r('hausse-charge', `${hausse.message.replace(/\s*$/, '')} La prochaine séance peut être plus légère : à vous de voir.`);
  }
  const np = s.prochainePhase;
  const programmes = jeune && p.publics.rpe_groupe.categories.includes(jeune);
  if (programmes && np?.id === 'treve' && ecartJours(s.date, np.debut) <= 14 && s.phase?.id !== 'treve') {
    r('programme-treve', `La trêve approche (${np.debut}) : remettre aux joueurs un programme d'entretien à faire chez eux (/coach-rugby:prevention) ?`);
  }
  if (tests?.resultats?.length && jeune && p.publics.individuel.categories.includes(jeune) && s.phase && ['reprise-prepa', 'phase-retour'].includes(s.phase.id)) {
    const dansLaPhase = tests.resultats.some((x) => String(x.date) >= s.phase.debut && String(x.date) <= s.phase.fin);
    const depuisDebut = ecartJours(s.phase.debut, s.date);
    if (!dansLaPhase && depuisDebut >= 0 && depuisDebut <= 21) r('tests-physiques', `${s.phase.id === 'reprise-prepa' ? 'Reprise' : 'Début de la phase retour'} : moment possible pour refaire les tests physiques et suivre la progression de chacun (/coach-rugby:prevention) ?`);
  }
  return liste;
}
