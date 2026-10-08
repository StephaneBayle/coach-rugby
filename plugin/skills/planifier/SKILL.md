---
name: planifier
description: Organise la saison d'une équipe de rugby en grands blocs (cycles d'environ 4 semaines) avec un thème, des objectifs et une intensité prévue, en tenant compte des matchs importants (affûtage) et, à l'école de rugby, des changements de forme de jeu au fil des mois.
when_to_use: Quand le coach veut organiser sa saison sur le long terme (« comment j'organise mes mois ? », « quels thèmes jusqu'à Noël ? », « on prépare le derby de février »), découper la saison en cycles, ou revoir ses cycles après un imprévu.
argument-hint: "[équipe]"
---

# Planifier la saison en cycles

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md`,
`${CLAUDE_PLUGIN_ROOT}/references/planification.md` (méthode) et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md`.

- Repères : `${CLAUDE_PLUGIN_ROOT}/references/planification.yaml`. Ce sont
  **des hypothèses pédagogiques, pas des prescriptions**.
- Schéma : `${CLAUDE_PLUGIN_ROOT}/schemas/cycles.schema.json`.
- Exemples :
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-seniors-f3-les-goelands/seniors-f3/cycles.yaml` ;
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-m10-les-ecureuils/m10/cycles.yaml`.

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

## 1. Vérifier le point de départ

Prendre l'équipe citée ($ARGUMENTS), sinon lancer `statut`. Il faut une
saison cadrée (`saison.yaml`). Sinon, proposer d'abord `/coach-rugby:saison`.

Si `cycles.yaml` existe déjà, on le **modifie** : on ne repart pas de zéro.

## 2. Obtenir le brouillon

- **Chemin A** : lancer `planifier <equipe>`.
- **Chemin B** : appliquer la méthode de `planification.md` à partir de
  `saison.yaml` et de `categories.yaml`.

Le brouillon découpe chaque phase en blocs d'environ 4 semaines.

- **Adultes** : un bloc d'affûtage de 7 jours se termine sur chaque match
  important ou derby.
- **École de rugby** : un bloc « Passage à une nouvelle forme de jeu » apparaît
  à chaque changement du calendrier de la FFR, même pendant la trêve.

## 3. L'adapter avec le coach

Présenter le brouillon en **une ligne par cycle** (dates, thème, intensité),
puis poser **au plus deux questions**, avec des choix proposés.

1. **Les thèmes conviennent-ils ?** Proposer des thèmes concrets d'après les
   priorités de la phase. Exemples : « jeu au sol », « défense », « soutien »,
   « plaquage en sécurité » quand la forme de jeu le permet.
2. **Un temps fort manque-t-il ?** Tournoi, stage, échéance à préparer.

**Règles :**

- Un cycle dure de 1 à 8 semaines, ne chevauche pas le suivant et reste dans
  sa phase.
- À l'école de rugby, on parle de **plaisir**, de **jeu** et de **progrès**,
  jamais d'« affûtage ».
- Le contenu d'un cycle ne dépasse jamais ce que la forme de jeu du moment
  permet (`regles <catégorie> --date <date>`).
- Pas de charge chiffrée : l'intensité est seulement **prévue** (légère,
  moyenne, forte, affûtage, récupération).

**Préparer une forme de jeu pas encore permise** (école de rugby) : tant
que la nouvelle forme n'est pas en vigueur, on prépare sans la pratiquer.
Par exemple, avant le ruck : chute avec le ballon, poser le ballon, appuis
au contact, poussée à genoux (contact progressif). On n'utilise la fiche
« Ruck éducatif progressif » qu'à partir du mois où la forme le permet ;
`valider` refuse sinon.

## 4. Écrire et valider

1. Chemin A : `planifier <equipe> --ecrire` crée `cycles.yaml` s'il n'existe
   pas. Le modifier ensuite selon les choix du coach.
2. Chemin B : écrire `<dossier>/<equipe>/cycles.yaml` sur le modèle des
   exemples.
3. Lancer `valider <dossier>/<equipe>/cycles.yaml` et corriger jusqu'à zéro
   erreur.
4. Ajouter une ligne datée dans `journal.md`.

## 5. Faire le point

Résumer les cycles en un petit tableau, en mettant en avant le cycle en
cours et le prochain changement (forme de jeu, match important). Proposer
ensuite `/coach-rugby:semaine` pour préparer la semaine qui vient, sans
l'enchaîner sans l'accord du coach.
