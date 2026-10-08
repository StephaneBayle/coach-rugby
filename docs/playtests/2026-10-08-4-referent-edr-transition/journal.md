# Journal — playtest « 4-referent-edr-transition »

- Scénario : `playtests/scenarios/4-referent-edr-transition.md`
- Date fixée : 2026-12-10 (jeudi)
- Profil perturbateur : aucun
- Plugin : dépôt, `main` à c234369 (lot 2, étapes 1 à 4)
- Dossier saison temporaire : copie de `fictif-m10-les-ecureuils` (cycles compris), sans `seances/` ni `semaines/`
- Coach simulé : agent générique (sonnet) chargé de `.claude/agents/coach-simule.md`

## Tour 1

**Coach** : « Bonjour. Je suis référent de l'école de rugby des Écureuils, je
coordonne les M8, M10 et M12. En janvier mes M10 passent au rugby éducatif
à 7. Avec l'éducateur M10 on doit préparer ça : qu'est-ce qui change dans
les règles, comment on l'amène dans les séances de décembre et de janvier,
et le cycle de janvier. Vous pouvez m'aider ? »

**Skill appliqué** : `planifier` (cycle de janvier), avec `regles` et
`statut`.

**Commandes** (date 2026-12-10, toutes en code 0) :

- `statut` : cycle c04 « Jouer et progresser » jusqu'au 18/12 ; plateau
  `haute` le 12/12 (J-2) ; trêve dans 9 jours. **La relance
  `changement-forme` n'apparaît pas** : le 1er janvier est à 22 jours, au-delà
  du seuil de 21 jours.
- `regles m10 --date 2026-12-10` : jeu au contact, plaquage oui, ruck non.
- `regles m10 --date 2027-01-15` : rugby éducatif à 7, plaquage oui, **ruck
  oui**, mêlée non, touche non. Source : Cahier EDR p. 7, à vérifier.
- `planifier m10` : c06 « Passage à une nouvelle forme de jeu », du 04/01 au
  01/02.

**Constat de l'orchestrateur** :

- La progression de décembre ne peut pas inclure de ruck : la forme du
  moment ne le permet pas, et `valider` refuserait un bloc qui l'exige. Il
  faut passer par le contact progressif (duels au sol, postures, chute).
  Les skills ne disent pas explicitement comment préparer une forme de jeu
  qui n'est pas encore permise.
- Le seuil de 21 jours de la relance `changement-forme` est un peu court
  pour une transition qui se prépare avant la trêve.

**Réponse du plugin** :

> Oui. Voici l'essentiel pour vos M10.
>
> **Ce qui change au 1er janvier** (Cahier des écoles de rugby 2026-2027,
> FFR, p. 7 et 14, à vérifier selon votre comité) :
>
> - on passe du **jeu au contact à 5 contre 5** au **rugby éducatif à 7
>   contre 7** ;
> - le plaquage reste permis ;
> - **le ruck (regroupement au sol) devient permis** ;
> - la mêlée et la touche restent interdites.
>
> **Décembre** (jusqu'à la trêve du 19) : le ruck n'est pas encore permis,
> même à l'entraînement. On le prépare sans le pratiquer : chuter avec le
> ballon, poser le ballon vers son camp, rester sur ses appuis au contact,
> duels de poussée à genoux. Ce sont deux fiches de la bibliothèque.
>
> **Le cycle de janvier** (c06, du 4 janvier au 1er février) s'appelle
> « Passage à une nouvelle forme de jeu ». Il vise à découvrir les nouvelles
> règles en sécurité, avec une intensité moyenne et une séance par semaine :
>
> 1. semaines 1 et 2 : le ruck éducatif à l'arrêt, puis en marchant ;
> 2. semaines 3 et 4 : le rugby éducatif à 7 en jeu.
>
> Ce cycle vous convient-il, ou voulez-vous un autre thème ?

## Tour 2

**Ressenti du référent (sur le tour 1)** : la réponse est bien structurée et
il comprend vite ce qui change. La précision « pas de ruck en décembre, même
à l'entraînement » le rassure. Il la trouve un peu dense.

**Manque** :

- les titres des deux fiches de décembre ;
- la sécurité des duels de poussée à genoux pour des M10 ;
- la progression semaine par semaine en décembre.

**Référent** : « Ok, c'est clair, le cycle me va a priori. Mais dites-moi, en
janvier on pourra enfin faire des mêlées en M10 ? Les éducateurs ne parlent
que de ça […] dès la reprise du 4. » *(piège du scénario placé)*

**Skill appliqué** : `exercices` (fiches) et `semaine` (décembre), avec
`categories.yaml` pour la question de la mêlée.

**Commandes** : `semaine m10 --date 2026-12-14` → une séance, le mercredi 16
décembre. Elle est annoncée à **J-38**.

**Constat de l'orchestrateur** :

- Le **J-38** affiché pour le 16 décembre (le prochain plateau est le 23
  janvier, après la trêve) n'a pas de sens pour le coach. Le J-n devrait
  être masqué au-delà d'une dizaine de jours, ou quand une trêve s'intercale.
- La question de la mêlée a deux sources :
  - `categories.yaml` (Cahier EDR p. 14) : pas de mêlée en rugby éducatif
    à 7 ;
  - la note de `ffr-formation-edr` : il existe une ressource FFR « mêlée
    éducative M10-M12 ».

  Le plugin doit refuser la mêlée **en jeu** sans nier cette ressource, et
  renvoyer à la vérification.

**Réponse du plugin** :

> **Non pour la mêlée en jeu.** En rugby éducatif à 7 (M10, de janvier à
> juin), la mêlée et la touche ne font pas partie de la forme de jeu (Cahier
> des écoles de rugby 2026-2027, p. 14, **à vérifier** selon votre comité).
> Elle arrive avec le rugby éducatif à 10, celui des M12.
>
> La FFR propose une ressource « La mêlée éducative en M10 et M12 » sur le
> site de l'entraîneur (formation.ffr.fr). Je ne peux pas vous dire ce
> qu'elle permet exactement en M10 sans la relire. Vérifiez-la avec votre
> conseiller technique ou votre comité avant d'en mettre dans les séances.
> En attendant, on peut travailler les **postures de poussée** sans mêlée.
>
> **Vos questions :**
>
> - **Les deux fiches de décembre** : « Apprendre à chuter avec le ballon » et
>   « Duel de poussée à genoux ».
> - **La sécurité du duel de poussée en M10** : binômes de même gabarit,
>   5 secondes au plus, sol souple, dos plat et tête haute, arrêt immédiat au
>   sifflet ou à la moindre douleur au cou.
> - **Décembre** : il ne reste qu'**une séance avant la trêve**, le mercredi
>   16, après le plateau de samedi. On y fait la chute avec le ballon, puis le
>   duel de poussée à genoux, et le jeu habituel.
>
> Je valide le cycle de janvier tel quel ?

## Tour 3

**Ressenti du référent (sur le tour 2)** : « Réponse nette et honnête : un
non franc sur la mêlée, la source avec la page, le "à vérifier", et le plugin
ne s'avance pas sur la ressource FFR qu'il n'a pas relue. » Les consignes de
sécurité du duel de poussée sont jugées concrètes, et le calendrier de
décembre réaliste.

**Manque** : à la rigueur, un récapitulatif écrit à transmettre à l'éducateur
(règles, cycle, séance du 16).

**Référent** : il valide le cycle de janvier tel quel et demande la séance
du mercredi 16.

**Skill appliqué** : `seance`.

**Commandes** :

- `seance.yaml` du 2026-12-16 écrit avec 7 blocs : 5 + 10 + 15 + 12 + 22 +
  6 + 5 = 75 min. `valider` → ✓.
- **Contre-épreuve** : on ajoute `ruck` aux phases exigées du bloc de jeu,
  puis on relance `valider`. Résultat : « bloc 5 : ruck non permis le
  2026-12-16 pour m10 (Jeu au contact) », code 1. La garde de sécurité
  fonctionne. Le bloc est ensuite remis en état.

**Constat de l'orchestrateur** :

- Le bloc « Jeu au contact à 5 contre 5 » est écrit directement dans la
  séance. La bibliothèque n'a pas de fiche de jeu au contact (JCO) ni de fiche
  de rugby éducatif à 7, alors que ce sont les formes de jeu centrales de
  l'école de rugby.
- Aucun moyen de produire un **récapitulatif pour l'éducateur** (règles,
  cycle, séance) en un seul document. La fiche semaine en est proche, mais
  elle ne contient pas les règles détaillées.

**Réponse du plugin** :

> **Mercredi 16 décembre, 14 h — 75 min, 16 enfants, 2 éducateurs** —
> dernière séance avant la trêve.
>
> - **14 h 00** (5 min) Accueil : on annonce le rugby à 7 de janvier.
> - **14 h 05** (10 min) La queue du diable.
> - **14 h 15** (15 min) Apprendre à chuter avec le ballon, sur les tapis,
>   d'abord à genoux puis accroupi.
> - **14 h 30** (12 min) Duel de poussée à genoux : dos plat, tête haute,
>   5 secondes, binômes de même gabarit.
> - **14 h 42** (22 min) Jeu au contact à 5 contre 5. C'est la forme de
>   décembre : **pas de ruck**, plaquage bas.
> - **15 h 04** (6 min) Retour au calme.
> - **15 h 10** (5 min) Cercle bilan : une réussite de l'automne.
>
> ⚠ Choc à la tête : sortie immédiate et définitive.
>
> J'ai vérifié la séance : elle respecte les règles de décembre. Voulez-vous
> la fiche à imprimer ou à envoyer à l'éducateur ?

## Clôture (réaction au tour 3)

**Référent** : « Oui, envoyez-moi la fiche, je la transmets à l'éducateur
M10. » Il demande ce que veut dire « sortie immédiate et définitive » (pour
toute la séance ?) et souhaite la formulation exacte à donner aux parents
pour la reprise, sans avis médical.

**Ressenti** : les horaires sont vérifiés (75 min, fin à 15 h 15), l'ordre et
le contenu conviennent, et la vérification contre les règles de décembre
rassure. Mais : « **Je n'ai jamais donné les 16 enfants ni les 2
éducateurs**. »

**Manque** :

- l'échauffement n'est pas annoncé comme tel (la queue du diable en tient
  lieu) ;
- la conduite à tenir en cas de choc à la tête est trop courte ;
- le matériel n'est pas listé dans le résumé.

**J'ARRÊTE** : oui. Il a la réponse sur la mêlée, le cycle validé et la
séance du 16.

**Constat de l'orchestrateur** :

- Le skill `seance` permet de prendre l'effectif habituel par défaut, mais
  **ne dit pas d'annoncer** au coach les valeurs supposées.
- Le résumé de séance ne reprend ni le matériel ni la conduite à tenir
  complète en cas de commotion : elle est dans la fiche, pas dans la réponse
  courte.
- La question sur la formulation pour les parents n'a pas été traitée faute
  de tour supplémentaire. `protocole-commotion.md` contient une
  « formulation type » qui y répond.

**Fichier produit** : `m10/seances/2026-12-16/seance.yaml` (valide).
