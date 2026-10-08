// Export d'une séance : fiche HTML autonome (A4 et téléphone), schémas SVG,
// texte à coller dans Mon Coach Assistant, PDF via Chrome si disponible.
// Les fichiers vont dans seances/<date>/exports/ ; ils se régénèrent, ils ne
// se retouchent pas.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chargerBibliotheque } from './bibliotheque.mjs';
import { chargerCategories, reglesDuJour } from './categories.mjs';
import { imprimerPdf, trouverChrome } from './chrome.mjs';
import { lireDate } from './dates.mjs';
import { RACINE_PLUGIN } from './deps.mjs';
import { contexteSeance } from './seance.mjs';
import { genererSvg } from './terrain.mjs';
import { lireYaml } from './yaml.mjs';

const PARTIES = { accueil: 'Accueil', echauffement: 'Échauffement', corps: 'Corps de séance', jeu: 'Jeu', 'retour-au-calme': 'Retour au calme', bilan: 'Bilan' };
const DOMAINES = { technique: 'Technique', tactique: 'Tactique', physique: 'Physique', mental: 'Mental', valeurs: 'Valeurs' };
const PHASES = {
  'intersaison-bilan': 'Intersaison', 'reprise-prepa': 'Reprise', 'phase-aller': 'Phase aller', treve: 'Trêve', 'phase-retour': 'Phase retour',
  'phases-finales': 'Phases finales', 'plateaux-automne': 'Plateaux d\'automne', 'plateaux-printemps': 'Plateaux de printemps',
  'tournois-fin-saison': 'Tournois de fin de saison', rentree: 'Rentrée', 'periode-scolaire': 'Période scolaire',
  'vacances-scolaires': 'Vacances scolaires', examens: 'Examens', 'fin-annee': 'Fin d\'année',
};
const TERRAINS = { terrain: 'terrain entier', 'demi-terrain': 'demi-terrain', 'quart-de-terrain': 'quart de terrain', gymnase: 'gymnase', autre: 'autre' };
const PAGES = { a4: 'size: A4; margin: 12mm', telephone: 'size: 90mm 160mm; margin: 5mm' };

export const echapper = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Moteur de gabarit minimal : répétitions, puis {{{brut}}} et {{texte}}.
export function remplir(gabarit, contexte) {
  const simple = (t, ctx) =>
    t.replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => String(ctx[k] ?? '')).replace(/\{\{(\w+)\}\}/g, (_, k) => echapper(ctx[k]));
  const repete = gabarit.replace(/<!-- @repeter:(\w+) -->([\s\S]*?)<!-- @fin:\1 -->/g, (_, liste, interieur) =>
    (contexte[liste] || []).map((el) => simple(interieur, { ...contexte, ...el })).join(''),
  );
  return simple(repete, contexte);
}

const dateLongue = (d) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(lireDate(d));

function horloge(heure, minutes) {
  if (!heure) return `+${minutes} min`;
  const [h, m] = heure.split(':').map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

const listeHtml = (items) => (items || []).map((i) => `<li>${echapper(i)}</li>`).join('');
let registre;
function sourceLisible(id) {
  registre ??= new Map(lireYaml(path.join(RACINE_PLUGIN, 'references', 'sources.yaml')).sources.map((s) => [s.id, s]));
  const s = registre.get(id);
  if (!s) return { texte: id };
  const date = s.consulte_le ? `, consulté le ${s.consulte_le}` : s.publie_le ? `, ${s.publie_le}` : '';
  return { texte: `${s.titre} — ${s.editeur}${date}`, url: s.url };
}
const sourcesHtml = (ids) =>
  ids?.length
    ? `<section class="notes"><h3>Sources</h3><ul>${ids
        .map(sourceLisible)
        .map((s) => `<li>${echapper(s.texte)}${s.url ? ` — <a href="${echapper(s.url)}">${echapper(s.url)}</a>` : ''}</li>`)
        .join('')}</ul></section>`
    : '';
const sectionHtml = (titre, items, cls = 'notes') => (items?.length ? `<section class="${cls}"><h3>${echapper(titre)}</h3><ul>${listeHtml(items)}</ul></section>` : '');

// Données communes aux deux formats et au texte MCA.
export function preparer(seance, { equipe, config, dossierSaison }) {
  const ref = chargerCategories();
  const regles = equipe ? reglesDuJour({ categories: equipe.categories, pratique: equipe.pratique, date: seance.date }) : null;
  const statutRegles = seance.regles.statut === 'verifie' ? `vérifiées (saison ${seance.regles.saison})` : `à vérifier (saison ${seance.regles.saison}), elles peuvent varier selon votre comité`;
  const formes = seance.regles.formes.map((f) => ref.formes[f]?.libelle || f).join(' ou ');
  const exercices = new Map(chargerBibliotheque().map((e) => [e.id, e]));
  if (dossierSaison) for (const e of chargerBibliotheque(path.join(dossierSaison, '_bibliotheque-perso', 'exercices'))) exercices.set(e.id, e);
  let ecoule = 0;
  const blocs = seance.blocs.map((b, i) => {
    const debut = horloge(seance.heure, ecoule);
    ecoule += b.duree_min;
    const fiche = b.exercice ? exercices.get(b.exercice) : null;
    const schema = b.schema || fiche?.schema || null;
    const svg = schema
      ? genererSvg(schema, { titre: b.titre, description: b.organisation || fiche?.organisation || b.titre })
          .replace(/id="(titre|desc)"/g, `id="$1-${i + 1}"`)
          .replace('aria-labelledby="titre desc"', `aria-labelledby="titre-${i + 1} desc-${i + 1}"`)
      : '';
    return {
      numero: i + 1,
      debut,
      duree: b.duree_min,
      partie: PARTIES[b.partie],
      titre: b.titre,
      organisation: b.organisation || fiche?.organisation || '',
      consignes: listeHtml(b.consignes),
      consignesTexte: b.consignes,
      adaptations: b.adaptations?.length ? `<h3>Adaptations</h3><ul>${listeHtml(b.adaptations)}</ul>` : '',
      securite: listeHtml(b.securite),
      securiteTexte: b.securite,
      schema: svg,
      fichierSvg: svg ? `bloc-${String(i + 1).padStart(2, '0')}${b.exercice ? `-${b.exercice}` : ''}.svg` : null,
    };
  });
  const p = seance.prochain_evenement;
  return {
    titre: `${equipe?.nom || seance.equipe} — séance du ${dateLongue(seance.date)}`,
    equipe: equipe?.nom || seance.equipe,
    date_longue: dateLongue(seance.date),
    horaire: seance.heure ? `, à ${seance.heure}` : '',
    categorie: (equipe?.categories || [seance.regles.categorie]).map((c) => ref.categories[c]?.libelle || c).join(' + '),
    duree: seance.duree_min,
    effectif: seance.effectif_prevu,
    encadrants: seance.encadrants,
    terrain: TERRAINS[seance.terrain] || '—',
    phase: PHASES[seance.phase] || '—',
    semaine: seance.semaine_saison ? `, semaine ${seance.semaine_saison}` : '',
    prochain: p ? `${p.type} le ${p.date} (J-${p.j_moins})${p.adversaire ? ` contre ${p.adversaire}` : ''}` : '—',
    regles: `${formes} — contact maximal : ${seance.regles.contact_max} — ${statutRegles}.`,
    statut_regles: statutRegles,
    objectifs: seance.objectifs.map((o) => ({ domaine: DOMAINES[o.domaine], texte: o.texte })),
    frise: blocs,
    blocs,
    vigilance: sectionHtml('Points de vigilance', seance.points_vigilance),
    hypotheses: sectionHtml('Hypothèses (choix non sourcés)', seance.hypotheses),
    sources: sourcesHtml(seance.sources),
    materiel: seance.materiel || equipe?.materiel || [],
    conformite: regles,
    clubMca: config?.structure?.type === 'club',
  };
}

export function texteMca(donnees) {
  const g = readFileSync(path.join(RACINE_PLUGIN, 'gabarits', 'pour-mca.txt'), 'utf8');
  const securite = [...new Set(donnees.blocs.flatMap((b) => b.securiteTexte))];
  return remplir(g, {
    ...donnees,
    objectifs: donnees.objectifs.map((o) => `- ${o.domaine} : ${o.texte}`).join('\n'),
    deroule: donnees.blocs.map((b) => `${b.debut} (${b.duree} min) ${b.partie} — ${b.titre}\n${b.consignesTexte.map((c) => `    · ${c}`).join('\n')}`).join('\n'),
    materiel: donnees.materiel.join(', ') || '—',
    securite: securite.map((s) => `- ${s}`).join('\n'),
  }).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

export function ficheHtml(donnees, format) {
  const g = readFileSync(path.join(RACINE_PLUGIN, 'gabarits', 'fiche-seance.html'), 'utf8');
  // Le commentaire d'explication du gabarit ne sert qu'à qui le remplit.
  return remplir(g.replace(/<!-- Gabarit[\s\S]*?-->\n/, ''), { ...donnees, format, page: PAGES[format] });
}

// Exporte une séance. Renvoie { dossier, fichiers, pdf: { demande, ok, raison } }.
export function exporterSeance(fichierSeance, { pdf = false, formats = ['a4', 'telephone'] } = {}) {
  const seance = lireYaml(fichierSeance);
  const ctx = contexteSeance(fichierSeance);
  const donnees = preparer(seance, ctx);
  const dossier = path.join(path.dirname(fichierSeance), 'exports');
  mkdirSync(path.join(dossier, 'schemas'), { recursive: true });
  const fichiers = [];
  const ecrire = (nom, contenu) => {
    writeFileSync(path.join(dossier, nom), contenu);
    fichiers.push(nom);
  };
  for (const f of formats) ecrire(`fiche-${f}.html`, ficheHtml(donnees, f));
  for (const b of donnees.blocs) if (b.fichierSvg) ecrire(path.join('schemas', b.fichierSvg), b.schema);
  if (donnees.clubMca) ecrire('pour-mca.txt', texteMca(donnees));
  const resultat = { dossier, fichiers, pdf: { demande: pdf, ok: false, raison: null } };
  if (pdf) {
    const chrome = trouverChrome();
    if (!chrome) resultat.pdf.raison = 'Chrome introuvable : ouvrir la fiche HTML puis Imprimer > Enregistrer en PDF.';
    else {
      for (const f of formats) {
        const r = imprimerPdf(path.join(dossier, `fiche-${f}.html`), path.join(dossier, `fiche-${f}.pdf`), chrome);
        if (!r.ok) {
          resultat.pdf.raison = r.raison;
          break;
        }
        fichiers.push(`fiche-${f}.pdf`);
      }
      resultat.pdf.ok = !resultat.pdf.raison;
    }
  }
  return resultat;
}

export const existeExport = (fichierSeance) => existsSync(path.join(path.dirname(fichierSeance), 'exports', 'fiche-a4.html'));
