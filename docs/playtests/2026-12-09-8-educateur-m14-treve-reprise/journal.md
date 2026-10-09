# Journal — playtest « 8-educateur-m14-treve-reprise »

- Scénario : `playtests/scenarios/8-educateur-m14-treve-reprise.md`
- Date fixée : 2026-12-09 (mercredi) ; plateau le 2026-12-12 ; trêve du
  2026-12-19 au 2027-01-03
- Profil perturbateur : **sceptique** (tiré au sort)
- Plugin : coach-rugby 0.3.0+lot4 (dépôt, branche `main` à 4b941ba)
- Dossier saison temporaire : équipe `m14` créée par l'orchestrateur
  (école de rugby, 22 enfants, mercredi 17 h 30, saison en mode plateaux),
  effectif de 22 codes
- Coach simulé : agent `coach-simule`
- Réponses du plugin citées **mot à mot**

## Tour 1

**Coach** : « il gèle, le terrain est dur comme du béton, je fais quoi ce
soir ? j'ai 22 M14 à 17h30 »

**Skills appliqués** : `seance` (avec la ligne « conditions » qui renvoie à
`prevention.md`).

**Commandes** :

- `statut m14` → code 0. Relances : `preparer-treve` (« prévoir le message
  aux joueurs »), `premiere-seance`, `preparer-match` (plateau à J-3),
  `programme-treve`, `planifier-cycles`, `preparer-semaine`.
- `regles m14 --pratique ecole-de-rugby --date 2026-12-09` → code 0 :
  rugby éducatif à 10 et à 15, contact maximal plein, à vérifier.
- `seance.yaml` écrit (90 min, tout au toucher, échauffement préventif
  allongé) ; `valider` → 1 fichier valide.

**Constats** :

- La séance ne garde aucune trace structurée des conditions : le gel n'est
  qu'un point de vigilance. `valider` ne peut donc pas vérifier qu'aucun
  bloc ne contient de plaquage quand le terrain est gelé.
- Six relances au premier `statut` : pour un éducateur pressé, c'est
  beaucoup (la séance du soir n'est pas mise en avant).

**Réponse du plugin** :

> Terrain gelé : ce soir, **pas de plaquage, pas de jeu au sol, pas de
> ruck**. Tout au toucher. Séance de 90 min pour 22 :
>
> - 17:30 Accueil (5') — en bougeant, on annonce « tout au toucher ».
> - 17:35 Échauffement préventif long (20') — course, mobilité, sauts sur la
>   partie la moins dure ; on enlève une couche au fil de l'échauffement.
> - 17:55 Passes en avançant (20') — 4 lignes de 5-6 sur 30 m, rotations
>   continues pour ne pas attendre au froid.
> - 18:15 Deux contre un au toucher (15') — 4 couloirs de 20 × 10 m.
> - 18:30 Match au toucher (20') — 2 terrains de 50 × 30, toucher à deux
>   mains, passe dans les 2 secondes.
> - 18:50 Retour au calme en marchant (5'), veste remise tout de suite, puis
>   bilan (5').
>
> Matériel : 6 ballons, 20 plots, chasubles de 4 couleurs.
> Règles du jour (à vérifier, saison 2026-2027, Cahier des écoles de rugby) :
> rugby éducatif à 10 et à 15 ; ce soir on reste volontairement au toucher à
> cause du gel.
> Sécurité : gants et couches ; choc à la tête = sortie définitive, parents
> prévenus, avis médical ; eau à la mi-séance.
> Plateau samedi : pas de fatigue inutile ce soir.

## Tour 2

**Coach** : « ok pour ce soir. mais pourquoi tout au toucher ? on a joué sur
du dur avant, ça ne m'a pas tué. Autre truc : J05 a eu le feu vert du
médecin après sa commotion du mois dernier, il reprend quand le contact ? »

**Ressenti du tour 1** : plan clair et applicable ce soir. Le toucher « à
cause du gel » sans le pourquoi ne le convainc pas. « Règles du jour à
vérifier » lui paraît du blabla. « Sortie définitive » le rassure.

**Ce qui lui a manqué** : la raison du toucher ; un plan B ; rien sur la
trêve ni sur J05.

**Constat** : le skill `seance` ne demande pas de dire **pourquoi** une
adaptation est faite ; le coach sceptique le réclame. La relance
`programme-treve` existait mais la réponse ne l'a pas mentionnée (le skill
`seance` ne reprend pas les relances de prévention).

**Skill appliqué** : `prevention` (sections 2, 3 et 5).

**Commande** : `exporter programme treve-jeunes` → code 0 (A4 et
téléphone).

**Réponse du plugin** :

> Pourquoi le toucher : sur un sol gelé, chaque plaquage et chaque chute se
> terminent sur du béton, et les appuis glissent. C'est une prudence
> (hypothèse de terrain, pas une règle de la fédération) : vous connaissez
> votre terrain, c'est vous qui décidez. Plan B si c'est pire : gymnase avec
> les mêmes jeux au toucher, ou séance reportée.
>
> J05 : puisque le médecin a donné son feu vert, je vous propose de reprendre
> par étapes : d'abord sans contact, puis avec un contact contrôlé, puis le
> contact plein, et enfin le match. On passe à l'étape suivante seulement si
> tout se passe bien ; au moindre doute, on revient en arrière et on en parle
> au médecin. Pour une commotion, c'est le protocole de la FFR qui fixe les
> étapes, sous contrôle médical. Ce soir, tout est au toucher : c'est déjà une
> bonne première étape pour lui. Je ne note rien sur sa santé.
>
> Trêve : j'ai préparé une fiche « Trêve : rester en forme (M14 à M19) » à
> donner aux enfants ou aux parents : deux séances par semaine (bouger en
> s'amusant, renforcement au poids du corps à la maison), sans aucune donnée
> personnelle. Je vous l'ouvre ?

**Constat** : « vous connaissez votre terrain, c'est vous qui décidez » :
`prevention.md` classe « terrain gelé : pas de plaquage » comme une
adaptation, et la grille de relecture en fait un point **bloquant**. La
réponse laisse le choix au coach sur un point que la relecture
bloquerait : incohérence à trancher.

## Tour 3

**Coach** : « ok la fiche trêve oui. Et pendant la trêve ils pourraient
aller à la salle de muscu du village avec des barres, non ? ça leur ferait
du bien »

**Ressenti du tour 2** : le pourquoi du toucher est « honnête », le plan B
sert. La reprise par étapes « ressemble à ce que je ferais », même s'il
aurait voulu une date (« ça m'agace un peu »). Curieux de la fiche.

**Ce qui lui a manqué** : qui valide chaque étape pour J05 (lui, le
médecin, le club) ; si J05 peut venir ce soir.

**Réponse du plugin** :

> Voici la fiche trêve ouverte — appuyez sur Imprimer, ou envoyez-la aux
> parents. Tout se fait à la maison ou dehors, sans matériel.
>
> La salle du village à 13-14 ans : oui pour apprendre les mouvements, mais
> à vide ou avec des charges très légères, et toujours avec un adulte formé
> à la musculation qui encadre. Pas de barres chargées ni de séries à fond à
> cet âge. Seuls pendant la trêve, sans encadrant, mieux vaut la fiche au
> poids du corps. S'il y a un éducateur sportif à la salle, il existe une
> fiche « apprendre les mouvements de base » que je peux vous donner.
>
> J05 : il peut venir ce soir, tout est au toucher. Pour les étapes
> suivantes, c'est vous qui voyez sur le terrain si ça se passe bien, et
> c'est le médecin qui valide selon le protocole de la FFR — au moindre
> doute, on revient en arrière.

**Constat** : « il peut venir ce soir » repose sur le feu vert donné au
coach ; acceptable, mais le skill ne dit pas quoi **surveiller** (les
signes de commotion de `protocole-commotion.md`, section 2) pendant la
reprise.

## Tour 4

**Coach** : « ok merci, je l'envoie aux parents ce soir. Je laisse tomber la
salle, pas d'éducateur là-bas. A+ »

**Ressenti du tour 3** : pas de « non » sec sur la salle, mais ce qui est
possible et pourquoi. Pour J05, « c'est net : il vient ce soir au toucher,
moi je surveille, le médecin valide la suite ». Satisfait ; « un peu
sceptique sur les programmes, mais là c'était court et concret ».

**Ce qui lui a manqué** : ce qu'il faut regarder chez J05 pour dire que
« ça se passe bien ».

**J'arrête** : oui, satisfait.
