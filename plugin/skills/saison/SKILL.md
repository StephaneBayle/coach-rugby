---
name: saison
description: Organise la saison d'une équipe de rugby — dates, phases (reprise, aller, trêve, retour, phases finales, ou plateaux pour l'école de rugby), calendrier des matchs, plateaux et tournois, échéances importantes. Peut reprendre un calendrier copié depuis Mon Coach Assistant de la FFR.
when_to_use: Quand le coach veut cadrer ou modifier sa saison, entrer son calendrier, ajouter un match, un plateau ou un tournoi, marquer un derby, déplacer la trêve, ou colle un calendrier (texte ou capture) venant de Mon Coach Assistant, de Mon Club House ou de son comité.
argument-hint: "[équipe]"
---

# Organiser la saison

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md`,
`${CLAUDE_PLUGIN_ROOT}/references/phases-saison.md` et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md`.

- Schéma : `${CLAUDE_PLUGIN_ROOT}/schemas/saison.schema.json`
- Exemples complets :
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-m10-les-ecureuils/m10/saison.yaml`
    (école de rugby, mode `plateaux`) ;
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-seniors-f3-les-goelands/seniors-f3/saison.yaml`
    (seniors, mode `championnat`).

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

## 1. Identifier l'équipe

Prendre l'équipe citée ($ARGUMENTS) ou lancer `statut`. Si aucune équipe
n'existe, passer d'abord par `/coach-rugby:coach`. Lire `equipe.yaml` (catégories,
pratique) et `.coach-rugby.yaml` (type de structure, `utilise_mca`).

## 2. Choisir le mode

Proposer le mode par défaut, puis le faire confirmer :

- **école de rugby** (M5 à M14, M15F) → `plateaux` : pas de match sec, seulement
  des plateaux et tournois d'au moins 3 équipes (règle FFR à vérifier,
  `categories.yaml`) ;
- jeunes, seniors, féminines → `championnat` ;
- structure hors club au rythme scolaire → `scolaire`. Préciser que les relances
  propres à ce mode arrivent dans une prochaine version.

## 3. Poser les dates

1. Début et fin de saison : par défaut, du 1er juillet au 30 juin pour l'école
   de rugby, et du 1er juin au 31 mai pour un championnat.
2. Les phases du mode, **dans l'ordre, sans trou ni chevauchement** :
   - proposer des dates types, en s'inspirant des exemples ;
   - le coach corrige ;
   - une phase finit la veille du début de la suivante.
3. La zone de vacances scolaires, si le coach la connaît (`statut: perso`).

## 4. Remplir le calendrier

Trois façons de faire, au choix du coach.

**a. Le coach dicte.** Pour chaque événement, noter :

- la date ;
- le type : match, plateau, tournoi, stage, vacances, événement ;
- s'il joue à domicile ;
- l'adversaire, qui est toujours un **club** et jamais une personne ;
- le lieu, s'il le donne.

**b. Passerelle Mon Coach Assistant.** Réservée à une structure de type `club`.

- Le coach **colle le texte** ou **envoie une capture** du calendrier de Mon
  Coach Assistant ou de Mon Club House.
- En extraire date, type, adversaire (club), domicile et lieu.
- Chaque événement extrait porte `source: mca-copie` et `statut: a-verifier`.
- Les noms de personnes éventuellement présents (convocations, éducateurs,
  joueurs) ne sont **jamais recopiés** : les ajouter à `.joueurs-proteges.txt`
  s'il s'agit de joueurs.
- Ne jamais demander d'identifiants, ne jamais ouvrir le site à la place du
  coach.
- Dire que l'import automatique (`.ics`) n'est pas encore possible.

**c. Calendrier du comité ou de la ligue** (texte, PDF, capture) : même
traitement, avec `source: comite` et `statut: a-verifier`.

Ensuite, demander quelles échéances comptent le plus, et marquer
`importance: derby` ou `haute`. Ces marques déclenchent les relances
d'affûtage.

## 5. Écrire et valider

1. Écrire `<dossier>/<equipe>/saison.yaml`, avec un commentaire d'en-tête qui
   indique la source des dates.
2. Lancer `valider <dossier>/<equipe>/saison.yaml` (chemin A) ou appliquer les
   contrôles de `outillage.md` (chemin B), et corriger jusqu'à zéro erreur.
3. Ajouter une ligne datée dans `<equipe>/journal.md` : « Saison cadrée :
   mode, n événements ».

## 6. Restituer et faire le point

1. Lancer `statut <equipe>`.
2. Montrer au coach :
   - les phases dans un petit tableau ;
   - les 3 à 5 prochaines échéances ;
   - les relances, présentées comme des suggestions ;
   - le nombre d'événements « à vérifier ».
3. Proposer ensuite `/coach-rugby:seance` pour préparer la prochaine séance,
   sans l'enchaîner sans son accord.
