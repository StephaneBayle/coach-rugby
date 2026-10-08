// Contrôles d'un match, d'un plateau ou d'un tournoi : codes connus et
// disponibles, nombre sur le terrain conforme à la forme de jeu du jour,
// postes de mêlée seulement si la mêlée est permise, périodes continues,
// équité à l'école de rugby, rappels de sécurité.
import { reglesDuJour } from './categories.mjs';
import { publicDe } from './planification.mjs';
import { bilanEquite } from './temps-de-jeu.mjs';

const PREMIERE_LIGNE = ['pilier-gauche', 'talonneur', 'pilier-droit'];

// Nombres de joueurs sur le terrain permis par les formes du jour
// (« 5 x 5 ou 7 x 7 » → 5 et 7).
export function effectifsPermis(regles) {
  const n = new Set();
  for (const f of regles.formes) for (const m of String(f.effectif || '').matchAll(/(\d+)\s*x\s*\d+/g)) n.add(Number(m[1]));
  return [...n].sort((a, b) => a - b);
}

export const dureeTotale = (match) =>
  match.rencontres?.length ? match.rencontres.reduce((s, r) => s + r.duree_min, 0) : match.duree_min || 0;

export function controlerMatch(match, { equipe = null, effectif = null } = {}) {
  const erreurs = [];
  const joueurs = new Map((effectif?.joueurs || []).map((j) => [j.code, j]));
  const verifierCodes = (codes, ou) => {
    for (const c of codes) {
      if (!effectif) continue;
      if (!joueurs.has(c)) erreurs.push(`${ou} : code ${c} absent de effectif.yaml`);
      else if (joueurs.get(c).disponible === false) erreurs.push(`${ou} : ${c} est indisponible`);
    }
  };
  const convoques = match.convoques || [];
  const titulaires = (match.composition?.titulaires || []).map((t) => t.code);
  verifierCodes(convoques, 'convoqués');
  verifierCodes(titulaires, 'titulaires');
  verifierCodes(match.composition?.remplacants || [], 'remplaçants');
  const dans = new Set(convoques.length ? convoques : [...titulaires, ...(match.composition?.remplacants || [])]);

  const duree = dureeTotale(match);
  if (!duree) erreurs.push('durée inconnue : indiquer duree_min ou les rencontres');
  if (match.rencontres?.length && match.duree_min && match.duree_min !== duree) erreurs.push(`duree_min (${match.duree_min}) différente de la somme des rencontres (${duree})`);

  if (equipe) {
    const regles = reglesDuJour({ categories: equipe.categories, pratique: equipe.pratique, date: match.date });
    const permis = effectifsPermis(regles);
    if (permis.length && !permis.includes(match.regles.sur_le_terrain)) {
      erreurs.push(`${match.regles.sur_le_terrain} joueurs sur le terrain : la forme du jour (${regles.formes.map((f) => f.libelle).join(' ou ')}) prévoit ${permis.join(' ou ')}`);
    }
    if (titulaires.length && titulaires.length !== match.regles.sur_le_terrain) {
      erreurs.push(`${titulaires.length} titulaires pour ${match.regles.sur_le_terrain} places sur le terrain`);
    }
    const postes = (match.composition?.titulaires || []).map((t) => t.poste).filter(Boolean);
    // Première ligne : un joueur formé à ces postes (sécurité en mêlée). On
    // ne contrôle que si l'effectif indique ses postes.
    for (const t of match.composition?.titulaires || []) {
      const habituels = joueurs.get(t.code)?.postes;
      if (PREMIERE_LIGNE.includes(t.poste) && habituels?.length && !habituels.some((p) => PREMIERE_LIGNE.includes(p))) {
        erreurs.push(`${t.code} placé en ${t.poste} alors que ses postes sont ${habituels.join(', ')} : la première ligne demande un joueur formé à ces postes (sécurité en mêlée ; ajouter le poste dans effectif.yaml s'il l'est)`);
      }
    }
    if (postes.some((p) => PREMIERE_LIGNE.includes(p))) {
      if (!regles.melee) erreurs.push(`poste de première ligne alors que la forme du jour n'a pas de mêlée (${regles.formes.map((f) => f.libelle).join(' ou ')})`);
      else if (regles.regles_transverses.some((r) => r.id === 'passeport-joueur-de-devant')) {
        const textes = [...(match.securite || []), ...(match.preparation?.points_vigilance || [])];
        if (!textes.some((t) => /passeport/i.test(t))) erreurs.push('première ligne en M14 / M15F : rappeler le passeport du joueur de devant (à vérifier auprès du comité)');
      }
    }
    // Sécurité, comme pour une séance.
    if (regles.plaquage) {
      const textes = [...(match.securite || []), ...(match.preparation?.points_vigilance || [])];
      if (!textes.some((t) => /t[eê]te|commotion/i.test(t))) erreurs.push('rappeler la conduite en cas de choc à la tête (sortie immédiate et définitive, avis médical)');
      if (!textes.some((t) => /prot[eè]ge[- ]dents?/i.test(t))) erreurs.push('rappeler le protège-dents (fortement recommandé en 2026-2027)');
    }
    // Temps de jeu.
    const periodes = match.temps_de_jeu?.periodes || [];
    if (periodes.length) {
      let t = 0;
      periodes.forEach((p, i) => {
        if (p.debut_min !== t) erreurs.push(`période ${i + 1} : commence à ${p.debut_min} min au lieu de ${t}`);
        if (p.fin_min <= p.debut_min) erreurs.push(`période ${i + 1} : fin avant début`);
        if (p.sur_le_terrain.length !== match.regles.sur_le_terrain) erreurs.push(`période ${i + 1} : ${p.sur_le_terrain.length} joueurs sur le terrain au lieu de ${match.regles.sur_le_terrain}`);
        for (const c of p.sur_le_terrain) if (dans.size && !dans.has(c)) erreurs.push(`période ${i + 1} : ${c} n'est pas convoqué`);
        t = p.fin_min;
      });
      if (t !== duree) erreurs.push(`les périodes couvrent ${t} min sur ${duree}`);
      if (publicDe(equipe) === 'edr' && dans.size) {
        const b = bilanEquite(periodes, [...dans], duree);
        const pas = match.temps_de_jeu.duree_periode_min || Math.max(...periodes.map((p) => p.fin_min - p.debut_min));
        if (b.ecart > pas) erreurs.push(`école de rugby : écart de temps de jeu de ${b.ecart} min entre enfants, au-delà d'une période (${pas} min) — repère d'équité (hypothèse pédagogique)`);
      }
    }
  }
  if (match.stats?.par_code) verifierCodes(Object.keys(match.stats.par_code), 'statistiques');
  return erreurs;
}
