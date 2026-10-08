#!/usr/bin/env node
// CLI de l'outillage coach-rugby (chemin A des skills). Tout ce qu'elle fait
// peut aussi être fait à la main (chemin B) : voir references/outillage.md.
//
// Codes de sortie : 0 succès ; 1 erreurs dans les données ou la commande ;
// 3 outillage indisponible (dépendance absente) → suivre le chemin B.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chargerBibliotheque, DOSSIER_BIBLIOTHEQUE, genererIndex } from '../lib/bibliotheque.mjs';
import { exporterSeance, exporterSemaine } from '../lib/export.mjs';
import { absencesRepetees, lirePrenoms, prochainCode, synchroniserProteges, tauxDePresence } from '../lib/effectif.mjs';
import { lundiDe, proposerCycles, proposerSemaine } from '../lib/planification.mjs';
import { genererSvg } from '../lib/terrain.mjs';
import { ecrireYaml, lireYaml } from '../lib/yaml.mjs';
import { dossierSaison } from '../lib/chemins.mjs';
import { reglesDuJour } from '../lib/categories.mjs';
import { aujourdhui, ecrireDate, lireDate } from '../lib/dates.mjs';
import { chargerEquipe, equipes, initialiser, validerChemin } from '../lib/dossier.mjs';
import { avancement, lirePlanification, seancesAvec, situer, suggestions } from '../lib/etat.mjs';

const AIDE = `coach-rugby — outillage du plugin

Usage : node coach-rugby.mjs <commande> [options]

  init [--structure <type>] [--nom <nom>]
        Crée le dossier saison (sans rien écraser).
        Types : club, pole-formation, section-sportive, sport-etudes,
        centre-formation, selection, autre.
  statut [<equipe>] [--json]
        Phase, semaine, prochaine échéance, avancement et suggestions.
  valider <fichier|dossier>
        Valide les fichiers YAML (schémas et contrôles de cohérence).
  regles <categorie[,categorie…]> [--pratique <p>] [--date AAAA-MM-JJ] [--json]
        Formes de jeu, contact maximal et permissions à une date.
  terrain <fiche.yaml> [--sortie <dossier>]
        Génère le schéma SVG d'une fiche d'exercice (à côté de la fiche
        par défaut, ou dans le dossier indiqué).
  index-bibliotheque
        Régénère bibliotheque/INDEX.md.
  planifier <equipe> [--ecrire] [--json]
        Brouillon des cycles de la saison (mésocycles) ; --ecrire crée
        cycles.yaml s'il n'existe pas encore.
  semaine <equipe> [--date AAAA-MM-JJ] [--ecrire] [--json]
        Brouillon du plan de la semaine qui contient la date ; --ecrire crée
        semaines/<lundi>/semaine.yaml s'il n'existe pas encore.
  effectif <equipe> [--ajouter N] [--prenoms] [--json]
        Effectif en codes (J01…) ; --ajouter crée N codes ; --prenoms affiche
        les prénoms de la table locale (jamais exportés). Synchronise les
        prénoms avec la liste des joueurs protégés.
  presences <equipe> [--date AAAA-MM-JJ --presents J01,J02… [--excuses …] [--type seance]] [--bilan]
        Enregistre les présents d'une date, ou affiche les taux de présence
        et les absences répétées.
  exporter <seance.yaml|semaine.yaml> [--pdf] [--formats a4,telephone]
        Fiches HTML (A4, téléphone) et, avec --pdf, PDF via Chrome. Pour une
        séance : schémas SVG et texte pour Mon Coach Assistant (clubs).

Dossier saison : ${dossierSaison()}
(variable COACH_RUGBY_DOSSIER ; date du jour : COACH_RUGBY_AUJOURDHUI)`;

function options(args) {
  const opts = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const cle = a.slice(2);
      const suivant = args[i + 1];
      if (suivant === undefined || suivant.startsWith('--')) opts[cle] = true;
      else opts[cle] = args[++i];
    } else opts._.push(a);
  }
  return opts;
}

function sortir(code, message) {
  if (message) (code ? process.stderr : process.stdout).write(`${message}\n`);
  process.exit(code);
}

const date = (o) => (o.date ? lireDate(o.date) : aujourdhui());

const commandes = {
  init(o) {
    const dossier = dossierSaison();
    const { crees, alerte } = initialiser(dossier, { structure: o.structure || 'club', nom: typeof o.nom === 'string' ? o.nom : undefined });
    const lignes = [`Dossier saison : ${dossier}`];
    lignes.push(crees.length ? `Créé : ${crees.join(', ')}` : 'Déjà prêt, rien à créer.');
    if (alerte) lignes.push(alerte);
    sortir(0, lignes.join('\n'));
  },

  statut(o) {
    const dossier = dossierSaison();
    const ids = o._.length ? o._ : equipes(dossier);
    if (!ids.length) sortir(0, o.json ? JSON.stringify({ dossier, equipes: [] }) : `Aucune équipe dans ${dossier}. Lancer /coach-rugby:coach pour en créer une.`);
    const jour = date(o);
    const resultats = ids.map((id) => {
      const { dossier: d, equipe, saison } = chargerEquipe(dossier, id);
      const seances = seancesAvec(d, 'seance.yaml');
      const derniereSeance = seances.at(-1) || null;
      const r = { id, nom: equipe.nom, categories: equipe.categories, avancement: avancement(d), derniere_seance: derniereSeance };
      if (saison) {
        const planification = lirePlanification(d);
        r.situation = situer(saison, jour, { cycles: planification.cycles });
        r.suggestions = suggestions(saison, jour, { derniereSeance, equipe, planification });
        r.regles = reglesDuJour({ categories: equipe.categories, pratique: equipe.pratique, date: jour });
      }
      return r;
    });
    if (o.json) sortir(0, JSON.stringify({ dossier, date: ecrireDate(jour), equipes: resultats }, null, 2));
    const lignes = [`Dossier saison : ${dossier} — ${ecrireDate(jour)}`];
    for (const r of resultats) {
      lignes.push('', `■ ${r.nom} (${r.id}, ${r.categories.join(' + ')})`);
      const s = r.situation;
      if (!s) lignes.push('  Saison non cadrée : lancer /coach-rugby:saison.');
      else {
        lignes.push(`  Phase : ${s.phase ? s.phase.id : 'hors saison'}${s.semaine ? ` — semaine ${s.semaine}` : ''}`);
        if (s.mesocycle) lignes.push(`  Cycle : ${s.mesocycle.id} « ${s.mesocycle.theme} » jusqu'au ${s.mesocycle.fin} (intensité prévue : ${INTENSITES[s.mesocycle.intensite]})`);
        if (s.prochain) lignes.push(`  Prochaine échéance : ${s.prochain.type} le ${s.prochain.date} (J-${s.prochain.j_moins})${s.prochain.adversaire ? ` contre ${s.prochain.adversaire}` : ''}${s.prochain.importance && s.prochain.importance !== 'normale' ? ` [${s.prochain.importance}]` : ''}`);
        const g = r.regles;
        lignes.push(`  Règles du moment : ${g.formes.map((f) => f.libelle).join(' ou ')} — contact max : ${g.contact_max} (${g.statut === 'verifie' ? 'vérifié' : `à vérifier, saison ${g.saison}`})`);
      }
      lignes.push(`  Avancement : ${r.avancement.map((e) => `${e.fait ? '✓' : '·'} ${e.id}`).join('  ')}`);
      for (const sg of r.suggestions || []) lignes.push(`  → ${sg.message}`);
    }
    sortir(0, lignes.join('\n'));
  },

  valider(o) {
    const cible = o._[0];
    if (!cible) sortir(1, 'Usage : valider <fichier|dossier>');
    const resultats = validerChemin(path.resolve(cible));
    const enErreur = resultats.filter((r) => r.erreurs.length);
    const lignes = resultats.map((r) => `${r.erreurs.length ? '✗' : '✓'} ${path.relative(process.cwd(), r.fichier) || r.fichier}${r.erreurs.map((e) => `\n    - ${e}`).join('')}`);
    if (!resultats.length) lignes.push('Aucun fichier reconnu à valider.');
    lignes.push(enErreur.length ? `${enErreur.length} fichier(s) en erreur sur ${resultats.length}.` : `${resultats.length} fichier(s) valide(s).`);
    // Le rapport va sur la sortie standard, même en cas d'erreurs : c'est le résultat attendu.
    process.stdout.write(`${lignes.join('\n')}\n`);
    process.exit(enErreur.length ? 1 : 0);
  },

  regles(o) {
    const cats = (o._[0] || '').split(',').filter(Boolean);
    if (!cats.length) sortir(1, 'Usage : regles <categorie[,categorie…]> [--pratique <p>] [--date AAAA-MM-JJ]');
    const r = reglesDuJour({ categories: cats, pratique: o.pratique || 'ecole-de-rugby', date: date(o) });
    if (o.json) sortir(0, JSON.stringify(r, null, 2));
    const oui = (b) => (b ? 'oui' : 'non');
    sortir(0, [
      `${r.libelle} — ${ecrireDate(date(o))}${cats.length > 1 ? ` (catégorie la plus jeune du groupe)` : ''}`,
      `Formes de jeu : ${r.formes.map((f) => `${f.libelle}${f.effectif ? ` (${f.effectif})` : ''}`).join(' ou ')}`,
      `Contact maximal : ${r.contact_max} — plaquage ${oui(r.plaquage)}, mêlée ${oui(r.melee)}, touche ${oui(r.touche)}, ruck ${oui(r.ruck)}`,
      r.note ? `Note : ${r.note}` : null,
      `Source : ${r.source}${r.page ? `, p. ${r.page}` : ''} — statut : ${r.statut}`,
      r.avertissement,
    ].filter(Boolean).join('\n'));
  },
};

commandes.terrain = (o) => {
  const fiche = o._[0];
  if (!fiche) sortir(1, 'Usage : terrain <fiche.yaml> [--sortie <dossier>]');
  const ex = lireYaml(path.resolve(fiche));
  const dossier = typeof o.sortie === 'string' ? path.resolve(o.sortie) : path.dirname(path.resolve(fiche));
  mkdirSync(dossier, { recursive: true });
  const cible = path.join(dossier, `${ex.id}.svg`);
  writeFileSync(cible, genererSvg(ex.schema, { titre: ex.titre, description: `${ex.but} ${ex.organisation}` }));
  sortir(0, `Schéma écrit : ${cible}`);
};

commandes['index-bibliotheque'] = () => {
  const cible = path.join(path.dirname(DOSSIER_BIBLIOTHEQUE), 'INDEX.md');
  const exercices = chargerBibliotheque();
  writeFileSync(cible, genererIndex(exercices));
  sortir(0, `Index écrit : ${cible} (${exercices.length} fiches)`);
};

commandes.exporter = (o) => {
  const fichier = o._[0];
  if (!fichier) sortir(1, 'Usage : exporter <seance.yaml> [--pdf] [--formats a4,telephone]');
  const erreurs = validerChemin(path.resolve(fichier)).flatMap((r) => r.erreurs);
  if (erreurs.length) sortir(1, `Séance invalide, corriger avant d'exporter :\n${erreurs.map((e) => `  - ${e}`).join('\n')}`);
  const formats = typeof o.formats === 'string' ? o.formats.split(',') : ['a4', 'telephone'];
  const exporter = path.basename(fichier) === 'semaine.yaml' ? exporterSemaine : exporterSeance;
  const r = exporter(path.resolve(fichier), { pdf: Boolean(o.pdf), formats });
  const lignes = [`Exports dans ${r.dossier} :`, ...r.fichiers.map((f) => `  - ${f}`)];
  if (r.pdf.demande && !r.pdf.ok) lignes.push(`PDF non produit : ${r.pdf.raison}`);
  sortir(0, lignes.join('\n'));
};

const INTENSITES = { recuperation: 'récupération', legere: 'légère', moyenne: 'moyenne', forte: 'forte', affutage: 'affûtage' };

function chargerPourPlanifier(id) {
  if (!id) sortir(1, 'Indiquer l\'équipe (son identifiant, ex. m10).');
  const dossier = dossierSaison();
  const { dossier: d, equipe, saison } = chargerEquipe(dossier, id);
  if (!saison) sortir(1, `La saison de ${id} n'est pas cadrée : lancer d'abord /coach-rugby:saison.`);
  const fc = path.join(d, 'cycles.yaml');
  return { d, equipe, saison, fc, cycles: existsSync(fc) ? lireYaml(fc) : null };
}

commandes.planifier = (o) => {
  const { d, equipe, saison, fc } = chargerPourPlanifier(o._[0]);
  const brouillon = proposerCycles(saison, equipe);
  if (o.ecrire) {
    if (existsSync(fc)) sortir(1, `${fc} existe déjà : le modifier plutôt que de l'écraser.`);
    ecrireYaml(fc, brouillon, '# Cycles de la saison — brouillon coach-rugby à adapter (hypothèses pédagogiques).');
    const erreurs = validerChemin(fc).flatMap((r) => r.erreurs);
    sortir(erreurs.length ? 1 : 0, erreurs.length ? `Écrit mais invalide :\n${erreurs.join('\n')}` : `Écrit : ${path.relative(process.cwd(), fc) || fc}`);
  }
  if (o.json) sortir(0, JSON.stringify(brouillon, null, 2));
  sortir(0, [
    `Brouillon de cycles — ${equipe.nom} (${d})`,
    ...brouillon.mesocycles.map((m) => `  ${m.id}  ${m.debut} → ${m.fin}  ${m.phase.padEnd(19)} ${INTENSITES[m.intensite].padEnd(12)} ${m.theme}${m.notes ? ` — ${m.notes}` : ''}`),
    'Hypothèses pédagogiques à adapter ; --ecrire pour créer cycles.yaml.',
  ].join('\n'));
};

commandes.semaine = (o) => {
  const { d, equipe, saison, cycles } = chargerPour(o);
  const brouillon = proposerSemaine(date(o), { equipe, saison, cycles });
  const fs = path.join(d, 'semaines', brouillon.debut, 'semaine.yaml');
  if (o.ecrire) {
    if (existsSync(fs)) sortir(1, `${fs} existe déjà : le modifier plutôt que de l'écraser.`);
    mkdirSync(path.dirname(fs), { recursive: true });
    ecrireYaml(fs, brouillon, '# Plan de la semaine — brouillon coach-rugby à adapter (hypothèses pédagogiques).');
    const erreurs = validerChemin(fs).flatMap((r) => r.erreurs);
    sortir(erreurs.length ? 1 : 0, erreurs.length ? `Écrit mais invalide :\n${erreurs.join('\n')}` : `Écrit : ${path.relative(process.cwd(), fs) || fs}`);
  }
  if (o.json) sortir(0, JSON.stringify(brouillon, null, 2));
  sortir(0, [
    `Semaine du ${brouillon.debut} — ${equipe.nom}${brouillon.mesocycle ? ` — cycle ${brouillon.mesocycle} « ${brouillon.theme} »` : ''}`,
    ...brouillon.echeances.map((e) => `  Échéance : ${e.type} le ${e.date}${e.importance && e.importance !== 'normale' ? ` [${e.importance}]` : ''}${e.adversaire ? ` contre ${e.adversaire}` : ''}`),
    ...brouillon.seances_prevues.map((s) => `  ${s.date}${s.heure ? ` ${s.heure}` : ''} (${s.duree_min} min${s.j_moins !== null ? `, J-${s.j_moins}` : ''}) ${INTENSITES[s.intensite]} — ${s.intention}`),
    ...(brouillon.seances_prevues.length ? [] : ['  Pas de séance prévue (repos, trêve ou vacances).']),
    ...brouillon.points_vigilance.map((v) => `  ⚠ ${v}`),
    'Hypothèses pédagogiques à adapter ; --ecrire pour créer semaine.yaml.',
  ].join('\n'));
};

function chargerPour(o) {
  return chargerPourPlanifier(o._[0]);
}

function chargerEffectif(id) {
  if (!id) sortir(1, 'Indiquer l\'équipe (son identifiant, ex. m10).');
  const dossier = dossierSaison();
  const d = path.join(dossier, id);
  if (!existsSync(path.join(d, 'equipe.yaml'))) sortir(1, `Équipe ${id} introuvable dans ${dossier}.`);
  const fe = path.join(d, 'effectif.yaml');
  return { dossier, d, fe, effectif: existsSync(fe) ? lireYaml(fe) : { equipe: id, joueurs: [] } };
}

const listeCodes = (v) => (typeof v === 'string' ? v.split(',').map((c) => c.trim()).filter(Boolean) : []);

commandes.effectif = (o) => {
  const { dossier, d, fe, effectif } = chargerEffectif(o._[0]);
  const n = Number(o.ajouter || 0);
  if (n > 0) {
    for (let i = 0; i < n; i++) effectif.joueurs.push({ code: prochainCode(effectif.joueurs.map((j) => j.code)), disponible: true });
    ecrireYaml(fe, effectif, '# Effectif en codes — aucun nom ici (les prénoms sont dans .prenoms.yaml, sur votre ordinateur).');
    const erreurs = validerChemin(fe).flatMap((r) => r.erreurs);
    if (erreurs.length) sortir(1, erreurs.join('\n'));
  }
  const ajoutes = synchroniserProteges(dossier);
  const prenoms = o.prenoms ? lirePrenoms(d) : {};
  if (o.json) sortir(0, JSON.stringify({ ...effectif, protégés_ajoutés: ajoutes.length }, null, 2));
  const actifs = effectif.joueurs.filter((j) => j.actif !== false);
  sortir(0, [
    `Effectif de ${o._[0]} : ${actifs.length} joueur(s), ${actifs.filter((j) => j.disponible).length} disponible(s).`,
    ...actifs.map((j) => `  ${j.code}${prenoms[j.code] ? ` (${prenoms[j.code]})` : ''}${j.postes?.length ? ` — ${j.postes.join(', ')}` : ''}${j.disponible ? '' : ' — indisponible'}`),
    ajoutes.length ? `${ajoutes.length} prénom(s) ajouté(s) aux joueurs protégés.` : null,
  ].filter(Boolean).join('\n'));
};

commandes.presences = (o) => {
  const { d, effectif } = chargerEffectif(o._[0]);
  const fp = path.join(d, 'presences.yaml');
  const presences = existsSync(fp) ? lireYaml(fp) : { equipe: o._[0], dates: [] };
  if (o.presents) {
    if (typeof o.date !== 'string') sortir(1, 'Indiquer --date AAAA-MM-JJ.');
    const entree = { date: o.date, type: typeof o.type === 'string' ? o.type : 'seance', presents: listeCodes(o.presents), ...(o.excuses ? { excuses: listeCodes(o.excuses) } : {}), ...(o.source ? { source: o.source } : {}) };
    presences.dates = [...presences.dates.filter((x) => x.date !== entree.date), entree].sort((a, b) => (a.date < b.date ? -1 : 1));
    ecrireYaml(fp, presences, '# Présences en codes — aucun nom ici.');
    const erreurs = validerChemin(fp).flatMap((r) => r.erreurs);
    if (erreurs.length) sortir(1, erreurs.join('\n'));
    sortir(0, `Présences du ${entree.date} : ${entree.presents.length} présent(s)${entree.excuses ? `, ${entree.excuses.length} excusé(s)` : ''}.`);
  }
  const taux = tauxDePresence(effectif, presences);
  const repetees = absencesRepetees(effectif, presences);
  if (o.json) sortir(0, JSON.stringify({ taux, absences_repetees: repetees }, null, 2));
  sortir(0, [
    `Présences de ${o._[0]} sur ${presences.dates.length} date(s) :`,
    ...Object.entries(taux).map(([c, v]) => `  ${c} : ${v.presents}/${v.total}${v.taux !== null ? ` (${v.taux} %)` : ''}`),
    repetees.length ? `Absents aux 3 dernières dates : ${repetees.join(', ')}` : null,
  ].filter(Boolean).join('\n'));
};

const [nom, ...reste] = process.argv.slice(2);
if (!nom || nom === 'aide' || nom === '--help' || nom === '-h') sortir(0, AIDE);
if (!commandes[nom]) sortir(1, `Commande inconnue : ${nom}\n\n${AIDE}`);
try {
  commandes[nom](options(reste));
} catch (e) {
  if (e.code === 'DEPENDANCE_ABSENTE') sortir(3, e.message);
  sortir(1, `Erreur : ${e.message}`);
}
