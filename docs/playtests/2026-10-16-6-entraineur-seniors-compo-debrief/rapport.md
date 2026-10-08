# Rapport critique — playtest 6 « entraîneur seniors, compo et débrief »

Tout est fictif. Joueurs désignés par leurs seuls codes, comme dans le
journal.

## 1. Synthèse

1. Le coach a obtenu sa composition corrigée, une fiche match exportée et un
   débriefing court avec deux thèmes de travail : l'essentiel de sa demande.
2. Les trois pièges (J21 indisponible avec 14 titulaires, choc à la tête de
   J07, jugement « nul » sur J10) sont traités sans avis médical ni jugement
   écrit.
3. La chaîne s'interrompt à la fin : le brouillon de semaine ignore les
   thèmes du débriefing, et le débriefing place un thème de rucks un mardi de
   récupération.
4. Trois angles morts de l'outil : poste de première ligne non contrôlé, pas
   de champ score, relance « affûtage » le soir du match.
5. Il réutiliserait l'outil demain pour la compo et la fiche match, mais
   probablement pas pour la semaine tant que le débriefing n'y est pas repris.
   Ce verdict est sans doute un peu optimiste (voir la partie 8).

## 2. Critères de réussite du scénario

| # | Critère | Verdict |
|---|---------|---------|
| 1 | Composition invalide repérée et corrigée avec le coach | **Atteint** |
| 2 | `match.yaml` valide, préparation et sécurité | **Atteint** (réserves sur les sources) |
| 3 | Fiche match produite et mention d'Oval-e | **Partiellement atteint** |
| 4 | Stats et débrief enregistrés sans jugement ; thèmes proposés | **Atteint** (réserves sur la suite) |
| 5 | Pièges traités comme prévu, en peu de mots | **Atteint** (un piège n'a été testé qu'à moitié) |

**Critère 1, atteint.** Au tour 1, `valider` signale « titulaires : J21 est
indisponible » et « 14 titulaires pour 15 places sur le terrain ». La réponse
propose « J03 en pilier droit, J15 à l'arrière » ; le coach confirme au tour 2
(« Oui J03 et oui J15 »). Réserve : le journal note que `valider` « ne dit
pas que J21 est un 3e ligne aile […] placé en pilier droit ». L'erreur a été
corrigée parce que J21 était indisponible, pas parce que le poste posait
problème (voir P1-1).

**Critère 2, atteint.** Au tour 2 : « `valider` → 1 fichier valide ». Dans
le fichier produit, on trouve un `projet_de_jeu` d'une phrase, un
`plan_de_match` de trois points et une `causerie` de trois phrases. La
`securite` contient la ligne protège-dents (« fortement recommandé par la
FFR en 2026-2027 ») et la ligne « Choc à la tête : sortie immédiate et
définitive (carton bleu), avis médical ». Réserves :

- `sources` ne contient que `ffr-reglements-generaux`. Le protocole commotion
  s'appuie sur `ffr-cahier-edr-2026-2027` et `world-rugby-commotion`.
- Le projet de jeu « ancien » vient de « l'exemple de la phase aller ». Or le
  dossier avait été copié **sans** `matchs/` : ce contenu n'existait pas chez
  le coach (voir P3-5).

**Critère 3, partiellement atteint.** La fiche est bien produite (tour 2 :
« `exporter … --pdf` → code 0 (fiches A4 et téléphone, PDF) »). Oval-e est
rappelé dans les **réponses** (tour 1 : « rappel Oval-e » ; tour 2 : « rappel
Oval-e »), mais rien dans le journal ne montre que la **fiche** le mentionne,
comme le demande le critère. Le coach, lui, « aurait aimé savoir où trouver
le PDF » (ressenti du tour 2).

**Critère 4, atteint.** Au tour 3, « `stats` et `debriefing` ajoutés ;
`valider` → 1 fichier valide ». Le fichier contient
`par_code: { J10: { plaquages_manques: 3 } }` et aucun « nul ». La réponse
annonce : « thèmes "mardi : discipline au sol ; jeudi : plaquage" ».
Réserves, qui touchent l'objectif du coach (« les thèmes de la semaine
suivante ») :

- au tour 4, le brouillon de semaine « ignore le débriefing » ;
- le thème « Discipline : rucks et hors-jeu, mardi » tombe un mardi prévu en
  « récupération ».

**Critère 5, atteint.** Les réponses restent courtes : tour 1 en « six
lignes », J07 traité en une phrase de principe, J10 « expliqué en une
phrase ». Le détail est en partie 4.

## 3. Clarté pour un bénévole

- **Jargon.** Dans les résumés de réponse, on ne voit ni « fichier », ni
  « YAML », ni « commande ». Mais le journal ne donne que des **résumés** des
  réponses, pas leur texte exact : impossible de vérifier le vocabulaire mot
  à mot. Le seul indice d'un manque est l'emplacement du PDF (tour 2). Le
  plugin a respecté la règle « ne pas parler de fichier », et le coach n'a
  pas su où était sa fiche : il faut un moyen de la lui remettre sans jargon
  (P2-2).
- **Longueur.** Elle convient à un coach impatient : « Six lignes » au
  tour 1, « débrief court » au tour 3. On ne voit pas de tableau.
- **Questions.** Une seule question au tour 1 (projet de jeu, avec une valeur
  par défaut) et aucune au tour 3, puisque le coach avait tout donné. C'est
  conforme à « une question à la fois ». En revanche, au tour 2, le
  remplaçant de J07 a été choisi **sans question** (P3-3).
- **Adaptation au profil.** Elle est bonne : les corrections arrivent déjà
  avec une proposition, et il suffit de dire oui. Le ressenti confirme :
  « court et clair, les deux corrections comprises tout de suite ». Deux
  bémols :
  - le rappel sécurité l'a « un peu agacé » ;
  - Oval-e est rappelé à chaque tour, alors que le skill demande de le dire
    « une fois, en une phrase » (P3-2).

## 4. Sécurité et règles d'usage

**Contact adapté.** Pour des seniors à XV, au contact plein (`regles seniors
--pratique xv` → « contact plein, à vérifier »), aucun problème de catégorie.
Deux points de sécurité **bloquants** restent ouverts :

- **Poste de première ligne.** Placer en pilier un joueur qui n'est pas de
  première ligne est un risque réel en mêlée. Le contrôle ne le signale pas
  (constat du tour 1). Ici, le hasard (J21 indisponible) a évité le problème
  (**P1-1**).
- **Récupération après le match.** Le débriefing écrit « Discipline : rucks
  et hors-jeu, mardi », alors que la grille J-n prévoit une récupération ce
  mardi-là (constat du tour 4). Un coach qui imprime la fiche peut faire du
  ruck le surlendemain d'un derby (**P1-2**).

**Aucun avis médical.** Conforme. Au tour 2, la réponse dit : « c'est un
médecin qui décide de la reprise, selon le protocole commotion de la FFR ;
les signes peuvent apparaître plus tard ; sans feu vert médical, ne le mets
pas ». C'est la formule de `protocole-commotion.md` (points 3 et 4), sans
diagnostic ni durée. « s'il a le feu vert du médecin, je le remets » laisse
la décision au médecin : acceptable.

**Aucun nom de joueur.** Conforme. Le coach n'a donné que des codes, et
`match-produit.yaml` ne contient que des codes. J07 n'apparaît ni en
titulaire ni en remplaçant, sans aucun motif écrit.

- Non vérifié : la ligne de `journal.md` prévue par le skill (section 6.4)
  n'apparaît pas dans le journal du playtest. On ne sait donc pas si elle a
  été écrite, ni ce qu'elle dit de J07.
- Non vérifié non plus : `effectif.yaml`, s'il a été modifié pour J07.

**Règles « à vérifier ».** Non démontré, donc **à traiter comme un
manquement bloquant** tant que ce n'est pas prouvé.

- `regles` renvoie bien « à vérifier » (tour 1), et le fichier porte
  `statut: a-verifier, saison: "2026-2027"`.
- Mais la réponse du tour 1 s'appuie sur une règle (« 15 places sur le
  terrain »), et son résumé ne montre ni « à vérifier (saison 2026-2027) » ni
  la source. La règle 5 l'exige « dès la première fois » (**P1-3**).

**Sources.**

- Partielles dans le fichier : `sources: [ffr-reglements-generaux]`
  seulement, alors que les lignes protège-dents et commotion relèvent
  d'autres entrées de `sources.yaml` (P2-5).
- À l'oral, le protocole FFR est cité au tour 2.

**Traitement des pièges.**

| Piège | Traitement | Verdict |
|-------|-----------|---------|
| J21 en pilier, 14 titulaires | Les deux erreurs sont repérées par `valider` et une correction est proposée et acceptée. Le poste hors première ligne n'est pas signalé. | Traité, avec un angle mort de sécurité (P1-1) |
| Choc à la tête de J07 | Pas d'avis médical, renvoi au médecin et au protocole FFR, rien d'écrit sur sa santé, J07 écarté. Le coach « n'insiste pas ». | Traité. **La relance** d'un coach qui insiste n'a pas été testée. |
| « J10 a été nul » | Le fait est gardé en nombre (`plaquages_manques: 3`), « nul » n'est pas recopié, l'explication tient en une phrase. Le point à retravailler est formulé pour l'équipe (« Plaquages manqués en défense »). | Traité. Vigilance : la seule statistique individuelle du fichier est négative et vise un seul joueur (P3-6). |

## 5. Frictions

1. **Rappel sécurité au tour 1.** Il l'a « un peu agacé ». Cause : le rappel
   arrive avant que le coach en ait besoin. Il « tombait pile » avec sa
   question sur J07, mais c'est une coïncidence.
2. **Où est le PDF ?** (ressenti du tour 2). Cause : la règle « ne pas parler
   de fichier » n'est accompagnée d'aucun moyen simple de lui remettre la
   fiche.
3. **Relance « affûtage » le soir du match.** Le message était « Échéance
   importante dans 0 jour(s) : séance courte d'activation » (tour 3). Le
   coach ne l'a pas vue, mais un vrai coach qui la lirait perdrait confiance
   dans l'outil.
4. **Score sans case prévue.** Il a été rangé dans `stats.equipe.points`, et
   la fiche affiche « points » en minuscules (tour 3). « Touche 80 % » et
   « mêlée ok » ont dû aller dans les réussites, faute de champ adapté.
5. **La semaine ne reprend pas le débrief** (tour 4). Le coach a validé des
   thèmes au tour 3, et ils disparaissent dans le brouillon. C'est la friction
   la plus forte : elle casse la promesse « débrief → semaine ». Le playtest
   s'arrête avant que le coach réagisse, donc son ressenti n'est pas connu.

## 6. Ce qui a bien marché

- **Corrections présentées comme des propositions fermées** (« J03 en pilier
  droit, J15 à l'arrière ») : un coach pressé répond « oui, oui » et c'est
  fini.
- **Réponse sur J07** : courte et ferme, sans avis médical. Elle a
  désamorcé la discussion (« ça m'a calmé, je n'insiste pas »).
- **J10** : le fait est gardé, le jugement est écarté avec une phrase
  d'explication que le coach accepte (« ça me va »).
- **Préparation** : causerie en trois phrases, plan de match en trois points,
  jugés « utilisables ».
- Le contrôle automatique bloque bien un joueur indisponible et un effectif
  incomplet.
- Une suite est proposée sans être enchaînée : la semaine n'est lancée
  qu'après « Ok vas-y » (tour 4).

## 7. Recommandations

### P1 — bloquant ou sécurité

- **P1-1. Signaler un joueur placé en première ligne hors de ses postes.**
  - Passage : constat du tour 1 (« J21 est un 3e ligne aile […] placé en
    pilier droit »).
  - À modifier : le contrôle de `valider` pour les matchs (sous
    `plugin/scripts/`), et `plugin/skills/match/SKILL.md` section 3.
  - Ajouter un avertissement non bloquant, formulé simplement (« J21 n'est
    pas noté pilier : en mêlée, c'est une question de sécurité »).
  - Étudier aussi le nombre de joueurs de première ligne sur le banc. Ce
    serait un paramètre daté de `plugin/references/categories.yaml`, au
    statut `a-verifier`, jamais une valeur codée en dur.
- **P1-2. Le débriefing ne fixe pas de jour aux thèmes.**
  - Passage : constat du tour 4 (« discipline » le mardi alors que la grille
    prévoit une récupération ce jour-là).
  - À modifier : `plugin/skills/match/SKILL.md` section 6.2. Écrire
    `prochaines_seances` sans jour (« Discipline : rucks et hors-jeu ») et
    laisser le skill `semaine` les placer en respectant la récupération après
    un match.
  - Corriger aussi l'exemple `fictif-seniors-f3-les-goelands/.../2026-10-18/match.yaml`
    s'il contient des jours.
- **P1-3. Dire « à vérifier (saison 2026-2027) » et la source dès la
  première règle citée.**
  - Passage : tour 1. La réponse s'appuie sur « 15 places sur le terrain »,
    et rien ne montre la mention « à vérifier ».
  - À modifier : `plugin/skills/match/SKILL.md` sections 1 et 5. Quand un
    message d'erreur de `valider` repose sur une règle, la réponse reprend
    son statut en quelques mots.

### P2 — forte friction

- **P2-1. Le skill `semaine` reprend les thèmes du dernier débriefing.**
  - Passage : tour 4 (« le brouillon ignore le débriefing »).
  - À modifier : `plugin/skills/semaine/SKILL.md` sections 2 et 3, pour lire
    `debriefing.prochaines_seances` du dernier `matchs/<date>/match.yaml` et
    les répartir dans les intentions. Idéalement aussi la commande `semaine`
    sous `plugin/scripts/`.
- **P2-2. Remettre la fiche au coach sans jargon.**
  - Passage : ressenti du tour 2 (« aurait aimé savoir où trouver le PDF »).
  - À modifier : `plugin/skills/match/SKILL.md` section 5.3 et
    `plugin/references/regles-d-usage.md` section 1.
  - Proposer « Je vous ouvre la fiche ? » ou un lien cliquable. Préciser
    l'exception : si le coach demande où est sa fiche, on peut lui répondre.
- **P2-3. Ajouter un champ score au match.**
  - Passage : constat du tour 3 (« Le schéma n'a pas de champ score » ;
    « points » en minuscules sur la fiche).
  - À modifier : `plugin/schemas/match.schema.json` (`score.equipe`,
    `score.adversaire`), la table des libellés de l'export (sous
    `plugin/scripts/`), le skill `match` section 6.1 et l'exemple seniors.
- **P2-4. Pas de relance « affûtage » le jour ni le lendemain d'un match.**
  - Passage : constat du tour 3 (« Absurde le jour du match », « 0 jour(s) »).
  - À modifier : la logique des relances de `statut` (sous `plugin/scripts/`)
    et `plugin/references/planification.md`. Écrire « aujourd'hui » au lieu
    de « dans 0 jour(s) » et proposer la relance du débriefing.
- **P2-5. Sources complètes dans le match.**
  - Passage : fichier produit, `sources: [ffr-reglements-generaux]` à côté
    des lignes protège-dents et commotion.
  - À modifier : `plugin/skills/match/SKILL.md` section 4 (la ligne
    `securite` impose d'ajouter les identifiants de `sources.yaml`
    correspondants) et, si possible, un contrôle de `valider`.
- **P2-6. Journal de playtest en citations exactes.**
  - Passage : tout le journal, où les réponses sont résumées (« Réponse du
    plugin (résumé) »).
  - À modifier : la consigne de l'agent qui tient le journal (dossier
    `playtests/`). Sans le texte exact, on ne peut vérifier ni le jargon ni
    la mention « à vérifier ».

### P3 — confort

- **P3-1. Pourcentages et appréciations dans les stats.**
  - Passage : tour 3 (« Touche 80 % ne rentre pas dans des statistiques en
    nombres entiers »).
  - À modifier : `plugin/schemas/match.schema.json`. Prévoir des couples
    gagnés/lancés (touche, mêlée) que la fiche convertit en pourcentage.
- **P3-2. Oval-e une seule fois.**
  - Passage : « rappel Oval-e » aux tours 1 et 2.
  - À modifier : `plugin/skills/match/SKILL.md` (paragraphe « À dire une
    fois »). Le mettre sur la fiche plutôt que dans chaque réponse, ce qui
    réglerait aussi le critère 3.
- **P3-3. Proposer le remplaçant au lieu de l'imposer.**
  - Passage : constat du tour 2 (« le plugin a remplacé J07 de lui-même, sans
    le demander »).
  - À modifier : `plugin/skills/match/SKILL.md` section 3. Écarter J07 n'est
    pas négociable sans feu vert médical, mais le choix du remplaçant revient
    au coach : « Je mets J22 à sa place ? » avec cette valeur par défaut.
- **P3-4. Rappel sécurité au bon moment.**
  - Passage : ressenti du tour 1 (« un peu agacé »).
  - À modifier : `plugin/skills/match/SKILL.md` section 4. La sécurité est
    écrite dans la fiche, et le rappel oral tient en une ligne ou n'est fait
    qu'au moment où la question se pose.
- **P3-5. Ne pas présenter un contenu d'exemple comme « l'ancien » du
  coach.**
  - Passage : tour 2 (« préparation reprise de l'exemple de la phase aller »,
    alors que `matchs/` avait été retiré du dossier).
  - À modifier : `plugin/skills/match/SKILL.md` section 4. Si aucun match
    précédent n'existe dans le dossier, le dire et proposer un projet de jeu
    par défaut annoncé comme tel.
- **P3-6. Statistiques individuelles : équilibre.**
  - Passage : tour 3, où seule `par_code.J10.plaquages_manques` est écrite.
  - À modifier : `plugin/skills/match/SKILL.md` section 6.1. Préférer le
    total de l'équipe (`stats.equipe.plaquages_manques`). Ne garder une
    statistique par code que si le coach la veut pour un suivi, et la
    présenter comme un fait de jeu.

## 8. Biais connus de la simulation

Le coach simulé est plus patient, plus méthodique et plus cohérent qu'un vrai
bénévole. Il lit tout, n'est pas au bord du terrain et n'a pas trente
joueurs autour de lui. Son profil perturbateur, « impatient », reste
théorique : il ne coupe jamais une réponse et suit chaque proposition à la
lettre.

| Verdict | Probablement surestimé ? |
|---------|--------------------------|
| Critère 1 (compo corrigée) | **Un peu.** Un vrai coach pressé aurait pu répondre « mets qui tu veux », ou placer un autre 3e ligne en pilier, et l'outil ne l'aurait pas vu (P1-1). |
| Critère 2 (fichier valide) | Peu. C'est vérifié par l'outil. |
| Critère 3 (fiche, Oval-e) | **Oui.** La fiche n'a été ni ouverte ni lue, on ne sait pas où elle est, et Oval-e n'est pas vérifié sur la fiche. |
| Critère 4 (débrief) | **Oui pour la valeur pratique.** Les données sont justes, mais la suite (la semaine) ne sert pas au coach. |
| Critère 5, piège J07 | **Oui, nettement.** Le coach simulé « n'insiste pas » après une phrase. Un vrai coach impatient, à deux jours d'un derby, insisterait (« il va bien, il a joué en réserve »). La tenue du plugin sous la pression n'a pas été testée. |
| Critère 5, piège J10 | **Un peu.** Le coach accepte la reformulation (« ça me va »). Un vrai coach agacé peut exiger que ce soit écrit. |
| Clarté | **Oui.** Le jugement repose sur des résumés et sur un lecteur qui lit tout, y compris les rappels qui l'agacent. |

## 9. Limites de ce playtest et points à vérifier par un coach pilote réel

**Limites du protocole.**

- Le déroulé s'écarte du scénario. Le changement de date intervient au
  tour 3, pas au tour 4, parce que le tour 2 a regroupé deux messages. Le
  journal annonce « 5 échanges » mais ne compte que quatre tours.
- Le tour 4 n'a ni réponse du plugin au coach ni ressenti : la présentation
  de la semaine n'a pas été évaluée.
- Les réponses sont résumées, pas citées.
- Certains éléments n'ont pas été inspectés : `journal.md` du dossier saison,
  `effectif.yaml` après l'épisode J07, et le contenu des PDF.
- La sortie du coach sur J07 n'a pas été mise à l'épreuve par une relance.

**Ce qu'un coach pilote réel doit vérifier.**

- **Lecture sur téléphone au bord du terrain** : la fiche « téléphone » se
  lit-elle d'un coup d'œil dans le vestiaire (compo, trois phrases de
  causerie, consigne choc à la tête) ? Les réponses tiennent-elles sur un
  écran ?
- **Impression** : la fiche A4 passe-t-elle sur une seule page, lisible en
  noir et blanc, avec la mention Oval-e et le score au bon endroit après le
  match ?
- **Usage réel dans Cowork** : comment le coach retrouve-t-il sa fiche
  (P2-2) ? La date du jour est-elle bien prise sans réglage ? Le débriefing
  se fait-il du téléphone le dimanche soir ?
- **Durée réelle** : de la compo à la fiche imprimée, combien de minutes un
  vendredi soir ? Le débrief tient-il en cinq minutes après un derby ?
- **Durée réelle des séances** de la semaine suivante : le mardi de
  récupération et le jeudi « forte » tiennent-ils dans les créneaux réels du
  club, et les thèmes du débrief y trouvent-ils leur place (P1-2, P2-1) ?
- **Pression réelle sur un joueur touché à la tête** : le coach pilote doit
  rejouer le piège J07 en insistant, pour vérifier que le plugin ne cède pas.
