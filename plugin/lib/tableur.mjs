// Tableaux de présences, de temps de jeu et de progrès, en codes.
// CSV toujours (sans dépendance, séparateur « ; » et BOM pour Excel en
// français) ; Excel (.xlsx) avec exceljs quand il est disponible.
//
// RGPD : jamais de prénom. Une colonne « Prénom » est laissée VIDE, à
// remplir à la main par le coach s'il le souhaite. Ce module ne lit pas la
// table des prénoms.
import { writeFileSync } from 'node:fs';
import { charger } from './deps.mjs';
import { tauxDePresence } from './effectif.mjs';
import { minutesJouees } from './temps-de-jeu.mjs';
import { monotonie, parSemaine, tendance } from './charge.mjs';
import { progression, referenceTests } from './tests-physiques.mjs';

const TYPES = { seance: 'séance', match: 'match', plateau: 'plateau', tournoi: 'tournoi' };
const NIVEAUX = { 'a-travailler': 'à travailler', 'en-cours': 'en cours', acquis: 'acquis' };

export function tableauPresences(effectif, presences) {
  const dates = [...presences.dates].sort((a, b) => (a.date < b.date ? -1 : 1));
  const taux = tauxDePresence(effectif, presences);
  const entetes = ['Code', 'Prénom (à remplir à la main)', ...dates.map((d) => `${d.date} (${TYPES[d.type] || d.type})`), 'Présences', 'Taux %'];
  const lignes = effectif.joueurs.filter((j) => j.actif !== false).map((j) => [
    j.code,
    '',
    ...dates.map((d) => (d.presents.includes(j.code) ? 'P' : (d.excuses || []).includes(j.code) ? 'E' : '')),
    `${taux[j.code].presents}/${taux[j.code].total}`,
    taux[j.code].taux ?? '',
  ]);
  return { nom: 'Présences', entetes, lignes, legende: 'P = présent, E = excusé, vide = absent' };
}

export function tableauTempsDeJeu(match) {
  const periodes = match.temps_de_jeu?.periodes || [];
  const rencontres = [...new Set(periodes.map((p) => p.rencontre || 1))];
  const joueurs = [...new Set(periodes.flatMap((p) => p.sur_le_terrain))].sort();
  const total = periodes.length ? periodes.at(-1).fin_min : 0;
  const entetes = ['Code', 'Prénom (à remplir à la main)', ...rencontres.map((r) => (rencontres.length > 1 ? `Rencontre ${r} (min)` : 'Minutes')), 'Total (min)', '% du temps'];
  const lignes = joueurs.map((c) => {
    const parRencontre = rencontres.map((r) => minutesJouees(periodes.filter((p) => (p.rencontre || 1) === r))[c] || 0);
    const t = parRencontre.reduce((a, b) => a + b, 0);
    return [c, '', ...parRencontre, t, total ? Math.round((100 * t) / total) : ''];
  });
  const rotation = periodes.map((p) => [`${p.debut_min}-${p.fin_min} min`, p.rencontre || 1, p.sur_le_terrain.join(' ')]);
  return [
    { nom: 'Temps de jeu', entetes, lignes },
    { nom: 'Rotation', entetes: ['Période', 'Rencontre', 'Sur le terrain'], lignes: rotation },
  ];
}

export function tableauProgres(effectif, progres, competences) {
  const ids = [...new Set(progres.observations.map((o) => o.competence))];
  const libelles = Object.fromEntries(competences.competences.map((c) => [c.id, c.libelle]));
  const dernier = {};
  for (const o of [...progres.observations].sort((a, b) => (a.date < b.date ? -1 : 1))) dernier[`${o.code}|${o.competence}`] = o;
  const entetes = ['Code', 'Prénom (à remplir à la main)', ...ids.map((i) => libelles[i] || i)];
  const lignes = effectif.joueurs.filter((j) => j.actif !== false).map((j) => [j.code, '', ...ids.map((i) => NIVEAUX[dernier[`${j.code}|${i}`]?.niveau] || '')]);
  return { nom: 'Progrès', entetes, lignes, legende: 'Dernière observation par compétence (à travailler, en cours, acquis)' };
}

// Charge : par semaine (groupe), par séance, et par joueur seulement si des
// RPE individuels existent (16 ans et plus, contrôlés à la saisie).
export function tableauCharge(charge) {
  const semaines = parSemaine(charge);
  const lundis = Object.keys(semaines).sort();
  const parSemaineFeuille = {
    nom: 'Charge par semaine',
    entetes: ['Semaine du', 'Séances et matchs', 'Charge', 'Moyenne des semaines précédentes', 'Écart %', 'Monotonie'],
    lignes: lundis.map((l) => {
      const t = tendance(semaines, l);
      return [l, semaines[l].entrees, semaines[l].total, t.reference ?? '', t.ecart_pct ?? '', monotonie(semaines[l], l) ?? ''];
    }),
    legende: 'Charge = intensité ressentie (0 à 10) × minutes. Repères d\'entraînement (hypothèses), pas des indicateurs médicaux.',
  };
  const entrees = [...charge.entrees].sort((a, b) => (String(a.date) < String(b.date) ? -1 : 1));
  const parSeance = {
    nom: 'Séances',
    entetes: ['Date', 'Type', 'Durée (min)', 'Intensité ressentie (groupe)', 'Charge'],
    lignes: entrees.map((e) => [String(e.date), e.type, e.duree_min, e.rpe_groupe, e.duree_min * e.rpe_groupe]),
  };
  const codes = [...new Set(entrees.flatMap((e) => Object.keys(e.par_code || {})))].sort();
  if (!codes.length) return [parSemaineFeuille, parSeance];
  const avecCodes = entrees.filter((e) => e.par_code);
  const parJoueur = {
    nom: 'Par joueur (16 ans et plus)',
    entetes: ['Code', 'Prénom (à remplir à la main)', ...avecCodes.map((e) => `${e.date} (${e.type})`)],
    lignes: codes.map((c) => [c, '', ...avecCodes.map((e) => (e.par_code[c] !== undefined ? e.par_code[c] * e.duree_min : ''))]),
    legende: 'Charge individuelle = intensité ressentie du joueur × minutes. Pas de classement entre joueurs.',
  };
  return [parSemaineFeuille, parSeance, parJoueur];
}

// Tests physiques : une feuille par test, progression de chaque joueur.
export function tableauTests(tests) {
  const ref = new Map(referenceTests().tests.map((t) => [t.id, t]));
  return Object.entries(progression(tests)).map(([test, codes]) => {
    const t = ref.get(test);
    const dates = [...new Set(tests.resultats.filter((r) => r.test === test).map((r) => String(r.date)))].sort();
    return {
      nom: (t?.court || t?.libelle || test).slice(0, 31),
      entetes: ['Code', 'Prénom (à remplir à la main)', ...dates.map((d) => `${d} (${t?.unite || ''})`), 'Évolution', 'Lecture'],
      lignes: Object.keys(codes).sort().map((c) => [
        c, '', ...dates.map((d) => tests.resultats.find((r) => r.test === test && r.code === c && String(r.date) === d)?.valeur ?? ''),
        codes[c].evolution ?? '', codes[c].mieux === true ? 'progrès' : codes[c].mieux === false ? 'en retrait' : 'stable',
      ]),
      legende: 'Progression de chaque joueur par rapport à lui-même : pas de classement, pas de norme. Données personnelles : ne pas diffuser.',
    };
  });
}

const echapperCsv = (v) => {
  const s = String(v ?? '');
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function ecrireCsv(fichier, { entetes, lignes }) {
  const texte = [entetes, ...lignes].map((l) => l.map(echapperCsv).join(';')).join('\r\n');
  writeFileSync(fichier, `﻿${texte}\r\n`);
}

export async function ecrireXlsx(fichier, feuilles) {
  const ExcelJS = charger('exceljs');
  const classeur = new ExcelJS.Workbook();
  classeur.creator = 'coach-rugby';
  for (const f of feuilles) {
    const ws = classeur.addWorksheet(f.nom.slice(0, 31));
    ws.addRow(f.entetes).font = { bold: true };
    for (const l of f.lignes) ws.addRow(l);
    ws.columns.forEach((c, i) => { c.width = Math.max(8, Math.min(40, String(f.entetes[i] ?? '').length + 2)); });
    ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 1 }];
    if (f.legende) {
      ws.addRow([]);
      ws.addRow([f.legende]).font = { italic: true };
    }
  }
  await classeur.xlsx.writeFile(fichier);
}
