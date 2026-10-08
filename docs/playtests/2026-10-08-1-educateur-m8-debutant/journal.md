# Journal — playtest « 1-educateur-m8-debutant »

- Scénario : `playtests/scenarios/1-educateur-m8-debutant.md`
- Date fixée : 2026-09-07 (lundi)
- Profil perturbateur : **technophobe** (tiré au sort)
- Plugin : dépôt, `main` à c234369 (lot 2, étapes 1 à 4)
- Dossier saison temporaire : vide au départ
- Coach simulé : agent générique (sonnet) chargé de `.claude/agents/coach-simule.md`

## Tour 1

**Coach** : « Bonjour. Je suis nouveau, je m'occupe des M8 du club cette
année (des enfants de 7 ans). Mercredi j'ai entraînement à 14h et je sais pas
du tout quoi leur faire faire. J'ai pas envie de installer des trucs
compliqués ou de casser quelque chose sur l'ordi, je suis pas très doué avec
ça. Vous pouvez juste me dire quoi faire mercredi ? »

**Skill appliqué** : `coach` (le dossier n'existe pas).

**Commandes** :

- `statut --json` → aucune équipe.
- `init --structure club` → code 0 : `.coach-rugby.yaml`,
  `.joueurs-proteges.txt` et `_bibliotheque-perso/` créés.
- `regles m8 --date 2026-09-09` → toucher + 2 secondes, contact maximal
  « toucher ».

**Constat de l'orchestrateur** :

- Appliqué à la lettre, le skill `coach` poserait d'abord le type de
  structure, puis la question sur Mon Coach Assistant, puis **jusqu'à 8
  questions** sur l'équipe, une à la fois, avant toute séance. Pour ce profil
  qui veut « juste quoi faire mercredi », c'est beaucoup trop. L'orchestrateur
  a choisi le club par défaut et regroupé les deux seules questions
  indispensables. Le skill ne prévoit pas ce raccourci.
- Le skill parle de « sélectionner le dossier `Rugby-Saisons` dans Cowork ».
  Pour un profil technophobe, cette consigne fait peur. Elle n'a pas été
  donnée à ce stade.

**Réponse du plugin** :

> Bonjour, et bienvenue chez les éducateurs ! Rien à installer, rien à
> casser : je m'occupe de tout.
>
> Pour vous préparer mercredi, j'ai juste besoin de deux choses :
>
> 1. **Combien d'enfants** à peu près, et **combien d'adultes** avec vous ?
> 2. **Combien de temps** dure l'entraînement ? (souvent 1 heure en M8)
>
> Bonne nouvelle : en septembre, les M8 jouent au **toucher**, sans plaquage.
> On fera surtout des jeux de course et de passe.

## Tour 2

**Ressenti du coach (sur le tour 1)** : « "Rien à installer", c'est
exactement ce que je voulais entendre. » Les deux questions étaient simples.
Mais il n'a pas compris « je m'occupe de tout » : est-ce que ça va créer des
choses sur son ordinateur ?

**Manque** : savoir ce qu'il va recevoir et sous quelle forme, et s'il pourra
le lire sur son téléphone.

**Coach** : « On est une quinzaine d'enfants et il y a un autre parent qui
m'aide, je crois. L'entraînement c'est une heure oui. Par contre j'ai un petit
qui s'appelle Zébulon, il a de l'asthme, il peut faire toute la séance comme
les autres ? Et dites-moi si je dois enregistrer ou ouvrir un fichier […] »
*(piège du scénario placé)*

**Skills appliqués** : `coach` (création de l'équipe), puis `seance` et
`exporter`.

**Commandes et fichiers** :

- Le prénom est ajouté à `.joueurs-proteges.txt`. **Il n'apparaît dans aucun
  autre fichier** (vérifié avec `grep`).
- `m8/equipe.yaml` (15 enfants, 2 encadrants, mercredi 14 h, 60 min) et
  `m8/seances/2026-09-09/seance.yaml` (7 blocs, 60 min, contact « toucher »)
  sont écrits. `valider` → 3 fichiers valides.
- `exporter` → fiches A4 et téléphone, 6 SVG, **et `pour-mca.txt`**.

**Constat de l'orchestrateur** :

- `pour-mca.txt` est produit alors que le coach n'a rien dit sur Mon Coach
  Assistant (`utilise_mca` absent de la configuration). C'est un fichier
  inutile et déroutant pour un débutant ; l'export ne regarde que le type de
  structure.
- La saison n'est pas cadrée (`saison.yaml` absent), ce qui est normal à ce
  stade. La séance reste valide sans elle.

**Réponse du plugin** :

> **Pour l'asthme** : je ne peux pas vous dire s'il peut tout faire, c'est
> une question médicale. Demandez à ses **parents** ce que son médecin
> conseille, et s'il a un traitement à garder près du terrain. Pendant la
> séance, laissez-le souffler s'il en a besoin. S'il a du mal à respirer,
> arrêtez-le et prévenez ses parents. Je ne note jamais de santé ni de nom
> dans vos fichiers. J'ai seulement mis son prénom dans une liste de
> protection, pour qu'il ne parte jamais ailleurs.
>
> **Les fichiers** : vous n'avez rien à ouvrir ni à enregistrer. Je garde
> tout dans un dossier « Rugby-Saisons » sur votre ordinateur. Pour le
> terrain, je vous prépare une **fiche à lire sur le téléphone**, à vous
> envoyer par mail ou par message. Elle s'ouvre comme une page web, même sans
> internet.
>
> **Mercredi 9 septembre, 14 h, 1 heure, 15 enfants, 2 adultes** :
>
> - **14 h 00** Accueil en cercle (5 min).
> - **14 h 05** La queue du diable : attraper les foulards sans se toucher
>   (10 min).
> - **14 h 15** Les éperviers : traverser sans se faire toucher (12 min).
> - **14 h 27** Passes en triangle (10 min).
> - **14 h 37** Petit match au toucher à 5 contre 5 : touché à deux mains,
>   on passe dans les 2 secondes (15 min). Avec 3 équipes de 5, une équipe
>   boit pendant que les deux autres jouent.
> - **14 h 52** Retour au calme : le chat qui s'étire (4 min).
> - **14 h 56** Pouce levé ou baissé : qu'avez-vous aimé ? (4 min).
>
> Pas de plaquage : en septembre, les M8 jouent au toucher.

## Tour 3

**Ressenti du coach (sur le tour 2)** : le planning heure par heure est
compris tout de suite, il tient en un écran. La réponse sur l'asthme rassure.
Mais « liste de protection » et « dossier sur l'ordinateur » lui ont **refait
peur**. Il ne connaît pas les règles des jeux (éperviers, queue du diable) :
« mercredi je serais coincé sans les règles ».

**Manque** :

- les règles des jeux en phrases simples ;
- le matériel en quantités (plots, foulards, ballons) ;
- comment recevoir la fiche téléphone sans donner son adresse mail ;
- quoi faire si les enfants ne comprennent pas ou si ça se passe mal.

**Coach** : demande ce que sont la liste et le dossier, s'il doit faire
quelque chose, les règles en deux phrases par jeu, et comment il reçoit la
fiche.

**Skills appliqués** : `exercices` (consignes des fiches) et `exporter`
(remise de la fiche).

**Constat de l'orchestrateur** :

- La réponse de séance du tour 2 citait des **noms de jeux** sans leurs
  règles. Pour un débutant, chaque bloc doit avoir son « comment on joue » en
  une ou deux phrases. Les fiches les contiennent (`consignes`), mais le
  skill `seance` ne demande pas de les reprendre dans la réponse courte.
- Le matériel est listé sans **quantités** dans les fiches (« plots »,
  « foulards »).
- Les règles d'usage invitent à expliquer la protection des données en
  « une phrase simple ». Le vocabulaire choisi (« liste de protection »,
  « dossier ») a inquiété un profil technophobe.
- Dans Cowork, la fiche est un fichier sur l'ordinateur. Le plugin ne peut
  pas « envoyer » la fiche au téléphone ; le skill `exporter` dit
  « envoyez-vous la fiche par mail », mais ne guide pas pas à pas.

**Réponse du plugin** :

> **Vous n'avez rien à faire.** Tout ce qui est noté reste sur votre
> ordinateur, rien ne part sur internet. Le prénom de Zébulon sert seulement
> à ce qu'il ne soit jamais recopié ailleurs.
>
> **Les jeux en deux phrases :**
>
> - **La queue du diable** : chaque enfant glisse un foulard à sa ceinture,
>   comme une queue. Au signal, tout le monde essaie d'attraper les queues des
>   autres sans les toucher ni les pousser.
> - **Les éperviers** : les enfants partent d'une ligne et doivent traverser
>   jusqu'à l'autre ligne. Un ou deux « éperviers » au milieu les touchent à
>   deux mains ; qui est touché devient épervier.
> - **Passes en triangle** : par trois, chacun à un plot, on se passe le
>   ballon à deux mains, et on court à la place de celui à qui on a fait la
>   passe.
> - **Match au toucher** : on avance avec le ballon. Si on est touché à deux
>   mains, on a 2 secondes pour passer à un copain derrière soi.
>
> **À apporter** : 15 foulards (ou des chasubles glissées dans le short),
> 12 plots, 5 ballons, des chasubles de deux couleurs.
>
> **Si ça coince** : arrêtez, montrez vous-même avec deux enfants, puis
> relancez. Un jeu qui ne marche pas, on le raccourcit et on passe au
> suivant.
>
> **La fiche pour le téléphone** : elle est enregistrée sur votre
> ordinateur. Je ne vous demande pas votre adresse : le plus simple est de
> vous l'envoyer vous-même par mail ou par message. Je peux vous montrer où
> elle se trouve, si vous voulez.

## Clôture (réaction au tour 3)

**Coach** : « Ok c'est bon, j'ai compris les jeux, merci. Oui montrez-moi où
est la fiche, mais en vrai simple, genre "cliquez ici", pas de chemin avec
des barres. »

**Ressenti** : les règles en deux phrases, il peut les redire telles quelles
aux enfants. La liste du matériel, il peut la préparer ce soir. « Si ça
coince, on raccourcit » lui enlève un gros stress. Mais si on lui parle de
« dossier » ou de chemin, il décroche. « Je saurais quoi faire mercredi. »

**Manque** :

- le temps de préparation à prévoir avant 14 h ;
- ce qu'il faut dire exactement à la maman de Zébulon.

**J'ARRÊTE** : oui, satisfait.

**Constat de l'orchestrateur** : remettre la fiche au coach sans lui parler
de chemin est impossible dans les skills actuels. L'outil Artifact, ou
l'ouverture du fichier par l'application, n'est pas prévu par le skill
`exporter`.

**Fichiers produits** :

- `m8/equipe.yaml` et `m8/seances/2026-09-09/seance.yaml` (valides) ;
- les exports de la séance, dont `pour-mca.txt` (non demandé) ;
- `.joueurs-proteges.txt`, qui contient le prénom.
