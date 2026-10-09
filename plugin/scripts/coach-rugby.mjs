#!/usr/bin/env node
// CLI de l'outillage coach-rugby (chemin A des skills). Tout ce qu'elle fait
// peut aussi être fait à la main (chemin B) : voir references/outillage.md.
//
// Codes de sortie : 0 succès ; 1 erreurs dans les données ou la commande ;
// 3 outillage indisponible (dépendance absente) → suivre le chemin B.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chargerBibliotheque, DOSSIER_BIBLIOTHEQUE, genererIndex } from '../lib/bibliotheque.mjs';
import { exporterFeuillePresence, exporterMatch, exporterProgramme, exporterSeance, exporterSemaine } from '../lib/export.mjs';
import { chargerProgrammes } from '../lib/programmes.mjs';
import { ecrireCsv, ecrireXlsx, tableauPresences, tableauProgres, tableauTempsDeJeu } from '../lib/tableur.mjs';
import { absencesRepetees, lirePrenoms, prochainCode, synchroniserProteges, tauxDePresence } from '../lib/effectif.mjs';
import { dureeTotale } from '../lib/match.mjs';
import { bilanCharge } from '../lib/charge.mjs';
import { progression, referenceTests } from '../lib/tests-physiques.mjs';
import { lundiDe, proposerCycles, proposerSemaine } from '../lib/planification.mjs';
import { attenteMax, bilanEquite, planifierRotation } from '../lib/temps-de-jeu.mjs';
import { chargerCategories } from '../lib/categories.mjs';
import { genererSvg } from '../lib/terrain.mjs';
import { ecrireYaml, lireYaml } from '../lib/yaml.mjs';
import { RACINE_PLUGIN } from '../lib/deps.mjs';
import { dossierSaison } from '../lib/chemins.mjs';
import { reglesDuJour } from '../lib/categories.mjs';
import { aujourdhui, ecrireDate, lireDate } from '../lib/dates.mjs';
import { chargerEquipe, equipes, initialiser, validerChemin } from '../lib/dossier.mjs';
import { avancement, lirePlanification, lireSuivi, seancesAvec, situer, suggestions } from '../lib/etat.mjs';

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
  charge <equipe> --date AAAA-MM-JJ --duree N --rpe N [--type seance|match|salle…] [--par-code J01=7,J02=6]
  charge <equipe> --bilan [--date AAAA-MM-JJ] [--json]
        Charge réalisée (intensité ressentie de 0 à 10 × durée) ; RPE par
        joueur seulement pour les 16 ans et plus. --bilan : semaine,
        tendance, monotonie et repères (hypothèses, jamais médicaux).
  tests <equipe> --date AAAA-MM-JJ --test <id> --resultats J01=3.12,J02=3.30
  tests <equipe> --bilan [--json]
        Tests physiques (16 ans et plus) : saisie en codes, puis progression
        de chaque joueur d'un test à l'autre (jamais de classement).
  rotation <match.yaml> [--periode N] [--ecrire]
        Rotation équitable du temps de jeu (périodes de N minutes, 5 par
        défaut) entre les convoqués ; --ecrire l'enregistre dans match.yaml.
  exporter <seance.yaml|semaine.yaml|match.yaml|effectif.yaml> [--pdf] [--formats a4,telephone]
        Fiches HTML (A4, téléphone) et, avec --pdf, PDF via Chrome. Pour une
        séance : schémas SVG et texte pour Mon Coach Assistant (clubs). Pour
        effectif.yaml : feuille de présence à imprimer (codes, prénom vide).
  exporter programme <id> [--pdf]
        Fiche d'un programme hors terrain (trêve, intersaison, salle), sans
        donnée personnelle, à remettre aux joueurs.
  tableau presences|temps-de-jeu|progres <equipe> [--match AAAA-MM-JJ] [--format xlsx|csv]
        Tableau en codes (jamais de prénom) dans <equipe>/exports/. Le CSV
        est toujours produit ; l'Excel (xlsx, par défaut) en plus si possible.

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
        r.suggestions = suggestions(saison, jour, { derniereSeance, equipe, planification, suivi: lireSuivi(d) });
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
  if (o._[0] === 'programme') {
    const id = o._[1];
    const ids = chargerProgrammes().programmes.map((p) => p.id);
    if (!ids.includes(id)) sortir(1, `Usage : exporter programme <id>. Programmes : ${ids.join(', ')}`);
    const formats = typeof o.formats === 'string' ? o.formats.split(',') : ['a4', 'telephone'];
    const r = exporterProgramme(id, path.join(dossierSaison(), '_programmes', 'exports'), { pdf: Boolean(o.pdf), formats });
    const lignes = [`Fiches du programme dans ${r.dossier} (sans donnée personnelle, à remettre aux joueurs) :`, ...r.fichiers.map((f) => `  - ${f}`)];
    if (r.pdf.demande && !r.pdf.ok) lignes.push(`PDF non produit : ${r.pdf.raison}`);
    sortir(0, lignes.join('\n'));
  }
  const fichier = o._[0];
  if (!fichier) sortir(1, 'Usage : exporter <seance.yaml|semaine.yaml|match.yaml|effectif.yaml> [--pdf] [--formats a4,telephone]');
  const erreurs = validerChemin(path.resolve(fichier)).flatMap((r) => r.erreurs);
  const base = path.basename(fichier);
  const quoi = { 'semaine.yaml': 'Semaine', 'match.yaml': 'Match', 'effectif.yaml': 'Effectif' }[base] || 'Séance';
  if (erreurs.length) sortir(1, `${quoi} invalide, corriger avant d'exporter :\n${erreurs.map((e) => `  - ${e}`).join('\n')}`);
  const formats = typeof o.formats === 'string' ? o.formats.split(',') : ['a4', 'telephone'];
  const r = base === 'effectif.yaml'
    ? exporterFeuillePresence(path.dirname(path.resolve(fichier)), { pdf: Boolean(o.pdf) })
    : ({ 'semaine.yaml': exporterSemaine, 'match.yaml': exporterMatch }[base] || exporterSeance)(path.resolve(fichier), { pdf: Boolean(o.pdf), formats });
  const lignes = [`Exports dans ${r.dossier} :`, ...r.fichiers.map((f) => `  - ${f}`)];
  if (r.pdf.demande && !r.pdf.ok) lignes.push(`PDF non produit : ${r.pdf.raison}`);
  sortir(0, lignes.join('\n'));
};

commandes.tableau = async (o) => {
  const [quoi, id] = o._;
  const usage = 'Usage : tableau presences|temps-de-jeu|progres <equipe> [--match AAAA-MM-JJ] [--format xlsx|csv]';
  if (!['presences', 'temps-de-jeu', 'progres'].includes(quoi)) sortir(1, usage);
  const { d, effectif } = chargerEffectif(id);
  const lire = (f) => {
    if (!existsSync(path.join(d, f))) sortir(1, `${f} introuvable dans ${d}.`);
    return lireYaml(path.join(d, f));
  };
  let feuilles;
  let nom = quoi;
  if (quoi === 'presences') feuilles = [tableauPresences(effectif, lire('presences.yaml'))];
  else if (quoi === 'progres') feuilles = [tableauProgres(effectif, lire('progres.yaml'), lireYaml(path.join(RACINE_PLUGIN, 'references', 'competences.yaml')))];
  else {
    const dates = existsSync(path.join(d, 'matchs')) ? readdirSync(path.join(d, 'matchs')).filter((x) => existsSync(path.join(d, 'matchs', x, 'match.yaml'))).sort() : [];
    const date = typeof o.match === 'string' ? o.match : dates.at(-1);
    if (!date) sortir(1, 'Aucun match dans matchs/.');
    feuilles = tableauTempsDeJeu(lire(path.join('matchs', date, 'match.yaml')));
    if (!feuilles[0].lignes.length) sortir(1, `Match du ${date} : aucune rotation (temps_de_jeu) enregistrée.`);
    nom = `temps-de-jeu-${date}`;
  }
  const dossier = path.join(d, 'exports');
  mkdirSync(dossier, { recursive: true });
  const fichiers = [];
  feuilles.forEach((f, i) => {
    const n = `${nom}${i ? `-${f.nom.toLowerCase().replace(/\s+/g, '-')}` : ''}.csv`;
    ecrireCsv(path.join(dossier, n), f);
    fichiers.push(n);
  });
  let note = null;
  if (o.format !== 'csv') {
    try {
      await ecrireXlsx(path.join(dossier, `${nom}.xlsx`), feuilles);
      fichiers.push(`${nom}.xlsx`);
    } catch (e) {
      if (e.code !== 'DEPENDANCE_ABSENTE') throw e;
      note = 'Excel non produit (outillage indisponible) : ouvrir le CSV dans Excel, LibreOffice ou Numbers.';
    }
  }
  sortir(0, [`Tableau ${quoi} (en codes) dans ${dossier} :`, ...fichiers.map((f) => `  - ${f}`), note].filter(Boolean).join('\n'));
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

commandes.charge = (o) => {
  const id = o._[0];
  const { d } = chargerEffectif(id);
  const fc = path.join(d, 'charge.yaml');
  const charge = existsSync(fc) ? lireYaml(fc) : { equipe: id, entrees: [] };
  if (o.rpe !== undefined || o.duree !== undefined) {
    if (typeof o.date !== 'string' || o.duree === undefined || o.rpe === undefined) sortir(1, 'Indiquer --date AAAA-MM-JJ, --duree (minutes) et --rpe (0 à 10).');
    const type = typeof o.type === 'string' ? o.type : 'seance';
    const parCode = typeof o['par-code'] === 'string'
      ? Object.fromEntries(o['par-code'].split(',').map((x) => x.trim().split('=')).map(([c, v]) => [c.toUpperCase(), Number(v)]))
      : null;
    const entree = { date: o.date, type, duree_min: Number(o.duree), rpe_groupe: Number(o.rpe), ...(parCode ? { par_code: parCode } : {}), source: 'coach' };
    const avant = existsSync(fc) ? readFileSync(fc, 'utf8') : null;
    charge.entrees = [...charge.entrees.filter((x) => !(String(x.date) === o.date && x.type === type)), entree].sort((a, b) => (String(a.date) < String(b.date) ? -1 : 1));
    ecrireYaml(fc, charge, '# Charge réalisée (RPE × durée) — en codes, aucune donnée de santé.');
    const erreurs = validerChemin(fc).flatMap((r) => r.erreurs);
    if (erreurs.length) {
      // Rien n'est gardé d'une saisie refusée.
      if (avant === null) rmSync(fc);
      else writeFileSync(fc, avant);
      sortir(1, `Charge non enregistrée :\n${erreurs.map((e) => `  - ${e}`).join('\n')}`);
    }
    sortir(0, `Charge du ${o.date} (${type}) : ${entree.duree_min} min × ${entree.rpe_groupe} = ${entree.duree_min * entree.rpe_groupe}${parCode ? ` ; ${Object.keys(parCode).length} RPE individuel(s)` : ''}.`);
  }
  if (!charge.entrees.length) sortir(0, `Aucune charge notée pour ${id}.`);
  const b = bilanCharge(charge, date(o));
  if (o.json) {
    const { semaines, ...reste } = b;
    sortir(0, JSON.stringify(reste, null, 2));
  }
  sortir(0, [
    `Charge de ${id}, semaine du ${b.lundi} : ${b.total} (${b.entrees} séance(s) ou match(s)).`,
    b.reference !== null ? `Moyenne des ${b.semaines_reference} semaines précédentes : ${b.reference} (écart ${b.ecart_pct > 0 ? '+' : ''}${b.ecart_pct} %).` : `Pas encore assez de semaines notées pour une tendance (${b.semaines_reference}).`,
    b.monotonie !== null ? `Monotonie : ${b.monotonie}.` : null,
    ...b.alertes.map((a) => `→ ${a.message}`),
    'Repères d\'entraînement (hypothèses), pas des indicateurs médicaux.',
  ].filter(Boolean).join('\n'));
};

commandes.tests = (o) => {
  const id = o._[0];
  const { d } = chargerEffectif(id);
  const ft = path.join(d, 'tests.yaml');
  const tests = existsSync(ft) ? lireYaml(ft) : { equipe: id, resultats: [] };
  const ref = new Map(referenceTests().tests.map((t) => [t.id, t]));
  if (o.resultats !== undefined) {
    if (typeof o.date !== 'string' || typeof o.test !== 'string' || typeof o.resultats !== 'string') sortir(1, `Indiquer --date, --test (${[...ref.keys()].join(', ')}) et --resultats J01=…,J02=…`);
    const nouveaux = o.resultats.split(',').map((x) => x.trim().split('=')).map(([c, v]) => ({ date: o.date, test: o.test, code: c.toUpperCase(), valeur: Number(String(v).replace(',', '.')) }));
    const avant = existsSync(ft) ? readFileSync(ft, 'utf8') : null;
    const cles = new Set(nouveaux.map((r) => `${r.code}`));
    tests.resultats = [...tests.resultats.filter((r) => !(String(r.date) === o.date && r.test === o.test && cles.has(r.code))), ...nouveaux];
    ecrireYaml(ft, tests, '# Tests physiques — en codes, 16 ans et plus, sans commentaire ni classement.');
    const erreurs = validerChemin(ft).flatMap((r) => r.erreurs);
    if (erreurs.length) {
      if (avant === null) rmSync(ft);
      else writeFileSync(ft, avant);
      sortir(1, `Résultats non enregistrés :\n${erreurs.map((e) => `  - ${e}`).join('\n')}`);
    }
    sortir(0, `${nouveaux.length} résultat(s) au test « ${ref.get(o.test).libelle} » du ${o.date}.`);
  }
  if (!tests.resultats.length) sortir(0, `Aucun test noté pour ${id}.`);
  const p = progression(tests);
  if (o.json) sortir(0, JSON.stringify(p, null, 2));
  const lignes = [`Progression de chaque joueur (pas de classement, pas de norme) :`];
  for (const [test, codes] of Object.entries(p)) {
    const t = ref.get(test);
    lignes.push(`  ${t?.libelle || test} (${t?.unite || ''}) :`);
    for (const [code, v] of Object.entries(codes).sort()) {
      lignes.push(`    ${code} : ${v.premier.valeur} (${v.premier.date})${v.evolution === null ? '' : ` → ${v.dernier.valeur} (${v.dernier.date}), ${v.evolution > 0 ? '+' : ''}${v.evolution}${v.mieux === true ? ' — progrès' : v.mieux === false ? ' — en retrait' : ' — stable'}`}`);
    }
  }
  sortir(0, lignes.join('\n'));
};

commandes.rotation = (o) => {
  const fichier = o._[0];
  if (!fichier) sortir(1, 'Usage : rotation <match.yaml> [--periode N] [--ecrire]');
  const match = lireYaml(path.resolve(fichier));
  const joueurs = match.convoques?.length ? match.convoques : [...(match.composition?.titulaires || []).map((t) => t.code), ...(match.composition?.remplacants || [])];
  if (!joueurs.length) sortir(1, 'Aucun joueur : indiquer les convoqués (convoques) ou la composition.');
  const duree = dureeTotale(match);
  const rencontres = match.rencontres?.length ? match.rencontres : [{ duree_min: duree }];
  const dureePeriode = Number(o.periode || 5);
  // Départage des égalités décalé d'un match à l'autre : nombre de matchs
  // déjà enregistrés avant celui-ci.
  const dossierMatchs = path.dirname(path.dirname(path.resolve(fichier)));
  const decalage = existsSync(dossierMatchs) ? readdirSync(dossierMatchs).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x) && x < String(match.date)).length : 0;
  const surLeTerrain = match.regles.sur_le_terrain;
  const r = planifierRotation({ joueurs, surLeTerrain, rencontres, dureePeriode, decalage });
  if (!r.possible) sortir(1, `Rotation impossible : ${r.raison}.`);
  const b = bilanEquite(r.periodes, joueurs, duree);
  const attente = attenteMax(r.periodes, joueurs);
  const repere = chargerCategories().categories[match.regles.categorie]?.temps_de_jeu?.valeur;
  const moitie = b.part_min >= 0.5;
  // La cible écrite dit si elle est tenue : jamais de promesse fausse.
  const cible = repere && !moitie ? `${repere} — non atteinte ici : ${joueurs.length} joueurs pour ${surLeTerrain} places` : repere;
  if (o.ecrire) {
    match.temps_de_jeu = { ...(cible ? { cible } : {}), duree_periode_min: dureePeriode, periodes: r.periodes };
    ecrireYaml(path.resolve(fichier), match, '# Match — en codes, aucun nom ici.');
    const erreurs = validerChemin(path.resolve(fichier)).flatMap((x) => x.erreurs);
    if (erreurs.length) sortir(1, `Écrit mais invalide :\n${erreurs.join('\n')}`);
  }
  const inevitable = joueurs.length > 2 * surLeTerrain;
  sortir(0, [
    `Rotation : ${joueurs.length} joueurs, ${match.regles.sur_le_terrain} sur le terrain, ${r.periodes.length} périodes de ${dureePeriode} min, ${duree} min au total.`,
    ...Object.entries(b.minutes).map(([c, m]) => `  ${c} : ${m} min`),
    `Écart entre joueurs : ${b.ecart} min. ${moitie ? 'Chacun joue au moins la moitié du temps.' : `Le moins servi joue ${Math.round(100 * b.part_min)} % du temps : trop de joueurs pour une seule équipe ? (repère d'équité, hypothèse)`}`,
    `Attente la plus longue sur le banc : ${attente.max} min d'affilée.${attente.deuxDeSuite.length ? ` ${attente.deuxDeSuite.length} joueur(s) attendent deux périodes de suite${inevitable ? ` (inévitable : plus de deux fois plus de joueurs que de places)` : ''} : ${attente.deuxDeSuite.join(', ')}.` : ' Personne n\'attend deux périodes de suite.'}`,
    cible ? `Repère : ${cible} (hypothèse pédagogique).` : null,
    o.ecrire ? 'Enregistré dans match.yaml.' : '--ecrire pour l\'enregistrer.',
  ].filter(Boolean).join('\n'));
};

const [nom, ...reste] = process.argv.slice(2);
if (!nom || nom === 'aide' || nom === '--help' || nom === '-h') sortir(0, AIDE);
if (!commandes[nom]) sortir(1, `Commande inconnue : ${nom}\n\n${AIDE}`);
try {
  await commandes[nom](options(reste));
} catch (e) {
  if (e.code === 'DEPENDANCE_ABSENTE') sortir(3, e.message);
  sortir(1, `Erreur : ${e.message}`);
}
