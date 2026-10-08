---
name: seance
description: Conçoit une séance d'entraînement de rugby adaptée à la catégorie, au nombre de joueurs présents, à la durée, au matériel, au moment de la saison et à la prochaine échéance, en respectant les règles de jeu du mois. Peut partir du résultat d'un sondage de présence Mon Coach Assistant collé par le coach (seul le nombre est gardé).
when_to_use: Quand le coach veut préparer un entraînement (« prépare la séance de mercredi », « j'aurai 14 enfants et 2 éducateurs », « séance de 90 minutes avant le derby »), refaire ou modifier une séance, ou colle un résultat de sondage de présence.
argument-hint: "[équipe] [date]"
---

# Concevoir une séance

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md` et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md`.

- Schéma : `${CLAUDE_PLUGIN_ROOT}/schemas/seance.schema.json`
- Exemple complet : `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-m10-les-ecureuils/m10/seances/2026-10-14/seance.yaml`
- Exercices : `${CLAUDE_PLUGIN_ROOT}/bibliotheque/INDEX.md` et la bibliothèque
  personnelle `<dossier saison>/_bibliotheque-perso/exercices/`.

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

## 1. Situer la séance

1. Prendre l'équipe et la date citées ($ARGUMENTS). Par défaut, la date est
   le prochain créneau de `equipe.yaml`. Sans équipe, passer par
   `/coach-rugby:coach`.
2. Lancer `statut <equipe> --date <date>` pour connaître la phase, la semaine,
   la prochaine échéance (J-n) et les relances.
3. **Plan de la semaine** : si `<equipe>/semaines/<lundi>/semaine.yaml`
   couvre la date, en reprendre la séance prévue (intention, intensité,
   dominante). Renseigner alors `semaine: <lundi>` et `intensite_prevue` dans
   la séance, et respecter cette intensité : pas de contenu fatigant pour une
   séance d'activation ou de récupération.
4. Lancer `regles <catégories du groupe> --pratique <pratique> --date <date>`
   pour connaître les formes de jeu, le **contact maximal** et les
   permissions (plaquage, mêlée, touche, ruck), pour la catégorie la plus
   jeune. Au chemin B, appliquer la méthode de `outillage.md`.

## 2. Recueillir l'essentiel

Poser **au plus trois questions**, avec des valeurs par défaut proposées :

1. **Combien de joueurs** et **combien d'encadrants**. Par défaut,
   `effectif_habituel` et le staff de `equipe.yaml`.
   - **Sondage Mon Coach Assistant** (clubs) : si le coach colle le résultat
     d'un sondage de présence, compter les présents et les encadrants, puis
     **ne garder que les nombres** (`source_effectif: sondage-mca`). Ne
     recopier aucun nom, ajouter les noms de joueurs à `.joueurs-proteges.txt`
     et le dire au coach en une phrase.
2. **Durée et terrain**. Par défaut, le créneau ; sinon
   `duree_seance_conseillee_min` de la catégorie, qui est une hypothèse.
3. **Ce qu'il veut travailler**, si les objectifs de la phase et l'échéance
   ne suffisent pas à le deviner.

## 3. Fixer 1 à 3 objectifs

Les tirer des objectifs de la phase (`saison.yaml`), de la prochaine échéance
et des relances. Par exemple : affûtage à J-2, logistique et plaisir avant un
plateau. Un objectif s'écrit en une phrase simple, avec son domaine (technique,
tactique, physique, mental, valeurs).

## 4. Construire les blocs

**Ordre :** accueil, échauffement, corps de séance (une ou deux situations),
jeu, retour au calme, bilan.

- À l'école de rugby (M8-M12), s'inspirer du plan de séance de la FFR (règle
  transverse `plan-de-seance-ffr-edr` de `categories.yaml`).
- L'échauffement et le retour au calme sont obligatoires.

**Choix des exercices :**

- dans la bibliothèque, avec des fiches **compatibles avec les règles du jour**
  : le `contact` ne dépasse pas le maximum et les `exige` sont permis ;
- une fiche hors règles n'est jamais utilisée telle quelle. En proposer une
  variante permise, au toucher par exemple.

**Adapter chaque bloc** :

- à l'effectif : nombre d'ateliers, groupes, rotations, un éducateur par
  atelier si possible ;
- à l'espace et au matériel ;
- au niveau, en jouant sur les `variables`.

Noter l'adaptation dans `adaptations`.

**Durées :**

- la somme des blocs est égale à la durée de la séance ;
- on garde du temps de jeu ;
- on prévoit une pause d'hydratation.

**Sécurité :** chaque bloc a au moins un point de sécurité. Pour un bloc avec
contact, rappeler la conduite à tenir en cas de choc à la tête. Le
protège-dents est fortement recommandé en 2026-2027.

Ajouter les **points de vigilance** (fatigue avant une échéance, chaleur,
reprise) et les **hypothèses** (choix non sourcés). Citer les **sources**
(`sources.yaml`).

## 5. Écrire et valider

1. Écrire `<dossier>/<equipe>/seances/<AAAA-MM-JJ>/seance.yaml` sur le modèle
   de l'exemple. `regles` reprend la sortie de la commande `regles`.
2. Lancer `valider <fichier>`. Le contrôle recalcule les règles du jour et
   refuse un bloc trop dur pour la catégorie, une durée incohérente ou
   l'absence d'échauffement. Corriger jusqu'à zéro erreur.
3. Les listes YAML entre crochets ne supportent pas les virgules à l'intérieur
   d'un élément : mettre l'élément entre guillemets.

## 6. Présenter et faire le point

1. Montrer la séance en version courte :
   - la frise, avec heure, durée et contenu ;
   - les objectifs ;
   - les règles du jour, « à vérifier » si leur statut l'exige ;
   - les deux ou trois points de sécurité clés.
2. Ajouter une ligne datée dans `journal.md`.
3. Proposer `/coach-rugby:relire`, puis `/coach-rugby:exporter`, sans les
   enchaîner sans l'accord du coach.
4. Après la séance, proposer de noter le bilan : nombre de présents,
   ressenti, choses à reprendre.
