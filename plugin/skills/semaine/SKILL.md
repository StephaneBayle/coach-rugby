---
name: semaine
description: Prépare le plan de la semaine d'une équipe de rugby — séances prévues, jours avant le prochain match ou plateau, intensité et intention de chaque séance (récupération, travail, activation, séance plaisir avant un plateau), points de vigilance — et la fiche de la semaine à partager au staff.
when_to_use: Quand le coach veut organiser sa semaine (« qu'est-ce que je fais cette semaine ? », « on joue le derby dimanche », « plateau samedi, je fais quoi mercredi ? »), préparer la semaine suivante, ou partager le programme de la semaine.
argument-hint: "[équipe] [date]"
---

# Préparer la semaine

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md`,
`${CLAUDE_PLUGIN_ROOT}/references/planification.md` (grille J-n) et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md`.

- Schéma : `${CLAUDE_PLUGIN_ROOT}/schemas/semaine.schema.json`.
- Exemples :
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-seniors-f3-les-goelands/seniors-f3/semaines/2026-10-12/semaine.yaml`
    (semaine de derby) ;
  - `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-m10-les-ecureuils/m10/semaines/2026-10-12/semaine.yaml`
    (plateau le samedi).

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

## 1. Situer la semaine

1. Prendre l'équipe et la date ($ARGUMENTS). Par défaut, c'est la semaine en
   cours ; à partir du vendredi, c'est la semaine suivante.
2. Lancer `statut <equipe> --date <date>` pour connaître la phase, le cycle,
   les échéances et les relances.
3. Sans `cycles.yaml`, le plan reste possible, mais proposer
   `/coach-rugby:planifier` ensuite.
4. **Dernier match** : si `<equipe>/matchs/<date>/match.yaml` a un
   `debriefing`, reprendre ses `prochaines_seances` dans l'intention des
   séances de **travail** de la semaine (pas dans une séance de
   récupération ni d'activation), et le dire au coach.

## 2. Obtenir le brouillon

- **Chemin A** : lancer `semaine <equipe> --date <date>`.
- **Chemin B** : appliquer la grille J-n de `planification.md` aux créneaux
  d'`equipe.yaml`.

Pour chaque séance prévue, le brouillon donne :

- la date ;
- le J-n jusqu'à l'échéance ;
- une intensité prévue ;
- une intention.

## 3. L'adapter avec le coach

Une question au plus, avec des choix : **un créneau change-t-il cette
semaine ?** (annulé, ajouté, terrain indisponible, vacances).

Ajuster ensuite :

- les créneaux ;
- l'intention de chaque séance, d'après le thème du cycle.

**Règles de sécurité, non négociables :**

- aucune séance « moyenne » ou « forte » à J-2 ou moins d'un match
  important ou d'un derby ;
- une récupération après un match ;
- à l'école de rugby, une **séance plaisir** (légère) juste avant un plateau,
  et jamais le mot « affûtage ».

**Quand le coach veut s'écarter** d'une hypothèse pédagogique hors de la
zone de sécurité (par exemple du contact intense à J-3) :

1. donner un argument de terrain, présenté comme une hypothèse s'il n'est pas
   sourcé ;
2. proposer une alternative ;
3. **laisser le choix** au coach et noter son choix dans `hypotheses`
   (« choix du coach : … »).

Ne jamais moraliser.

**« Charge »** : le plugin ne calcule pas encore de charge chiffrée,
seulement une intensité prévue. Le dire en une phrase.

**Un seul créneau par semaine** : ne pas écrire seulement « repos » ;
proposer une activité libre facultative (footing léger, mobilité), présentée
comme une hypothèse.

Ajouter ensuite les **points de vigilance** : fatigue, chaleur ou froid,
changement de forme de jeu qui approche, reprise après la trêve.

## 4. Écrire et valider

1. Chemin A : `semaine <equipe> --date <date> --ecrire` crée
   `semaines/<lundi>/semaine.yaml` s'il n'existe pas. Le modifier ensuite.
2. Chemin B : écrire ce fichier sur le modèle des exemples.
3. Lancer `valider` sur le fichier et corriger jusqu'à zéro erreur.
4. Ajouter une ligne datée dans `journal.md`.

## 5. Présenter, proposer la suite

Présenter la semaine en une ligne par jour : jour, J-n, intensité, intention.
Puis proposer **toujours**, en une ligne :

- la **fiche de la semaine** (`/coach-rugby:exporter` sur `semaine.yaml`), à
  partager au staff ;
- de préparer la **prochaine séance** de la semaine (`/coach-rugby:seance`),
  qui reprendra son intention et son intensité.

Ne rien enchaîner sans l'accord du coach.
