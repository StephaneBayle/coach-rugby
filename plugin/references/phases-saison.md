# Phases de la saison et relances

## Les trois modes

| Mode | Pour qui | Phases, dans l'ordre |
|---|---|---|
| `championnat` | jeunes (M16, M19), seniors, féminines | `intersaison-bilan` → `reprise-prepa` → `phase-aller` → `treve` → `phase-retour` → `phases-finales` |
| `plateaux` | école de rugby (M5 à M14, M15F) : pas de match sec, des plateaux et tournois | `intersaison-bilan` → `reprise-prepa` → `plateaux-automne` → `treve` → `plateaux-printemps` → `tournois-fin-saison` |
| `scolaire` | sections sportives, sport-études, pôles (structures hors club) | `intersaison-bilan`, `rentree`, `periode-scolaire`, `vacances-scolaires`, `examens`, `fin-annee` (répétables) |

Règles de cohérence (vérifiées par `valider`) :

- les phases se suivent **sans trou ni chevauchement** ;
- elles restent dans les dates de la saison ;
- seules les phases du mode choisi sont permises.

En mode `scolaire`, les phases peuvent se répéter (plusieurs
`periode-scolaire` séparées par des `vacances-scolaires`). Les relances
propres à ce mode arrivent dans une prochaine version.

## Repères par phase (hypothèses pédagogiques)

| Phase | Intention dominante |
|---|---|
| `intersaison-bilan` | Bilan de la saison passée, repos actif, préparation du projet |
| `reprise-prepa` | Accueil, remise en forme progressive, bases techniques ; école de rugby : formes de jeu de début de saison |
| `phase-aller`, `plateaux-automne` | Construire le projet de jeu, régularité, progression technique |
| `treve` | Repos, entretien léger, bilan de mi-saison |
| `phase-retour`, `plateaux-printemps` | Consolider, individualiser ; école de rugby : nouvelles formes de jeu (calendrier FFR) |
| `phases-finales`, `tournois-fin-saison` | Fraîcheur, plaisir, valorisation ; école de rugby : tournois de clubs (mai-juin) |

## Semaine de saison

La **semaine 1** commence le premier jour de `reprise-prepa` (ou de `rentree`
en mode scolaire, sinon de la première phase). La semaine *n* va du jour
`7 × (n − 1)` au jour `7 × n − 1` après ce début.

## Prochaine échéance

C'est le prochain événement du calendrier de type `match`, `plateau`,
`tournoi`, `competition-scolaire`, `stage`, `evenement` ou `examen` (les
`vacances` ne comptent pas). « J-n » = nombre de jours avant cette date.

## Relances proactives

Hypothèses pédagogiques, à présenter comme des suggestions, jamais comme des
obligations :

| Code | Quand | Message type |
|---|---|---|
| `affutage` | match ou tournoi d'importance `haute` ou `derby` à J-7 ou moins (jamais à l'école de rugby) | semaine d'affûtage ; à J-2 ou moins, séance courte d'activation |
| `logistique-plateau` | plateau ou tournoi à J-10 ou moins | groupes, rotations, transport, convocation |
| `preparer-treve` | la trêve commence dans 14 jours ou moins | message aux joueurs, programme d'entretien |
| `bilan-mi-saison` | pendant la trêve | bilan de mi-saison, préparation de la reprise |
| `premiere-seance` | phase active et aucune séance enregistrée | préparer la prochaine séance |
| `relance-seance` | phase active et dernière séance il y a plus de 10 jours | préparer la prochaine séance |
| `preparer-reprise` | pendant l'intersaison | bilan, préparation de la reprise |
| `mode-scolaire` | mode `scolaire` | relances spécifiques à venir |
| `planifier-cycles` | saison cadrée, pas de `cycles.yaml` | découper la saison en cycles |
| `preparer-semaine` | phase active, pas de plan pour la semaine en cours (ou, du vendredi au dimanche, pour la suivante) | préparer la semaine |
| `seance-a-preparer` | une séance prévue aujourd'hui ou demain n'a pas de `seance.yaml` | préparer cette séance (remplace `premiere-seance` et `relance-seance`) |
| `fin-mesocycle` | le cycle en cours (hors bloc d'affûtage) finit dans 7 jours ou moins | bilan du cycle, annonce du suivant |
| `changement-forme` | la forme de jeu change dans 35 jours ou moins (école de rugby), pour pouvoir préparer avant la trêve | préparer la progression |
| `reprise-apres-treve` | dans les 7 jours qui suivent la fin de la trêve | remonter l'intensité progressivement |
| `preparer-match` | match, plateau ou tournoi à J-3 ou moins sans `matchs/<date>/match.yaml` | convocation, composition ou rotation, fiche match (remplace `logistique-plateau`) |
| `debriefer-match` | match, plateau ou tournoi passé depuis 1 à 7 jours, sans débriefing | statistiques et débriefing (match) ou bilan (plateau), thèmes des prochaines séances |
| `absences-repetees` | un joueur de l'effectif absent aux 3 dernières dates de `presences.yaml` | prendre des nouvelles, sans demander de motif (codes ; le skill donne les prénoms au coach) |
| `point-progres` | phase active, dernière observation de `progres.yaml` il y a plus de 6 semaines | refaire un point sur deux ou trois compétences |

Les relances liées aux cycles, aux semaines, à l'effectif et aux matchs
n'apparaissent que si le dossier de l'équipe est lu (commande `statut`).

Phases actives : `reprise-prepa`, `phase-aller`, `phase-retour`,
`phases-finales`, `plateaux-automne`, `plateaux-printemps`,
`tournois-fin-saison`, `rentree`, `periode-scolaire`, `examens`.
