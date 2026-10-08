#!/usr/bin/env node
// CLI de l'outillage coach-rugby (chemin A des skills). Tout ce qu'elle fait
// peut aussi être fait à la main (chemin B) : voir references/outillage.md.
//
// Codes de sortie : 0 succès ; 1 erreurs dans les données ou la commande ;
// 3 outillage indisponible (dépendance absente) → suivre le chemin B.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chargerBibliotheque, DOSSIER_BIBLIOTHEQUE, genererIndex } from '../lib/bibliotheque.mjs';
import { exporterSeance } from '../lib/export.mjs';
import { genererSvg } from '../lib/terrain.mjs';
import { lireYaml } from '../lib/yaml.mjs';
import { dossierSaison } from '../lib/chemins.mjs';
import { reglesDuJour } from '../lib/categories.mjs';
import { aujourdhui, ecrireDate, lireDate } from '../lib/dates.mjs';
import { chargerEquipe, equipes, initialiser, validerChemin } from '../lib/dossier.mjs';
import { avancement, seancesAvec, situer, suggestions } from '../lib/etat.mjs';

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
  exporter <seance.yaml> [--pdf] [--formats a4,telephone]
        Fiches HTML (A4, téléphone), schémas SVG, texte pour Mon Coach
        Assistant (clubs) et, avec --pdf, PDF via Chrome.

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
        r.situation = situer(saison, jour);
        r.suggestions = suggestions(saison, jour, { derniereSeance });
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
  const r = exporterSeance(path.resolve(fichier), { pdf: Boolean(o.pdf), formats });
  const lignes = [`Exports dans ${r.dossier} :`, ...r.fichiers.map((f) => `  - ${f}`)];
  if (r.pdf.demande && !r.pdf.ok) lignes.push(`PDF non produit : ${r.pdf.raison}`);
  sortir(0, lignes.join('\n'));
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
