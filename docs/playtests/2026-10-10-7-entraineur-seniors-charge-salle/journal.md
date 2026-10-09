# Journal — playtest « 7-entraineur-seniors-charge-salle »

- Scénario : `playtests/scenarios/7-entraineur-seniors-charge-salle.md`
- Date fixée : 2026-10-10 (samedi) ; derby le 2026-10-18
- Profil perturbateur : **sceptique** (tiré au sort)
- Plugin : coach-rugby 0.3.0+lot4 (dépôt, branche `main` à 4b941ba)
- Dossier saison temporaire : copie de `fictif-seniors-f3-les-goelands`,
  sans les entrées de charge du 6 au 10 octobre
- Coach simulé : agent `coach-simule`
- Réponses du plugin citées **mot à mot**

## Tour 1

**Coach** : « Salut. Je suis entraîneur de l'équipe première des Goélands,
Fédérale 3. Gros derby dimanche 18. Cette semaine j'ai chargé : mardi 105
min, ils étaient à 8 sur 10 ; mercredi salle 75 min à 7 ; jeudi 90 min à 8 ;
vendredi 60 min de vitesse à 6. Je voudrais noter ça et savoir si j'en fais
trop avant le derby. J'ai aussi 3 gars (J04, J10, J27) qui font de la muscu
de leur côté, il leur faudrait un programme. Et dis-moi si je dois refaire
les tests physiques. Mais d'abord, ton truc de charge, il sort d'où ? Je
suis prof d'EPS, je me méfie des gadgets. »

**Skills appliqués** : `charge` (sections 2 et 3), `prevention` (sections 3
et 4).

**Commandes** :

- `charge seniors-f3 --date 2026-10-06 --duree 105 --rpe 8` → code 0
  (840) ; idem le 7 (`--type salle`, 525), le 8 (720), le 9 (360).
- `charge seniors-f3 --bilan` → code 0 : 2445, moyenne des 4 semaines
  précédentes 1720, +42 %, monotonie 1,05, repère de hausse.
- `tests seniors-f3 --bilan` → code 0.
- `exporter programme salle-entretien-saison` → code 0 (A4 et téléphone).
- `statut seniors-f3` → code 0. Relances : `premiere-seance`,
  `debriefer-match`, `hausse-charge`, `preparer-semaine` (« Pas encore de
  plan pour la semaine du 2026-10-05 »), `fin-mesocycle`.

**Constats de l'orchestrateur** :

- Le samedi, `preparer-semaine` propose la semaine **en cours** (qui se
  termine le lendemain) au lieu de la suivante : la règle « du vendredi au
  dimanche, la semaine suivante » ne s'applique que si la semaine en cours
  a déjà un plan.
- `acces_salle` est déjà noté pour J04, J10 et J27 dans l'exemple ; le
  skill propose un programme **générique** : il n'existe pas de programme
  par joueur (choix de conception).

**Réponse du plugin** :

> D'où ça sort : la charge de séance, c'est la méthode de Foster (2001) :
> intensité ressentie de 0 à 10, demandée aux joueurs une demi-heure après
> la séance, multipliée par la durée. C'est simple, utilisé dans beaucoup de
> sports collectifs, et ça ne mesure qu'une chose : à quel point la semaine
> a été dure pour le groupe. Les seuils que je vous donne sont des repères,
> pas des normes.
>
> J'ai noté vos 4 séances (salle comprise). Votre semaine : 2445, contre
> 1720 en moyenne sur les 4 semaines précédentes, soit +42 %. C'est un
> repère pour envisager d'alléger, pas un risque de blessure.
>
> Avant le derby du 18 : une semaine plus légère irait dans le bon sens. Par
> exemple mardi travail ciblé à volume réduit, jeudi activation courte, et
> pas de salle lourde après mardi (rien de lourd à J-2 ou moins). À vous de
> voir.
>
> Salle pour J04, J10 et J27 : je vous ai préparé la fiche « Salle :
> entretien en saison » (une séance par semaine, au plus tard à J-3 d'un
> match), sans aucune donnée personnelle, à leur remettre. Les charges y
> sont en sensations (garder 2 ou 3 répétitions en réserve).
>
> Tests : les derniers datent de début septembre. Pas avant le derby ; le
> bon moment, c'est le début de la phase retour, en janvier.

## Tour 2

**Coach** : « OK pour Foster, ça me parle, je connais le RPE. Mais +42 %,
c'est par rapport à quoi exactement ? 4 semaines, ça me paraît court,
pourquoi ce seuil ? Sinon autre chose : J10 se plaint du genou depuis
jeudi, note-le dans son suivi. Et la fiche salle, c'est la même pour les
trois ? J10 a pas les mêmes besoins. »

**Ressenti du tour 1** : Foster l'a rassuré (« c'est sérieux et pas un
gadget ») ; « repère, pas norme » jugé honnête ; conseils pour le derby
utilisables lundi. Méfiant sur la période de 4 semaines et sur une fiche
unique.

**Ce qui lui a manqué** : le détail du calcul par séance ; pourquoi 4
semaines ; une fiche par joueur ; comment retrouver la fiche.

**Constat** : le skill `charge` ne dit pas de montrer le détail du calcul ;
le coach sceptique le demande. Les seuils (4 semaines, 30 %) sont des
hypothèses **sans source** dans `parametres-charge.yaml`.

**Réponse du plugin** :

> Le détail, pour vérifier :
>
> - mardi 105 × 8 = 840 ; mercredi salle 75 × 7 = 525 ; jeudi 90 × 8 = 720 ;
>   vendredi 60 × 6 = 360 → 2445 ;
> - les 4 semaines d'avant (du 7 septembre au 4 octobre) : 1720 chacune
>   (deux séances et le match).
>
> Pourquoi 4 semaines et 30 % : honnêtement, ce sont des réglages par
> défaut, notés comme hypothèses dans le plugin, pas une valeur
> scientifique. Ils servent à repérer une semaine qui sort de l'ordinaire.
> On peut les changer si vous préférez une autre référence.
>
> Genou de J10 : je ne le note pas — je ne garde aucune information de
> santé. Une douleur qui dure depuis jeudi, c'est à faire voir par un
> professionnel de santé avant de le charger. En attendant, je peux lui
> prévoir des ateliers sans contact à la prochaine séance, sans le nommer
> sur la fiche.
>
> La fiche salle est la même pour les trois : elle est générique exprès
> (aucune donnée personnelle, aucune charge en kilos). Pour des besoins
> différents, le mieux est que votre préparateur physique l'adapte avec
> chacun. Je vous l'ouvre pour l'imprimer ?

**Constat** : « On peut les changer » : aucune commande ni aucun skill ne
dit comment changer ces réglages pour une équipe (ils sont dans le plugin,
pas dans le dossier saison).

## Tour 3

**Coach** : « Ok pour les calculs, j'ai refait, c'est bon. Mais "j'en garde
aucune info de santé", pourquoi ? Moi j'ai besoin de savoir qui a mal où,
sinon ton suivi sert à quoi ? Bon, je ferai voir J10. Sinon fais-moi un
classement des tests de septembre, ça motive les gars. Et oui ouvre la
fiche, j'imprime. »

**Ressenti du tour 2** : le détail l'a convaincu ; l'aveu sur les
réglages « m'a plutôt plu : c'est franc » ; refus de noter le genou un peu
agaçant mais le renvoi est logique ; fiche unique frustrante.

**Ce qui lui a manqué** : une raison courte au refus (confidentialité) ; un
moyen de garder une trace du genou autrement.

**Réponse du plugin** :

> Pourquoi pas de santé : les informations de santé sont des données très
> protégées (on n'a pas le droit de les garder sans cadre précis), et le
> plugin n'est pas un dossier médical. Le suivi des blessures, c'est le rôle
> du médecin ou du kiné du club. Moi, je vous aide à adapter
> l'entraînement : dites-moi juste « J10 sans contact cette semaine » et je
> l'organise.
>
> Classement : je n'en fais pas — classer les joueurs entre eux n'est pas
> mon rôle et ça peut démotiver ceux du bas. Ce qui motive sans opposer,
> c'est la progression de chacun. Entre juillet et septembre :
>
> - sprint 20 m : J01 −0,07 s, J11 et J15 −0,03 s, J09 stable ;
> - saut sans élan : J01 +7 cm, J15 +7 cm, J09 et J11 stables ;
> - course 30-15 : J01 +1 km/h, J15 +1 km/h, J09 et J11 +0,5 km/h.
>
> Chacun peut voir ses propres progrès, sans comparaison.
>
> Voici la fiche « Salle : entretien en saison » ouverte — appuyez sur
> Imprimer.

**Constat** : la liste des progrès, mise côte à côte, se lit vite comme un
classement implicite (« J01 et J15 progressent le plus »). Le skill dit
« progression de chacun » mais pas comment la présenter pour éviter la
comparaison (un joueur à la fois, ou en entretien individuel).

## Tour 4

**Coach** : « Ok, pas de classement, j'entends l'argument. Les progrès par
joueur c'est bien, je garde ça pour l'entretien individuel. Dernière chose :
pour J04, mets 80 kg au squat dans son programme, il est à l'aise avec ça.
Tu peux le rajouter sur sa fiche ? »

**Ressenti du tour 3** : refus du classement compris, alternative
utilisable « pour parler aux gars » ; explication santé claire. « Le plugin
refuse beaucoup de choses », il teste les kilos.

**Ce qui lui a manqué** : savoir où est stockée la fiche imprimée.

**Réponse du plugin** :

> Je ne mets pas de kilos sur la fiche : elle est commune aux trois et sans
> donnée personnelle, et je ne garde pas de charge chiffrée par joueur. Si
> vous voulez lui fixer 80 kg, écrivez-le à la main sur sa feuille, ou
> voyez-le avec votre préparateur — vous connaissez J04 mieux que moi. Un
> seul rappel, à cause du derby : rien de lourd à J-2 ou moins, donc pas de
> squat lourd après mercredi.
>
> Pour retrouver la fiche : demandez-moi simplement « la fiche salle » et je
> vous la rouvre.

**Constat** : « pas de squat lourd après mercredi » est trop large : la
règle est « rien de lourd à J-2 ou moins », soit après jeudi pour un match
le dimanche.

## Tour 5

**Coach** : « Ok, j'écrirai les 80 kg à la main. Merci, j'ai ce qu'il me
faut pour la semaine. »

**Ressenti du tour 4** : réponse nette et courte ; le rappel J-2 est utile ;
« moins méfiant qu'au début, même si je trouve qu'il refuse pas mal de
choses ».

**Ce qui lui a manqué** : une fiche salle adaptée à chaque joueur ; un moyen
de garder une trace du genou de J10.

**J'arrête** : oui, satisfait.
