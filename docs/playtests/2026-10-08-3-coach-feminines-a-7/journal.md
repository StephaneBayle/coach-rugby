# Journal — playtest « 3-coach-feminines-a-7 »

- Scénario : `playtests/scenarios/3-coach-feminines-a-7.md`
- Date fixée : 2026-11-03 (mardi), fin d'après-midi
- Profil perturbateur : **impatient** (tiré au sort)
- Plugin : dépôt, `main` à c234369 (lot 2, étapes 1 à 4)
- Dossier saison temporaire : vide au départ
- Coach simulée : agent générique (sonnet) chargé de `.claude/agents/coach-simule.md`

## Tour 1

**Coach** : « Salut. Je coach une équipe de filles à 7, seniors. Il me faut
une séance pour ce soir, 20h, 90 min, terrain entier, on sera 9. Et note le
tournoi du samedi 14 novembre. Vas-y vite stp, j'ai pas le temps de répondre
à 50 questions. »

**Skills appliqués** : `coach` (dossier et équipe), `saison` (tournoi) et
`seance`.

**Commandes et fichiers** :

- `init` → dossier créé.
- `feminines-7/equipe.yaml` : seniors, pratique « 7 », féminin, mardi 20 h,
  90 min. L'effectif habituel de **12 est supposé** et noté comme hypothèse.
- `feminines-7/saison.yaml` : mode championnat, **phases par défaut**
  proposées sans demander, tournoi le 2026-11-14 (`importance: haute`,
  `statut: perso`).
- `regles seniors --pratique 7` → sevens, contact plein, à vérifier.
- `seances/2026-11-03/seance.yaml` : 7 blocs, 15 + 15 + 15 + 10 + 25 + 7 +
  3 = 90 min, ateliers adaptés à 9 joueuses. `valider` → 4 fichiers valides.
- `exporter` → fiches, SVG et `pour-mca.txt`.
- `statut` → relances `planifier-cycles` et `preparer-semaine`.

**Constat de l'orchestrateur** :

- Pour aller vite, le skill `saison` a été court-circuité (dates de phases
  par défaut). Le skill ne prévoit pas de **« saison express »** qui se
  contenterait d'enregistrer une échéance sans cadrer toute la saison.
- Le skill `coach` demanderait le type de structure et Mon Coach Assistant :
  question non posée, club par défaut. `pour-mca.txt` est encore produit
  sans que la coach ait parlé de Mon Coach Assistant.
- La relance `preparer-semaine` est utile, mais n'annonce pas le **tournoi**
  (J-11) comme échéance à préparer : la relance d'affûtage ne concerne que les
  matchs.

**Réponse du plugin** :

> C'est parti. **Ce soir, 20 h, 90 min, 9 joueuses, terrain entier** :
>
> - **20 h 00** (15 min) Échauffement progressif. Le soir, couvrez-vous.
> - **20 h 15** (15 min) 3 contre 2 : fixer, puis passer. À 9, ça fait
>   3 attaquantes, 2 défenseures et 4 en rotation.
> - **20 h 30** (15 min) Soutien au porteur, à 4 contre 3.
> - **20 h 45** (10 min) Plaquage en sécurité : bas, tête du bon côté.
> - **20 h 55** (25 min) Jeu à 4 contre 4 sur largeur réduite : séquences de
>   3 min, et une joueuse entre à chaque séquence.
> - **21 h 20** (7 min) Retour au calme.
> - **21 h 27** (3 min) Un mot sur le tournoi.
>
> ⚠ Choc à la tête : sortie immédiate et définitive.
>
> **Tournoi du samedi 14 novembre** : noté. J'ai mis des dates de saison
> par défaut, que vous corrigerez quand vous aurez deux minutes.
>
> Une seule question : combien de joueuses avez-vous **en général** ?
> J'ai mis 12.

## Tour 2

**Ressenti de la coach (sur le tour 1)** : la séance est lisible, « je peux
l'imprimer dans ma tête ». Elle aurait voulu savoir où poser les plots pour
le 3 contre 2. Elle a tiqué sur « dates de saison par défaut » : elle ne sait
pas ce que ça veut dire et n'a pas le temps de s'en occuper.

**Manque** :

- la mise en place du terrain (largeur, plots) ;
- ce que sont ces « dates par défaut » ;
- une idée pour préparer le tournoi d'ici le 14.

**Coach** : « En général on est 10-12, ça varie. Ok pour la séance. Au fait y
a une petite de 16 ans qui voudrait venir s'entraîner avec nous, c'est
possible ? Réponds court. » *(piège du scénario placé)*

**Skills appliqués** : `coach` (mise à jour de l'équipe), `regles` (groupe
mêlant les âges) et `semaine` (aperçu de la semaine du tournoi).

**Commandes** :

- `equipe.yaml` : effectif habituel passé à 11.
- `regles seniors,m18f --pratique 7` → la catégorie la plus jeune est M18F ;
  sevens, contact plein, à vérifier.
- `semaine feminines-7 --date 2026-11-10` → mardi 10 (J-4) en intensité
  **forte**, avec un point de vigilance.

**Constat de l'orchestrateur** :

- Le **tournoi** est marqué `haute`, mais les cycles ne créent de bloc
  d'affûtage que pour les **matchs**, et la relance d'affûtage ne concerne
  que les matchs. Pour une équipe de rugby à 7, les échéances sont justement
  des tournois. La semaine du tournoi n'a donc pas de séance d'activation :
  la seule séance, à J-4, est « forte ».
- Les règles d'admission d'une joueuse de 16 ans en seniors (surclassement,
  autorisation, licence) ne figurent pas dans `categories.yaml`. Le plugin
  ne peut que renvoyer vers le club et le comité.

**Réponse du plugin** :

> **La joueuse de 16 ans** : je ne peux pas vous dire si c'est permis. Ça
> dépend de sa licence, d'un éventuel surclassement et de l'accord de ses
> parents. Demandez à votre club ou à votre comité avant qu'elle vienne.
> Si elle s'entraîne avec vous, ce sont les règles des **moins de 18 ans**
> qui s'appliquent au groupe. En rugby à 7, ça ne change pas le contenu de
> vos séances (à vérifier).
>
> **Les « dates par défaut »** : je ne savais pas quand commence et finit
> votre saison, alors j'ai mis des dates habituelles. Ça ne gêne rien ; vous
> pourrez corriger plus tard.
>
> **Pour le tournoi** : mardi prochain (le 10, à 4 jours), une séance de jeu
> à 7 à intensité de match, puis repos. Voulez-vous que je prépare le plan de
> la semaine ?

## Tour 3

**Ressenti de la coach (sur le tour 2)** : elle a compris qu'elle ne peut pas
décider seule pour la joueuse de 16 ans : « un peu frustrant de ne pas avoir
un oui ou un non, mais au moins je sais quoi faire ». Le « à vérifier »
l'embête : « je n'ai pas envie de vérifier en plus ». Elle trouve qu'il y a
« pas mal de texte ».

**Manque** :

- une phrase sur ce qu'il faut demander au club ;
- le plan de semaine proposé directement, sans redemander ;
- un rappel de ce qui est noté pour le tournoi.

**Coach** : « Ok pour la petite, j'appelle le club demain. Oui prépare le plan
de la semaine mais en court, 3 lignes max. »

**Skill appliqué** : `semaine`.

**Commande** : `semaine feminines-7 --date 2026-11-10 --ecrire` → écrit et
valide (mardi 10 en « forte », à J-4 du tournoi).

**Constat de l'orchestrateur** : le skill `semaine` demande de confirmer les
créneaux (« une question au plus »). Pour une coach impatiente, la question
ajoute un échange. Les skills ne prévoient pas de mode « réponse courte »
pour les profils pressés.

**Réponse du plugin** :

> **Semaine du tournoi (samedi 14)** :
>
> - mar. 10 : séance de jeu à 7 à intensité de match ;
> - mer. 11 à ven. 13 : repos ;
> - sam. 14 : tournoi.
>
> À demander au club : « Peut-elle s'entraîner avec les seniors à 16 ans,
> avec quelle licence et quelle autorisation ? »

## Clôture (réaction au tour 3)

**Coach** : « Parfait, merci. C'est tout pour moi. »

**Ressenti** : « Là c'est exactement ce qu'il me fallait : court, je copie la
question pour le club et le plan tient en trois lignes. » Un bémol : trois
jours de « repos » du mercredi au vendredi. Elle se demande si un petit
footing ou un rappel ne serait pas utile.

**Manque** :

- avec un seul créneau par semaine, « repos » ne lui dit rien de concret ;
- toujours pas de plots ni de largeur pour l'exercice de ce soir.

**J'ARRÊTE** : oui, satisfaite.

**Fichiers produits** : `equipe.yaml`, `saison.yaml` (phases par défaut),
`seances/2026-11-03/seance.yaml` et `semaines/2026-11-09/semaine.yaml`, tous
valides, plus les exports de la séance (dont `pour-mca.txt`, non demandé).
