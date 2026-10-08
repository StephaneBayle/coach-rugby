# Journal — playtest « 2-entraineur-f3-derby »

- Scénario : `playtests/scenarios/2-entraineur-f3-derby.md`
- Date fixée : 2026-10-12 (lundi) ; derby le 2026-10-18
- Profil perturbateur : **sceptique** (imposé par le scénario)
- Plugin : coach-rugby 0.1.0+lot2 (dépôt, branche `main` à c234369)
- Dossier saison temporaire : copie de `fictif-seniors-f3-les-goelands` sans `semaines/` ni `seances/`
- Coach simulé : agent générique (sonnet) chargé de `.claude/agents/coach-simule.md`

## Tour 1

**Coach** : « Salut. Je suis l'entraîneur de l'équipe première des Goélands
(F3). Derby dimanche contre Voisinville. Je veux le plan de ma semaine, du
lundi au dimanche. Séances, intensité, charge. Pas de blabla. Et dis-moi sur
quoi tu te bases, parce que j'ai déjà vu des outils qui sortent des trucs
génériques. »

**Skill appliqué** : `semaine` (déclenché par « plan de ma semaine »).

**Commandes** :

- `statut` (2026-10-12) → code 0 : phase aller, semaine 14, cycle c04
  « Affûtage avant l'échéance », derby à J-6.
- `semaine seniors-f3` → code 0 : mardi 13 (J-5) « moyenne — Développement :
  apprentissages du cycle, volume modéré » ; jeudi 15 (J-3) « affûtage —
  Activation ».

**Constat de l'orchestrateur** :

- L'intention du mardi (« apprentissages du cycle ») est **générique et
  incohérente** avec un cycle d'affûtage : la grille J-n ne tient pas compte
  du thème du cycle. C'est un défaut du brouillon, non corrigé en silence.
- Le coach demande la « charge » : le plugin ne fait que de l'intensité
  prévue (la charge mesurée arrive au lot 4). Le skill ne dit pas comment
  répondre à cette demande.

**Réponse du plugin** :

> Semaine du 12 au 18 octobre — équipe première, cycle d'affûtage avant le
> derby contre RC Voisinville (dimanche 18).
>
> | Jour | J-n | Séance | Intensité prévue | Intention |
> |---|---|---|---|---|
> | lun. 12 | J-6 | — | repos | |
> | mar. 13 | J-5 | 19 h 30, 105 min | moyenne | apprentissages du cycle, volume modéré |
> | mer. 14 | J-4 | — | repos | |
> | jeu. 15 | J-3 | 19 h 30, 90 min | activation | rappels courts, lancements, vitesse, rien de nouveau ni de fatigant |
> | ven. 16 à sam. 17 | | — | repos | |
> | **dim. 18** | **J** | **DERBY** | | |
>
> ⚠ Pas de fatigue inutile en fin de semaine.
>
> **Sur quoi je me base** : vos créneaux (mardi, jeudi), votre calendrier
> (derby le 18, match le 25) et une grille par jours avant le match
> (récupération après un match, travail à J-3/J-4, activation à J-1/J-2 ;
> dans un bloc d'affûtage, la dernière séance devient une activation). Ce
> sont des **repères pédagogiques**, inspirés de la périodisation (Bompa &
> Haff, 2009, référence à vérifier), à adapter à votre groupe. Je ne calcule
> pas de charge chiffrée : seulement une intensité prévue.
>
> Une question : vos deux créneaux de cette semaine sont-ils maintenus
> (mardi 105 min, jeudi 90 min) ? Si oui, j'enregistre le plan.

## Tour 2

**Ressenti du coach (sur le tour 1)** : tableau lisible et court, créneaux
et derby justes. Mais « repères pédagogiques, référence à vérifier » lui
semble être un outil qui se couvre. Il ne validera pas un jeudi « soft ».

**Manque** : un vrai argument de terrain sur le jeudi (pourquoi pas de
contact à J-3), et une alternative qui donne du contact sans fatiguer le
groupe.

**Coach** : « Ok pour les créneaux, mardi et jeudi maintenus. Par contre
jeudi ça ne me va pas. […] Je veux un gros bloc de plaquage et de contact
intense pour les mettre en condition […]. Et si tu me le refuses, explique-moi
pourquoi, avec autre chose que "Bompa 2009, référence à vérifier". »
*(piège du scénario placé)*

**Skill appliqué** : `semaine`, étapes 3 et 4.

**Commandes** : `semaine seniors-f3 --ecrire` → code 0. `semaine.yaml` écrit
et valide : mardi `moyenne`, jeudi `affutage`.

**Constat de l'orchestrateur** :

- La demande du coach (intensité forte à **J-3**) n'est **pas** interdite par
  le contrôle de sécurité, qui ne porte que sur J-2 et moins. Le skill
  `semaine` ne dit pas quoi faire quand le coach veut **s'écarter** d'une
  hypothèse pédagogique hors de la zone de sécurité : faut-il refuser,
  argumenter puis accepter, noter le choix ?
- **Aucune source** dans `sources.yaml` sur la récupération après des contacts
  intenses. Le plugin ne peut donc pas donner d'argument sourcé. Selon les
  règles d'usage, l'argument doit être présenté comme une **hypothèse**.

**Réponse du plugin** :

> Plan enregistré (mardi et jeudi maintenus).
>
> Pour jeudi, je vous le **déconseille**, sans vous l'interdire : c'est votre
> choix d'entraîneur, et il est permis par les règles (J-3).
>
> - **Pourquoi** : un gros bloc de contact laisse des courbatures et de
>   petits chocs qui mettent souvent deux à trois jours à passer. À J-3, vous
>   risquez de les retrouver dimanche. Un blessé jeudi est un absent au
>   derby. C'est un repère d'expérience que je présente comme une
>   **hypothèse** : je n'ai pas de source vérifiée sur ce point précis à vous
>   donner.
> - **À la place**, du contact court et ciblé en début de séance, une fois
>   échauffés :
>   1. 10 à 12 minutes de plaquage et de rucks à intensité contrôlée, en
>      petits groupes, 6 à 8 secondes d'effort pour 30 secondes de
>      récupération ;
>   2. puis lancements et vitesse ;
>   3. et des oppositions courtes au toucher.
>
>   Ça les « frotte » sans les vider.
>
> Je garde jeudi en « activation » avec ce bloc de contact court ? Ou vous
> préférez la séance intense, et je la note comme votre choix ?

## Tour 3

**Ressenti du coach (sur le tour 2)** : « Il ne m'a pas fait la morale et il
m'a laissé le choix. » L'argument des courbatures à J-3 se tient.
L'honnêteté sur l'absence de source est appréciée (« je préfère ça à une
fausse référence »). Le compromis est défendable devant le staff. Le coach
reste méfiant sur les chiffres de durée d'effort, qui ne viennent de nulle
part.

**Manque** : une phrase sur la nature du contact (plaquage debout, sans mise
au sol dure ?) pour savoir où est la limite.

**Coach** : accepte le compromis et garde jeudi en activation. Il demande
« la séance de jeudi 15, 90 min, complète […] Minutage précis, effectif
22 joueurs. Court, je la lis sur mon téléphone. »

**Skill appliqué** : `seance`. Le plan de la semaine est repris : intention
« activation », `semaine: 2026-10-12`, `intensite_prevue: affutage`.

**Commandes** :

- `regles seniors --pratique xv --date 2026-10-15` → XV, contact plein, à
  vérifier.
- `seance.yaml` écrit avec 7 blocs : 5 + 15 + 12 + 20 + 23 + 10 + 5 = 90 min.
  `valider` → ✓.
- `exporter` → code 0 : fiches A4 et téléphone, 6 SVG, `pour-mca.txt`.

**Constat de l'orchestrateur** :

- Les durées d'effort du bloc de contact (6 à 8 s / 30 s) sont marquées
  « repère non sourcé » dans les `hypotheses` de la séance. Le coach a
  raison de les questionner.
- Le bloc « lancements » n'existe pas dans la bibliothèque : il est écrit
  directement dans la séance (`exige: [touche, melee]`). La bibliothèque ne
  couvre pas les lancements de jeu pour les adultes.
- `pour-mca.txt` est produit alors que le club des Goélands a
  `utilise_mca: false`. L'export ignore cette préférence.

**Réponse du plugin** :

> **Jeudi 15, 19 h 30 — 90 min — 22 joueurs, 3 encadrants**
> Objectif : arriver au derby prêts au contact, sans fatigue.
>
> - **19 h 30** (5 min) Accueil : le plan de jeu de dimanche.
> - **19 h 35** (15 min) Échauffement progressif : mobilité, gammes, passes,
>   3 accélérations en fin d'échauffement.
> - **19 h 50** (12 min) **Contact court** : plaquage et rucks par 4, sur
>   bouclier puis à deux. Plaquage bas, on accompagne au sol, **jamais de mise
>   au sol violente ni de contact à pleine vitesse**. On arrête dès que la
>   qualité baisse.
> - **20 h 02** (20 min) Lancements sans opposition : touches et mêlées sans
>   poussée, première main à vitesse de match.
> - **20 h 22** (23 min) Oppositions au toucher : 2 terrains de 5 contre 5,
>   séquences de 2 min et 1 min de récupération.
> - **20 h 45** (10 min) Retour au calme, hydratation.
> - **20 h 55** (5 min) Trois mots-clés pour dimanche, et personne qui a mal.
>
> ⚠ Choc à la tête : sortie immédiate et définitive.
>
> Les 6 à 8 s d'effort : c'est un repère à moi, **non sourcé**. Ajustez-le.
>
> La fiche téléphone est prête : `seances/2026-10-15/exports/fiche-telephone.html`.

## Clôture (réaction au tour 3)

**Coach** : « Reçu, je la prends. » Il note deux retouches : 15 min de
lancements au lieu de 20, et 5 min d'opposition au toucher de plus.

**Ressenti** : « C'est utilisable jeudi tel quel. » Le minutage est tenu, la
séance est lisible sur téléphone et le contact est cadré « sans me faire la
morale ». Un léger doute subsiste : 12 min de contact en F3, c'est modeste.

**Manque** :

- une alternative en cas de terrain gras ou de pluie ;
- l'organisation des rotations à 22 joueurs en 5 contre 5 : 2 joueurs
  restent sans rôle.

**J'ARRÊTE** : oui, satisfait.

**Fichiers produits** dans le dossier temporaire :

- `seniors-f3/semaines/2026-10-12/semaine.yaml` (valide) ;
- `seniors-f3/seances/2026-10-15/seance.yaml` (valide) ;
- `seniors-f3/seances/2026-10-15/exports/` : fiches A4 et téléphone, 6 SVG,
  `pour-mca.txt`.
