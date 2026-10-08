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

**À dire une fois, en une phrase** : la fiche du plugin est un aide-mémoire
du coach ; la feuille de match officielle reste la **feuille de match de
l'école de rugby (FDM EDR)**, remplie par le club, ou **Oval-e** ailleurs. Ne jamais saisir quoi que ce soit dans ces outils
à la place du coach.

## 1. Situer la rencontre

1. Prendre l'équipe et la date ($ARGUMENTS), sinon la prochaine échéance de
   `statut <equipe>`.
2. Lancer `regles <catégories> --pratique <pratique> --date <date>` : forme
   de jeu, nombre de joueurs sur le terrain, mêlée permise ou non. **Dès la
   première fois** qu'une règle est citée au coach, ajouter « à vérifier
   (saison 2026-2027) » et sa source en quelques mots (« Cahier des écoles
   de rugby 2026-2027 »).
3. Le fichier est `<equipe>/matchs/<AAAA-MM-JJ>/match.yaml`. Le reprendre
   s'il existe.
4. L'adversaire est un **club** (« RC Voisinville »), jamais une personne.

## 2. Convoquer

1. Partir des codes `disponible: true` de `effectif.yaml` et des présences
   récentes. Montrer au coach les **prénoms** de `.prenoms.yaml` à côté des
   codes, dans la conversation seulement.
2. Le coach répond en prénoms : les traduire en codes.
3. Sans effectif en codes :
   - le coach donne des **prénoms** : appliquer la section 1 de
     `/coach-rugby:effectif` (un seul accord, « Je note vos N joueurs pour la
     saison, d'accord ? »), puis revenir ici ;
   - il donne un **nombre** : travailler en nombres (« 13 enfants ») et
     proposer `/coach-rugby:effectif` plus tard.
4. Écrire `convoques` (codes).

## 3. Composer et faire tourner

- **Match à XV, à X, à 7** : `composition.titulaires` (code et poste) et
  `remplacants`. Postes de première ligne seulement si la mêlée est permise ;
  en M14 et M15F, rappeler le **passeport du joueur de devant** (à vérifier
  auprès du comité).
- **École de rugby (plateau, tournoi)** : pas de titulaires. Lancer
  `rotation <match.yaml> --ecrire` (périodes de 5 minutes, ou `--periode N`).
  Chacun joue autant que possible, à une période près. Reprendre **telle
  quelle** l'attente la plus longue donnée par la commande (« personne
  n'attend plus de 10 minutes d'affilée ») ; **ne jamais promettre** que
  personne n'attend deux fois de suite : au-delà de deux fois plus de
  joueurs que de places, c'est impossible. Dire que l'équité est un
  **repère (hypothèse pédagogique)** : aucune règle de temps de jeu minimal
  n'a été trouvée dans le Cahier des écoles de rugby.
- **Présenter la grille en prénoms**, dans la conversation seulement : un
  tableau court (une ligne par match ou par moitié), facile à garder en
  capture d'écran sur le téléphone. Ce n'est jamais enregistré.
- Trop d'enfants pour une seule équipe (le moins servi joue moins de la
  moitié du temps) : proposer deux équipes si le plateau le permet.
- Au chemin B, appliquer la méthode `rotation` de `outillage.md`.

**Réponse courte**, surtout à l'école de rugby : d'abord le tableau, puis la
sécurité en une ligne, puis la fiche en une ligne. Le reste (feuille
officielle, piste de deux équipes, équité) en une ligne chacun au plus, ou au
message suivant.

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
4. **Remettre la fiche sans jamais donner d'emplacement** (ni « dossier »,
   ni chemin) : l'afficher ou l'ouvrir, et dire « appuyez sur Imprimer ».
   La fiche est en codes, avec une colonne « Prénom » vide dans la grille de
   rotation, à remplir au stylo si le coach le souhaite.
5. Un joueur à écarter (indisponible, avis médical attendu) : **proposer**
   un remplaçant, ne pas l'imposer.

## 6. Après le match

1. Noter le **score** (`score: { nous, adversaire }`) et, si le coach le
   veut, quelques **statistiques simples** (essais, plaquages réussis et
   manqués, ballons perdus, pénalités concédées, touches gagnées et
   perdues) dans `stats.equipe` et `stats.adversaire`, en nombres entiers.
   Un pourcentage (« touche à 80 % ») va dans le débriefing. Préférer les
   totaux de l'équipe ; une statistique par joueur, seulement en codes
   (`stats.par_code`) et seulement si le coach la demande.
2. `debriefing` :
   - `reussites` et `a_retravailler`, deux ou trois points chacun, sur le
     jeu de l'équipe, **jamais un jugement sur un joueur** ;
   - `prochaines_seances` : les thèmes à reprendre, **sans jour** (c'est la
     semaine qui les place : le lendemain d'un match est souvent une
     récupération).
   - un jugement du coach sur un joueur (« il a été nul ») : garder le fait
     chiffré s'il y en a un, jamais le jugement, et le dire en une phrase.
3. Blessure ou choc évoqué : ne pas l'écrire dans le fichier, aucun avis
   médical ni critère de reprise (phrase type de `regles-d-usage.md`,
   section 3), rappel du protocole commotion et renvoi vers un
   professionnel de santé.
4. Valider, ajouter une ligne datée dans `journal.md` (sans prénom).
5. Proposer en une ligne : préparer la semaine (`/coach-rugby:semaine`) ou la
   prochaine séance (`/coach-rugby:seance`) à partir des thèmes du
   débriefing. Ne rien enchaîner sans l'accord du coach.
