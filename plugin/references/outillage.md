# Outillage : chemin A (scripts) et chemin B (à la main)

Chaque skill peut travailler de deux façons :

- **Chemin A, outillé** : lancer la CLI `scripts/coach-rugby.mjs` avec Node.
  C'est plus rapide et plus fiable (validation automatique).
- **Chemin B, manuel** : appliquer soi-même les règles ci-dessous, avec les
  fichiers de `references/` et les exemples de `exemples/`. Il marche partout,
  y compris dans Cowork ou le chat, sans Node.

## Choisir le chemin

1. Essayer la commande donnée dans le SKILL.md (elle contient les bons
   chemins).
2. Si `node` est introuvable, ou si la commande sort avec le **code 3**
   (outillage indisponible) : passer au chemin B **sans inquiéter le coach**.
   Ne pas lui demander d'installer quoi que ce soit.
3. Code 1 : les données ou la commande sont en erreur ; lire le message,
   corriger, relancer.

La variable `COACH_RUGBY_OPTION_DOSSIER` transmet l'option « Dossier saison »
du plugin ; `COACH_RUGBY_DOSSIER` (prioritaire) force un dossier, et
`COACH_RUGBY_AUJOURDHUI=AAAA-MM-JJ` fixe la date du jour.

## Dossier saison

Résolution, dans l'ordre : `COACH_RUGBY_DOSSIER` ; le dossier de travail
courant s'il contient `.coach-rugby.yaml` (cas de Cowork) ; l'option du
plugin ; `~/Rugby-Saisons`.

## `init` — créer le dossier saison

- **A** : `coach-rugby.mjs init [--structure <type>] [--nom <nom>]`
- **B** : créer le dossier, puis, **sans rien écraser** :
  - `.coach-rugby.yaml` sur le modèle de
    `exemples/fictif-m10-les-ecureuils/.coach-rugby.yaml` (types de structure
    et libellés : `schemas/config.schema.json`) ;
  - `.joueurs-proteges.txt` : copie de `gabarits/joueurs-proteges.exemple.txt` ;
  - le dossier `_bibliotheque-perso/exercices/`.
  - Vérifier que le dossier n'est **pas dans un dépôt git** (pas de `.git` dans
    un dossier parent) ; sinon prévenir le coach.

## `statut` — où en est l'équipe

- **A** : `coach-rugby.mjs statut [<equipe>] [--json]`
- **B** : lire `<equipe>/equipe.yaml` et `<equipe>/saison.yaml`, puis :
  - **phase** : celle dont `debut ≤ aujourd'hui ≤ fin` ;
  - **semaine**, **prochaine échéance**, **J-n** et **relances** : règles de
    `phases-saison.md` ;
  - **avancement** : `equipe.yaml` ✓, `saison.yaml` ✓, au moins une
    `seances/<date>/seance.yaml` ✓, une `relecture.md` ✓,
    une `exports/fiche-a4.html` ✓ ;
  - **règles du moment** : voir `regles` ci-dessous.

## `valider` — vérifier un fichier ou un dossier

- **A** : `coach-rugby.mjs valider <fichier|dossier>`
- **B** : relire le fichier contre son schéma (`schemas/<type>.schema.json`)
  et son exemple ; vérifier en plus :
  - `equipe.yaml` : `id` = nom du dossier de l'équipe ;
  - `saison.yaml` : phases du mode choisi, dans l'ordre, sans trou ni
    chevauchement, dans les dates de la saison ; événements dans la saison ;
  - dates au format `AAAA-MM-JJ` ; aucun nom de joueur.

## `regles` — ce qui est permis à une date

- **A** : `coach-rugby.mjs regles <categorie[,categorie…]> [--pratique <p>] [--date AAAA-MM-JJ]`
- **B** : dans `categories.yaml` :
  1. prendre la catégorie **la plus jeune** du groupe (champ `ordre` le plus
     petit) ;
  2. dans `calendrier_formes.valeur`, trouver la ligne dont `mois` contient le
     mois de la date ;
  3. hors école de rugby, garder la forme qui correspond à la pratique
     (`xv` → `xv`, `x` → `x`, `7` → `sevens`, `5` et `loisir` → `rugby-a-5`) ;
  4. lire dans `formes` le `contact_max` (prendre le plus élevé si plusieurs
     formes sont permises) et les permissions plaquage, mêlée, touche, ruck ;
  5. citer la source, la page et le statut ; si le statut n'est pas
     `verifie`, écrire « à vérifier (saison 2026-2027) ».

## `effectif` — joueurs en codes

- **A** : `coach-rugby.mjs effectif <equipe> [--ajouter N] [--prenoms]`
- **B** :
  - écrire `<equipe>/effectif.yaml` : une ligne par joueur, avec un `code`
    (J01, J02…), un `disponible` (oui ou non, sans motif) et les `postes` si
    le coach les donne ;
  - les prénoms vont **seulement** dans `<equipe>/.prenoms.yaml`
    (`J01: Prénom`), puis on les ajoute à `.joueurs-proteges.txt`.

## `presences` — qui était là

- **A** : `coach-rugby.mjs presences <equipe> --date AAAA-MM-JJ --presents J01,J02 [--excuses J05]`,
  ou `--bilan` pour les taux et les absences répétées.
- **B** : ajouter dans `<equipe>/presences.yaml` une entrée par date, avec
  les codes des présents et des excusés. Un code ne peut pas être à la fois
  présent et excusé.

## `rotation` — temps de jeu équitable

- **A** : `coach-rugby.mjs rotation <match.yaml> [--periode 5] [--ecrire]`
- **B** :
  1. découper la durée en périodes de 5 minutes, rencontre par rencontre ;
  2. à chaque période, faire entrer les joueurs qui ont **le moins joué** ;
     à égalité, celui qui sort du banc ;
  3. vérifier que chaque période a exactement le nombre de joueurs de la
     forme de jeu, et qu'entre deux enfants l'écart ne dépasse pas une
     période ;
  4. compter l'**attente la plus longue** sur le banc et l'annoncer. Avec
     plus de deux fois plus de joueurs que de places, certains attendent
     forcément deux périodes de suite : ne jamais promettre le contraire.
     Si chacun joue moins de la moitié du temps, l'écrire dans la cible
     (« non atteinte ici »).

  C'est un repère d'équité (hypothèse pédagogique), pas une règle de la
  FFR.

## `exporter` un match ou une feuille de présence

- **A** : `coach-rugby.mjs exporter <equipe>/matchs/<date>/match.yaml [--pdf]`
  produit `fiche-match-a4.html` et `fiche-match-telephone.html` ;
  `coach-rugby.mjs exporter <equipe>/effectif.yaml [--pdf]` produit
  `exports/feuille-presence-a4.html`.
- **B** : écrire la fiche à la main, en codes, à partir de
  `gabarits/fiche-match.html` : préparation, composition (n°, code,
  poste), grille de rotation (une ligne par code, une colonne par période,
  ● sur le terrain), sécurité, après le match. Toujours rappeler que la
  feuille officielle est la FDM EDR (école de rugby) ou Oval-e. Pour la
  feuille de présence : un tableau « Code | Prénom (vide) | 8 dates ».

## `tableau` — présences, temps de jeu, progrès

- **A** : `coach-rugby.mjs tableau presences|temps-de-jeu|progres <equipe> [--match AAAA-MM-JJ] [--format xlsx|csv]`.
  Le CSV est toujours produit ; l'Excel (`.xlsx`) aussi, sauf avec
  `--format csv` ou si l'outillage manque.
- **B** : écrire un CSV (séparateur « ; », une ligne d'en-tête) :
  - présences : `Code;Prénom (à remplir à la main);<date 1>;…;Présences;Taux %`,
    avec `P` (présent), `E` (excusé) ou rien (absent) ;
  - temps de jeu : `Code;Prénom (à remplir à la main);Minutes;% du temps`,
    d'après les périodes de `match.yaml` ;
  - progrès : `Code;Prénom (à remplir à la main);<compétence>;…`, avec la
    dernière observation (à travailler, en cours, acquis).

  La colonne « Prénom » reste **vide** : jamais de prénom dans un fichier.

## `charge` — charge réalisée

- **A** : `coach-rugby.mjs charge <equipe> --date AAAA-MM-JJ --duree N --rpe N [--type seance|match|salle|autre] [--par-code J01=7,J02=6]`,
  ou `--bilan [--date]`.
- **B** :
  - ajouter dans `<equipe>/charge.yaml` une entrée par séance ou par match :
    date, type, durée réelle en minutes, intensité ressentie moyenne du
    groupe de 0 à 10 (`rpe_groupe`) ; RPE par code seulement pour les
    catégories « individuel » de `references/parametres-charge.yaml` ;
  - charge = RPE × durée ; semaine = somme du lundi au dimanche ;
  - tendance : comparer à la moyenne des 4 semaines précédentes qui ont des
    entrées (au moins 3) ; au-delà de +30 %, repère pour envisager
    d'alléger ;
  - monotonie : moyenne des 7 jours (0 les jours sans séance) divisée par
    leur écart-type.

  Pas de RPE à l'école de rugby. Jamais de commentaire, de douleur ni de
  sommeil dans ce fichier.
