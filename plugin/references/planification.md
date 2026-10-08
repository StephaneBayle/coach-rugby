# Planifier la saison : cycles et semaines

Tout ce qui suit est fait d'**hypothèses pédagogiques**. Ce sont des points de
départ raisonnables, que le coach adapte, et jamais des prescriptions. Les
valeurs sont dans `planification.yaml`.

Sources :

- principes de périodisation : `bompa-haff-2009`, à vérifier ;
- école de rugby : cycles d'initiation M6-M8 et séances atelier de la FFR
  (`ffr-formation-edr`), auxquels on renvoie sans les reproduire.

La charge **mesurée** (RPE) arrive avec le lot 4. Ici, l'intensité est
seulement **prévue**.

## Trois niveaux

| Niveau | Fichier | Contenu |
|---|---|---|
| Saison (macrocycle) | `cycles.yaml`, `macrocycle` | une intention et des priorités par phase |
| Cycles (mésocycles) | `cycles.yaml`, `mesocycles` | des blocs d'environ 4 semaines (de 1 à 8) avec un thème, 1 à 3 objectifs, une intensité prévue et un nombre de séances par semaine |
| Semaine (microcycle) | `semaines/<lundi>/semaine.yaml` | les séances prévues : date, J-n, intensité, intention, dominante ; les échéances et les points de vigilance |

Intensités prévues : `recuperation`, `legere`, `moyenne`, `forte` et
`affutage`. Le mot « affûtage » n'est **jamais** employé à l'école de rugby :
on parle de **séance plaisir avant le plateau** (`legere`).

## Découper la saison (brouillon `planifier`)

1. Chaque phase a ses repères dans `planification.yaml`, selon le public :
   `edr` pour l'école de rugby en mode plateaux, `adultes` pour les autres.
   L'intersaison n'a pas de cycle.
2. **Adultes** : un bloc d'affûtage de 7 jours se termine sur chaque match
   `haute` ou `derby`.
3. On découpe le reste en blocs d'environ 28 jours. Un bout de moins de
   7 jours rejoint son voisin.
4. **Changement de forme de jeu** (école de rugby) : quand la forme de jeu au
   milieu d'un bloc diffère de celle du bloc actif précédent, d'après
   `categories.yaml`, le bloc devient « Passage à une nouvelle forme de jeu ».
   Il en va de même quand le changement tombe pendant la trêve. Exemples pour
   la saison 2026-2027, à vérifier : M8 en janvier, M10 en octobre puis en
   janvier, M12 en octobre puis en décembre, M14 en octobre.

**Chemin B** : appliquer ces règles à la main à partir de `saison.yaml` et de
`categories.yaml`.

## Construire la semaine (brouillon `semaine`)

Pour chaque créneau d'`equipe.yaml` de la semaine :

1. calculer **J-n** jusqu'à la prochaine échéance (match, plateau, tournoi…)
   et **J+n** depuis le dernier match ;
2. appliquer la première règle de la grille qui convient (`grille_semaine`) :

| Public | Règle | Intensité | Intention |
|---|---|---|---|
| Adultes | J+1 ou J+2 après un match | récupération | jeu à faible intensité, retour sur le match |
| Adultes | J-1 ou J-2 avant une échéance | affûtage | activation : rappels courts, lancements, vitesse |
| Adultes | J-3 ou J-4 | forte | travail principal, intensité de match |
| Adultes | sinon | moyenne | apprentissages du cycle, volume modéré |
| École de rugby | J-1 ou J-2 avant un plateau | légère | séance plaisir : jeux connus, réussite |
| École de rugby | sinon | moyenne | progression par le jeu |

- Dans un **bloc d'affûtage**, la dernière séance avant le match important
   devient une séance d'activation, quel que soit son J-n.
- Pendant la trêve et les vacances, aucune séance n'est prévue.

## Contrôles (`valider`)

- **Cycles** : dans la saison, sans chevauchement, 8 semaines au plus,
  compris dans une phase du même nom.
- **Semaine** : `debut` est un lundi, les séances tombent dans la semaine, le
  mésocycle existe.
- **Sécurité** : aucune séance `moyenne` ou `forte` à J-2 ou moins d'une
  échéance `haute` ou `derby`.
- **École de rugby** : pas d'intensité `affutage`.
