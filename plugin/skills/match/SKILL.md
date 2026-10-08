---
name: match
description: Prépare et débriefe un match, un plateau ou un tournoi de rugby — convocation, composition par poste, rotation équitable du temps de jeu chez les jeunes, projet de jeu, plan de match, causerie, sécurité — puis statistiques simples et débriefing, avec la fiche match à imprimer ou sur téléphone. En codes, sans prénom dans les fichiers.
when_to_use: Quand le coach prépare une rencontre (« on joue samedi, aide-moi pour la compo », « plateau dimanche avec 13 gamins, comment je fais tourner ? », « prépare la causerie du derby »), veut sa fiche match, ou revient d'un match (« on a perdu 12 à 20 », « fais le débrief »).
argument-hint: "[équipe] [date du match]"
---

# Préparer et débriefer un match

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md`,
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md` (sections `rotation`,
`exporter` un match, `tableau`) et
`${CLAUDE_PLUGIN_ROOT}/references/protocole-commotion.md`.

- Schéma : `${CLAUDE_PLUGIN_ROOT}/schemas/match.schema.json`.
- Exemples :
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-m10-les-ecureuils/m10/matchs/2026-10-17/match.yaml`
    (plateau, rotation) ;
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-seniors-f3-les-goelands/seniors-f3/matchs/2026-10-18/match.yaml`
    (derby : composition, statistiques, débriefing).

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

**À dire une fois, en une phrase** : la fiche du plugin est un outil du
coach ; la feuille de match officielle reste la **FDM EDR** à l'école de
rugby, **Oval-e** ailleurs. Ne jamais saisir quoi que ce soit dans ces outils
à la place du coach.

## 1. Situer la rencontre

1. Prendre l'équipe et la date ($ARGUMENTS), sinon la prochaine échéance de
   `statut <equipe>`.
2. Lancer `regles <catégories> --pratique <pratique> --date <date>` : forme
   de jeu, nombre de joueurs sur le terrain, mêlée permise ou non.
3. Le fichier est `<equipe>/matchs/<AAAA-MM-JJ>/match.yaml`. Le reprendre
   s'il existe.
4. L'adversaire est un **club** (« RC Voisinville »), jamais une personne.

## 2. Convoquer

1. Partir des codes `disponible: true` de `effectif.yaml` et des présences
   récentes. Montrer au coach les **prénoms** de `.prenoms.yaml` à côté des
   codes, dans la conversation seulement.
2. Le coach répond en prénoms : les traduire en codes.
3. Sans effectif en codes, travailler en nombres (« 13 enfants ») et
   proposer `/coach-rugby:effectif` plus tard.
4. Écrire `convoques` (codes).

## 3. Composer et faire tourner

- **Match à XV, à X, à 7** : `composition.titulaires` (code et poste) et
  `remplacants`. Postes de première ligne seulement si la mêlée est permise ;
  en M14 et M15F, rappeler le **passeport du joueur de devant** (à vérifier
  auprès du comité).
- **École de rugby (plateau, tournoi)** : pas de titulaires. Lancer
  `rotation <match.yaml> --ecrire` (périodes de 5 minutes, ou `--periode N`).
  Chacun joue autant que possible, personne ne reste deux fois de suite sur
  le banc. Présenter la grille au coach avec les prénoms, et dire que c'est
  un **repère d'équité (hypothèse pédagogique)** : aucune règle de temps de
  jeu minimal n'a été trouvée dans le Cahier des écoles de rugby.
- Trop d'enfants pour une seule équipe (le moins servi joue moins de la
  moitié du temps) : proposer deux équipes si le plateau le permet.
- Au chemin B, appliquer la méthode `rotation` de `outillage.md`.

## 4. Préparer

Une question au plus, avec des choix : **qu'est-ce qui compte le plus cette
fois ?**

- `projet_de_jeu` : une phrase ;
- `plan_de_match` : trois points au plus ;
- `causerie` : **trois phrases au plus**, simples, positives. À l'école de
  rugby : plaisir, respect, avancer ensemble ;
- `securite` : protège-dents (fortement recommandé en 2026-2027) ; conduite
  en cas de choc à la tête (sortie immédiate et définitive, parents prévenus
  pour un mineur, avis médical) ; eau et pauses ;
- `hypotheses` et `sources`, comme pour une séance.

## 5. Écrire, valider, fiche match

1. Écrire `match.yaml` en codes, sur le modèle des exemples.
2. Lancer `valider <match.yaml>` et corriger jusqu'à zéro erreur : nombre
   sur le terrain, codes inconnus ou indisponibles, mêlée, sécurité, équité.
3. Proposer en une ligne la **fiche match** :
   `exporter <match.yaml> --pdf` (A4 et téléphone), et, pour l'école de
   rugby, le tableau du temps de jeu : `tableau temps-de-jeu <equipe> --match <date>`.

## 6. Après le match

1. Demander le score et, si le coach le veut, quelques **statistiques
   simples** (essais, plaquages réussis et manqués, ballons perdus,
   pénalités concédées) dans `stats.equipe` et `stats.adversaire`, en
   nombres entiers. Statistiques par joueur seulement en codes
   (`stats.par_code`).
2. `debriefing` :
   - `reussites` et `a_retravailler`, deux ou trois points chacun, sur le
     jeu de l'équipe, **jamais un jugement sur un joueur** ;
   - `prochaines_seances` : les thèmes à reprendre.
3. Blessure ou choc évoqué : ne pas l'écrire dans le fichier, aucun avis
   médical, rappel du protocole commotion et renvoi vers un professionnel de
   santé.
4. Valider, ajouter une ligne datée dans `journal.md` (sans prénom).
5. Proposer en une ligne : préparer la semaine (`/coach-rugby:semaine`) ou la
   prochaine séance (`/coach-rugby:seance`) à partir des thèmes du
   débriefing. Ne rien enchaîner sans l'accord du coach.
