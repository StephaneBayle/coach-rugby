// Rotation du temps de jeu : à chaque période, entrent ceux qui ont le moins
// joué. Déterministe ; l'écart entre deux joueurs ne dépasse jamais une
// période. Au-delà de deux fois plus de joueurs que de places, certains
// attendent forcément deux périodes de suite : on l'annonce, on ne le promet
// pas (attenteMax). L'équité est une HYPOTHÈSE PÉDAGOGIQUE (categories.yaml,
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

// `decalage` fait tourner le départage des égalités d'une rencontre à
// l'autre (par exemple le nombre de matchs déjà joués) : ce ne sont pas
// toujours les mêmes qui jouent la période en plus.
export function planifierRotation({ joueurs, surLeTerrain, rencontres, dureePeriode = 5, decalage = 0 }) {
  const codes = [...joueurs].sort();
  const d = codes.length ? ((decalage % codes.length) + codes.length) % codes.length : 0;
  const rang = Object.fromEntries([...codes.slice(d), ...codes.slice(0, d)].map((c, i) => [c, i]));
  if (codes.length < surLeTerrain) {
    return { possible: false, raison: `${codes.length} joueur(s) pour ${surLeTerrain} places sur le terrain`, periodes: [], minutes: {} };
  }
  const minutes = Object.fromEntries(codes.map((c) => [c, 0]));
  const dernierRepos = Object.fromEntries(codes.map((c) => [c, -1]));
  const periodes = decouperPeriodes(rencontres, dureePeriode).map((p, i) => {
    // Ordre : moins de minutes jouées ; à égalité, celui qui s'est reposé le
    // plus récemment entre ; puis l'ordre des codes, décalé.
    const choisis = [...codes]
      .sort((a, b) => minutes[a] - minutes[b] || dernierRepos[b] - dernierRepos[a] || rang[a] - rang[b])
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

// Attente la plus longue sur le banc (minutes d'affilée), et joueurs qui
// attendent au moins deux périodes de suite.
export function attenteMax(periodes, joueurs) {
  const parCode = {};
  for (const c of joueurs) {
    let cours = 0;
    let max = 0;
    let periodesDeSuite = 0;
    let deuxDeSuite = false;
    for (const p of periodes) {
      if (p.sur_le_terrain.includes(c)) { cours = 0; periodesDeSuite = 0; continue; }
      cours += p.fin_min - p.debut_min;
      periodesDeSuite += 1;
      if (periodesDeSuite >= 2) deuxDeSuite = true;
      max = Math.max(max, cours);
    }
    parCode[c] = { max, deuxDeSuite };
  }
  const valeurs = Object.values(parCode);
  return { max: Math.max(0, ...valeurs.map((v) => v.max)), deuxDeSuite: joueurs.filter((c) => parCode[c].deuxDeSuite), parCode };
}
