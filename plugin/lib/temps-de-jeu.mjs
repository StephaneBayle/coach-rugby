// Rotation du temps de jeu : à chaque période, entrent ceux qui ont le moins
// joué. Déterministe ; l'écart entre deux joueurs ne dépasse jamais une
// période. L'équité est une HYPOTHÈSE PÉDAGOGIQUE (categories.yaml,
// temps_de_jeu) : aucune règle de temps de jeu minimal n'a été trouvée dans
// le Cahier des écoles de rugby 2026-2027.
//
// N'importe que des modules node:*.

// Périodes [debut, fin) de `dureePeriode` minutes, rencontre par rencontre
// (une période ne chevauche jamais deux rencontres).
export function decouperPeriodes(rencontres, dureePeriode) {
  const periodes = [];
  let t = 0;
  rencontres.forEach((r, i) => {
    for (let debut = 0; debut < r.duree_min; debut += dureePeriode) {
      const fin = Math.min(debut + dureePeriode, r.duree_min);
      periodes.push({ debut_min: t + debut, fin_min: t + fin, rencontre: i + 1 });
    }
    t += r.duree_min;
  });
  return periodes;
}

export function planifierRotation({ joueurs, surLeTerrain, rencontres, dureePeriode = 5 }) {
  const codes = [...joueurs].sort();
  if (codes.length < surLeTerrain) {
    return { possible: false, raison: `${codes.length} joueur(s) pour ${surLeTerrain} places sur le terrain`, periodes: [], minutes: {} };
  }
  const minutes = Object.fromEntries(codes.map((c) => [c, 0]));
  const dernierRepos = Object.fromEntries(codes.map((c) => [c, -1]));
  const periodes = decouperPeriodes(rencontres, dureePeriode).map((p, i) => {
    // Ordre : moins de minutes jouées ; à égalité, celui qui s'est reposé le
    // plus récemment entre ; puis l'ordre des codes.
    const choisis = [...codes]
      .sort((a, b) => minutes[a] - minutes[b] || dernierRepos[b] - dernierRepos[a] || (a < b ? -1 : 1))
      .slice(0, surLeTerrain)
      .sort();
    const duree = p.fin_min - p.debut_min;
    for (const c of codes) {
      if (choisis.includes(c)) minutes[c] += duree;
      else dernierRepos[c] = i;
    }
    return { ...p, sur_le_terrain: choisis };
  });
  return { possible: true, periodes, minutes };
}

// Minutes jouées par code d'après des périodes (plan ou réel).
export function minutesJouees(periodes) {
  const m = {};
  for (const p of periodes) for (const c of p.sur_le_terrain) m[c] = (m[c] || 0) + (p.fin_min - p.debut_min);
  return m;
}

// Bilan d'équité : min, max, écart, part du temps total du moins servi.
export function bilanEquite(periodes, joueurs, dureeTotale) {
  const m = minutesJouees(periodes);
  const valeurs = joueurs.map((c) => m[c] || 0);
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  return { min, max, ecart: max - min, part_min: dureeTotale ? min / dureeTotale : 0, minutes: Object.fromEntries(joueurs.map((c) => [c, m[c] || 0])) };
}
