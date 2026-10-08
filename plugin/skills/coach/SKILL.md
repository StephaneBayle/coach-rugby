---
name: coach
description: Point d'entrée du plugin coach-rugby. Crée ou reprend le dossier saison du coach, situe l'équipe dans sa saison (phase, semaine, prochaine échéance, règles de jeu du moment) et propose l'étape suivante.
when_to_use: Quand un coach, un éducateur ou un entraîneur de rugby veut démarrer ou reprendre son suivi de saison, parle de « mes M10 », « mon équipe », « mon groupe », « ma saison », « où on en est », « qu'est-ce que je fais cette semaine », ou demande de l'aide pour entraîner une équipe de rugby sans préciser quoi.
---

# Coach Rugby — point d'entrée

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md` (règles non
négociables) et `${CLAUDE_PLUGIN_ROOT}/references/outillage.md` (chemin A ou B).

Commande de l'outillage (chemin A) — l'utiliser telle quelle :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

Si `node` est absent ou si la commande sort en code 3 : chemin B, sans
inquiéter le coach. Si aucun accès aux fichiers n'est possible (chat) :
travailler sans dossier, le dire en une phrase, et proposer au coach de coller
le contenu de son `saison.yaml` s'il en a un.

## 1. Trouver ou créer le dossier saison

1. Lancer `statut --json`.
2. S'il n'y a pas encore de dossier (pas de `.coach-rugby.yaml`) :
   - demander le **type de structure**, avec choix et `club` par défaut :
     club, pôle de formation, section sportive scolaire, sport-études, centre
     de formation, sélection, autre ;
   - pour un club seulement, demander s'il utilise **Mon Coach Assistant** de
     la FFR (passerelles par copier-coller, jamais d'identifiants) ;
   - lancer `init --structure <type>`, puis noter `utilise_mca` dans
     `.coach-rugby.yaml` ;
   - si une alerte « dossier dans un dépôt git » s'affiche, la transmettre et
     proposer un autre emplacement.
3. Dans Cowork, si le dossier n'est pas accessible, demander au coach de
   sélectionner (ou créer) son dossier `Rugby-Saisons` comme dossier de
   travail, puis recommencer.

## 2. Choisir l'équipe ou le groupe

- **Aucune équipe** : la créer avec le coach, une question à la fois :
  1. catégorie(s) : M5 à M19, M15F, M18F, seniors ; un groupe peut mêler
     plusieurs catégories ;
  2. pratique : école de rugby, XV, X, 7, 5, loisir ;
  3. genre : masculin, féminin, mixte ;
  4. niveau, pour les seniors ou les jeunes (ex. « Fédérale 3 ») ;
  5. **nombre** de joueurs habituel ;
  6. créneaux d'entraînement (jour, heure, durée, lieu) ;
  7. matériel disponible ;
  8. un nom d'équipe libre (« M10 du club »).

  Écrire `<dossier>/<id>/equipe.yaml` sur le modèle de
  `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-m10-les-ecureuils/m10/equipe.yaml`
  (schéma : `${CLAUDE_PLUGIN_ROOT}/schemas/equipe.schema.json`). L'`id` est
  court, en minuscules avec des tirets (`m10`, `seniors-f3`, `cadets-b`) et
  égal au nom du dossier. Ensuite, lancer `valider <dossier>/<id>`.
- **Plusieurs équipes** : demander laquelle.
- Le staff s'écrit en **rôles** et en nombres, jamais en noms. Si le coach
  cite des noms de joueurs, ne pas les écrire dans les fichiers et les
  ajouter à `.joueurs-proteges.txt`, en le lui disant.

## 3. Situer l'équipe dans sa saison

À partir de `statut <id>` (chemin A) ou des règles de
`${CLAUDE_PLUGIN_ROOT}/references/phases-saison.md` (chemin B), donner en
quelques lignes :

- la **phase** et la **semaine** de la saison ;
- la **prochaine échéance** (type, date, J-n, adversaire s'il s'agit d'un club) ;
- les **règles de jeu du moment** pour la catégorie la plus jeune du groupe :
  forme de jeu, contact maximal, plaquage, mêlée, touche, ruck, avec la
  mention « à vérifier (saison 2026-2027) » si le statut n'est pas `verifie` ;
- les **relances** : les présenter comme des suggestions.

Si la saison n'est pas cadrée, le dire simplement.

## 4. Proposer la suite

Proposer, avec une liste numérotée, ce qui a du sens maintenant :

1. `/coach-rugby:saison` — organiser la saison (phases, calendrier) : en
   premier si `saison.yaml` manque ;
2. `/coach-rugby:seance` — préparer la prochaine séance ;
3. `/coach-rugby:exercices` — trouver ou adapter un exercice ;
4. `/coach-rugby:relire` puis `/coach-rugby:exporter` — faire relire une
   séance, puis obtenir sa fiche imprimable ou téléphone.

Mettre en avant la suggestion la plus utile d'après les relances.

## 5. Faire le point

Résumer en deux ou trois lignes ce qui a été fait (dossier, équipe) et
s'arrêter : chaque étape se termine par un point avec le coach. Ne pas
enchaîner sur un autre skill sans son accord.
