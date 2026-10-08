// Planification : brouillons de cycles (saison → mésocycles) et de semaine
// (microcycle), et contrôles. Les repères viennent de
// references/planification.yaml (hypothèses pédagogiques) ; les formes de
// jeu de categories.yaml. Les brouillons sont des points de départ que le
// coach adapte : rien n'est prescrit.
import path from 'node:path';
import { chargerCategories, reglesDuJour } from './categories.mjs';
import { ajouterJours, ecartJours, ecrireDate, lireDate } from './dates.mjs';
import { RACINE_PLUGIN } from './deps.mjs';
import { PHASES_ACTIVES, TYPES_ECHEANCE } from './etat.mjs';
import { lireYaml } from './yaml.mjs';

let cache;
export function chargerPlanification() {
  cache ??= lireYaml(path.join(RACINE_PLUGIN, 'references', 'planification.yaml'));
  return cache;
}

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const iso = (d) => ecrireDate(lireDate(d));
export const lundiDe = (d) => {
  const x = lireDate(d);
  return ecrireDate(ajouterJours(x, -((x.getUTCDay() + 6) % 7)));
};

// Public de l'équipe : « edr » (école de rugby) ou « adultes ».
export function publicDe(equipe, ref = chargerCategories()) {
  return equipe.categories.some((c) => ref.categories[c]?.ecole_de_rugby) && equipe.pratique === 'ecole-de-rugby' ? 'edr' : 'adultes';
}

function reperePhase(phase, pub, plan) {
  const p = plan.phases[phase] || {};
  return p[pub] || p.adultes || p.edr || { intention: phase, intensite: 'moyenne', theme: phase };
}

// Dates (premier du mois) où la forme de jeu change, entre debut et fin.
export function changementsDeForme(equipe, debut, fin) {
  const dates = [];
  let d = lireDate(debut);
  d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  while (ecartJours(d, fin) >= 0) {
    const avant = reglesDuJour({ categories: equipe.categories, pratique: equipe.pratique, date: ajouterJours(d, -1) });
    const apres = reglesDuJour({ categories: equipe.categories, pratique: equipe.pratique, date: d });
    const cle = (r) => r.formes.map((f) => f.id).join('+');
    if (cle(avant) !== cle(apres)) dates.push({ date: ecrireDate(d), de: avant.formes.map((f) => f.libelle).join(' ou '), vers: apres.formes.map((f) => f.libelle).join(' ou ') });
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  }
  return dates;
}

// Découpe [debut, fin] aux dates de coupure, puis en blocs d'environ
// `vise` jours ; un bout de moins de `min` jours rejoint le précédent.
function decouper(debut, fin, coupures, { vise, min }) {
  const bornes = [iso(debut), ...coupures.filter((c) => ecartJours(debut, c) > 0 && ecartJours(c, fin) >= 0).sort(), ecrireDate(ajouterJours(fin, 1))];
  const segments = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const d = bornes[i];
    const f = ecrireDate(ajouterJours(bornes[i + 1], -1));
    const longueur = ecartJours(d, f) + 1;
    const n = Math.max(1, Math.round(longueur / vise));
    const taille = Math.floor(longueur / n);
    for (let k = 0; k < n; k++) {
      const sd = ajouterJours(d, k * taille);
      const sf = k === n - 1 ? lireDate(f) : ajouterJours(d, (k + 1) * taille - 1);
      segments.push({ debut: ecrireDate(sd), fin: ecrireDate(sf), coupe: k === 0 && i > 0 ? bornes[i] : null });
    }
  }
  // Un bout trop court rejoint le segment précédent (ou le suivant s'il est le premier).
  const fusion = segments.reduce((acc, s) => {
    if (acc.length && ecartJours(s.debut, s.fin) + 1 < min) acc[acc.length - 1].fin = s.fin;
    else acc.push(s);
    return acc;
  }, []);
  if (fusion.length > 1 && ecartJours(fusion[0].debut, fusion[0].fin) + 1 < min) {
    fusion[1].debut = fusion[0].debut;
    fusion.shift();
  }
  return fusion;
}

// Brouillon de cycles.yaml.
export function proposerCycles(saison, equipe) {
  const plan = chargerPlanification();
  const pub = publicDe(equipe);
  const phases = [...saison.phases].sort((a, b) => lireDate(a.debut) - lireDate(b.debut));
  const macrocycle = phases.map((p) => {
    const r = reperePhase(p.id, pub, plan);
    return { phase: p.id, intention: r.intention, priorites: r.priorites || [] };
  });
  const formes = changementsDeForme(equipe, saison.debut, saison.fin);
  const importantes = pub === 'adultes'
    ? (saison.calendrier || []).filter((e) => e.type === 'match' && ['haute', 'derby'].includes(e.importance))
    : [];
  const mesocycles = [];
  const seancesParSemaine = (equipe.creneaux || []).length || 1;
  for (const p of phases) {
    if (plan.phases[p.id]?.sans_mesocycle) continue;
    const r = reperePhase(p.id, pub, plan);
    // Blocs d'affûtage : les N derniers jours avant chaque échéance importante de la phase.
    const blocs = importantes
      .filter((e) => ecartJours(p.debut, e.date) >= 0 && ecartJours(e.date, p.fin) >= 0 && PHASES_ACTIVES.has(p.id))
      .map((e) => {
        const d = ajouterJours(e.date, -(plan.affutage.jours - 1));
        return { debut: ecrireDate(ecartJours(p.debut, d) >= 0 ? d : lireDate(p.debut)), fin: e.date, echeance: e };
      });
    // Les zones hors blocs d'affûtage sont découpées aux changements de forme.
    let curseur = iso(p.debut);
    const zones = [];
    for (const b of blocs) {
      if (ecartJours(curseur, b.debut) > 0) zones.push({ debut: curseur, fin: ecrireDate(ajouterJours(b.debut, -1)) });
      zones.push({ ...b, bloc: true });
      curseur = ecrireDate(ajouterJours(b.fin, 1));
    }
    if (ecartJours(curseur, p.fin) >= 0) zones.push({ debut: curseur, fin: iso(p.fin) });
    for (const z of zones) {
      if (z.bloc) {
        mesocycles.push({
          debut: z.debut, fin: z.fin, phase: p.id, theme: plan.bloc_affutage.theme,
          objectifs: [{ texte: plan.bloc_affutage.objectif, domaine: 'physique' }],
          intensite: plan.bloc_affutage.intensite, seances_par_semaine: seancesParSemaine, declencheur: `echeance:${z.echeance.date}`,
          notes: `${z.echeance.importance === 'derby' ? 'Derby' : 'Match important'}${z.echeance.adversaire ? ` contre ${z.echeance.adversaire}` : ''} le ${z.echeance.date}.`,
        });
        continue;
      }
      const coupures = formes.map((f) => f.date);
      for (const s of decouper(z.debut, z.fin, coupures, { vise: plan.mesocycle.duree_visee_jours, min: plan.mesocycle.duree_min_jours })) {
        // Changement de forme : la forme au début de ce bloc diffère de celle
        // du dernier bloc actif (le changement a pu tomber pendant la trêve).
        const precedent = [...mesocycles].reverse().find((m) => PHASES_ACTIVES.has(m.phase));
        const formeAu = (d) => reglesDuJour({ categories: equipe.categories, pratique: equipe.pratique, date: d }).formes;
        // Forme dominante d'un bloc : celle de son milieu.
        const milieu = (debut, fin) => ajouterJours(debut, Math.floor((ecartJours(debut, fin)) / 2));
        const avant = precedent ? formeAu(milieu(precedent.debut, precedent.fin)) : null;
        const apres = formeAu(milieu(s.debut, s.fin));
        const cle = (f) => f.map((x) => x.id).join('+');
        const forme = PHASES_ACTIVES.has(p.id) && avant && cle(avant) !== cle(apres)
          ? { de: avant.map((x) => x.libelle).join(' ou '), vers: apres.map((x) => x.libelle).join(' ou ') }
          : null;
        mesocycles.push(forme
          ? {
              debut: s.debut, fin: s.fin, phase: p.id, theme: plan.changement_forme.theme,
              objectifs: [{ texte: plan.changement_forme.objectif, domaine: 'technique' }],
              intensite: plan.changement_forme.intensite, seances_par_semaine: seancesParSemaine, declencheur: 'changement-forme',
              notes: `Forme de jeu : ${forme.de} → ${forme.vers} (à vérifier, saison ${chargerCategories().saison}).`,
            }
          : {
              debut: s.debut, fin: s.fin, phase: p.id, theme: r.theme,
              objectifs: (r.priorites || []).slice(0, 2).map((t) => ({ texte: t, domaine: 'technique' })),
              intensite: r.intensite, seances_par_semaine: p.id === 'treve' || p.id === 'vacances-scolaires' ? 0 : seancesParSemaine,
            });
      }
    }
  }
  mesocycles.forEach((m, i) => { m.id = `c${String(i + 1).padStart(2, '0')}`; });
  return {
    saison: saison.saison,
    macrocycle,
    mesocycles: mesocycles.map(({ id, ...reste }) => ({ id, ...reste })),
    hypotheses: ['Découpage proposé automatiquement d\'après references/planification.yaml (hypothèses pédagogiques), à adapter par le coach.'],
    sources: pub === 'edr' ? ['ffr-cahier-edr-2026-2027', 'ffr-formation-edr'] : ['bompa-haff-2009'],
  };
}

const mesocycleAu = (cycles, date) => (cycles?.mesocycles || []).find((m) => ecartJours(m.debut, date) >= 0 && ecartJours(date, m.fin) >= 0) || null;

// Brouillon de semaines/<lundi>/semaine.yaml.
export function proposerSemaine(date, { equipe, saison, cycles = null }) {
  const plan = chargerPlanification();
  const pub = publicDe(equipe);
  const lundi = lundiDe(date);
  const dimanche = ecrireDate(ajouterJours(lundi, 6));
  const meso = mesocycleAu(cycles, lundi) || mesocycleAu(cycles, dimanche);
  const phase = saison.phases.find((p) => ecartJours(p.debut, lundi) >= 0 && ecartJours(lundi, p.fin) >= 0) || null;
  const evenements = (saison.calendrier || []).filter((e) => TYPES_ECHEANCE.has(e.type)).sort((a, b) => lireDate(a.date) - lireDate(b.date));
  const echeances = evenements
    .filter((e) => ecartJours(lundi, e.date) >= 0 && ecartJours(e.date, ajouterJours(lundi, 13)) >= 0)
    .map(({ type, date: d, importance, adversaire, lieu }) => ({ type, date: d, ...(importance ? { importance } : {}), ...(adversaire ? { adversaire } : {}), ...(lieu ? { lieu } : {}) }));
  const repos = phase && !PHASES_ACTIVES.has(phase.id);
  const seances = repos ? [] : (equipe.creneaux || []).map((c) => {
    const d = ecrireDate(ajouterJours(lundi, (JOURS.indexOf(c.jour) + 6) % 7));
    const prochaine = evenements.find((e) => ecartJours(d, e.date) > 0);
    const precedente = [...evenements].reverse().find((e) => e.type === 'match' && ecartJours(e.date, d) > 0);
    const jMoins = prochaine ? ecartJours(d, prochaine.date) : null;
    const jPlus = precedente ? ecartJours(precedente.date, d) : null;
    const regle = plan.grille_semaine[pub].find((r) =>
      (r.si === 'apres_match_jours_max_2' && jPlus !== null && jPlus <= 2) ||
      (r.si === 'avant_echeance_jours_max_2' && jMoins !== null && jMoins <= 2) ||
      (r.si === 'avant_echeance_jours_max_4' && jMoins !== null && jMoins <= 4) ||
      r.si === 'defaut');
    let intensite = regle.intensite;
    if (meso?.intensite === 'recuperation') intensite = 'recuperation';
    const derniereAvant = prochaine && (equipe.creneaux || []).every((autre) => {
      const da = ecrireDate(ajouterJours(lundi, (JOURS.indexOf(autre.jour) + 6) % 7));
      return ecartJours(d, da) <= 0 || ecartJours(da, prochaine.date) <= 0;
    });
    let intention = regle.intention;
    if (meso?.intensite === 'affutage' && derniereAvant && pub === 'adultes' && ['haute', 'derby'].includes(prochaine.importance)) {
      const activation = plan.grille_semaine.adultes.find((r) => r.si === 'avant_echeance_jours_max_2');
      intensite = activation.intensite;
      intention = activation.intention;
    }
    return {
      date: d, ...(c.heure ? { heure: c.heure } : {}), duree_min: c.duree_min, j_moins: jMoins,
      intention, intensite, dominante: meso?.theme || phase?.id || '—', statut: 'prevue',
    };
  }).sort((a, b) => lireDate(a.date) - lireDate(b.date));
  const vigilance = [];
  for (const e of echeances.filter((x) => ['haute', 'derby'].includes(x.importance))) {
    vigilance.push(`${e.importance === 'derby' ? 'Derby' : 'Échéance importante'} le ${e.date}${e.adversaire ? ` contre ${e.adversaire}` : ''} : pas de fatigue inutile en fin de semaine.`);
  }
  for (const f of changementsDeForme(equipe, lundi, ajouterJours(lundi, 20))) {
    vigilance.push(`La forme de jeu change le ${f.date} (${f.de} → ${f.vers}) : préparer la progression.`);
  }
  return {
    equipe: equipe.id,
    debut: lundi,
    ...(meso ? { mesocycle: meso.id } : {}),
    ...(phase ? { phase: phase.id } : {}),
    theme: meso?.theme || reperePhase(phase?.id, pub, plan).theme,
    ...(meso ? { intensite_globale: meso.intensite } : {}),
    echeances,
    seances_prevues: seances,
    points_vigilance: vigilance,
    hypotheses: ['Intensités proposées d\'après la grille J-n de references/planification.yaml (hypothèse pédagogique).'],
    sources: pub === 'edr' ? ['ffr-cahier-edr-2026-2027'] : ['bompa-haff-2009'],
  };
}

// ----------------------------------------------------------------- contrôles
export function controlerCycles(cycles, { saison = null } = {}) {
  const erreurs = [];
  const plan = chargerPlanification();
  const ms = [...cycles.mesocycles].sort((a, b) => lireDate(a.debut) - lireDate(b.debut));
  const ids = new Set();
  ms.forEach((m, i) => {
    if (ids.has(m.id)) erreurs.push(`mésocycle ${m.id} en double`);
    ids.add(m.id);
    const duree = ecartJours(m.debut, m.fin) + 1;
    if (duree < 1) erreurs.push(`mésocycle ${m.id} : fin avant début`);
    if (duree > plan.mesocycle.duree_max_jours) erreurs.push(`mésocycle ${m.id} : ${duree} jours, au-delà de ${plan.mesocycle.duree_max_jours}`);
    const suivant = ms[i + 1];
    if (suivant && ecartJours(m.fin, suivant.debut) < 1) erreurs.push(`mésocycles ${m.id} et ${suivant.id} se chevauchent`);
    if (saison) {
      if (ecartJours(saison.debut, m.debut) < 0 || ecartJours(m.fin, saison.fin) < 0) erreurs.push(`mésocycle ${m.id} hors des dates de la saison`);
      const p = saison.phases.find((x) => x.id === m.phase && ecartJours(x.debut, m.debut) >= 0 && ecartJours(m.fin, x.fin) >= 0);
      if (!p) erreurs.push(`mésocycle ${m.id} : ses dates ne sont pas comprises dans une phase « ${m.phase} » de la saison`);
    }
  });
  if (saison && cycles.saison !== saison.saison) erreurs.push(`saison ${cycles.saison} différente de celle de saison.yaml (${saison.saison})`);
  return erreurs;
}

export function controlerSemaine(semaine, { equipe = null, saison = null, cycles = null, nomDossier = null } = {}) {
  const erreurs = [];
  if (lundiDe(semaine.debut) !== iso(semaine.debut)) erreurs.push(`début ${semaine.debut} : ce n'est pas un lundi`);
  if (nomDossier && nomDossier !== semaine.debut) erreurs.push(`début « ${semaine.debut} » différent du nom du dossier « ${nomDossier} »`);
  const fin = ajouterJours(semaine.debut, 6);
  for (const s of semaine.seances_prevues) {
    if (ecartJours(semaine.debut, s.date) < 0 || ecartJours(s.date, fin) < 0) erreurs.push(`séance du ${s.date} hors de la semaine`);
  }
  if (cycles && semaine.mesocycle && !cycles.mesocycles.some((m) => m.id === semaine.mesocycle)) erreurs.push(`mésocycle ${semaine.mesocycle} absent de cycles.yaml`);
  if (equipe && semaine.equipe !== equipe.id) erreurs.push(`équipe « ${semaine.equipe} » différente de celle du dossier « ${equipe.id} »`);
  // Sécurité : pas de séance forte juste avant une échéance importante.
  const echeances = [...(semaine.echeances || []), ...((saison?.calendrier || []).filter((e) => TYPES_ECHEANCE.has(e.type)))];
  for (const s of semaine.seances_prevues) {
    const proche = echeances.find((e) => ['haute', 'derby'].includes(e.importance) && ecartJours(s.date, e.date) > 0 && ecartJours(s.date, e.date) <= 2);
    if (proche && !['legere', 'affutage', 'recuperation'].includes(s.intensite)) {
      erreurs.push(`séance du ${s.date} en intensité « ${s.intensite} » à J-${ecartJours(s.date, proche.date)} d'une échéance ${proche.importance} : prévoir « affutage » ou « legere »`);
    }
  }
  if (equipe && publicDe(equipe) === 'edr' && semaine.seances_prevues.some((s) => s.intensite === 'affutage')) {
    erreurs.push('école de rugby : pas d\'« affûtage », utiliser « legere » (séance plaisir avant le plateau)');
  }
  return erreurs;
}
