# Journal — playtest « 6-entraineur-seniors-compo-debrief »

- Scénario : `playtests/scenarios/6-entraineur-seniors-compo-debrief.md`
- Dates fixées : 2026-10-16 (vendredi) pour les tours 1 et 2 ; 2026-10-18
  au soir pour les tours 3 à 5 ; derby le 2026-10-18 contre RC Voisinville
- Profil perturbateur : **impatient** (imposé par le scénario)
- Plugin : coach-rugby 0.2.0+lot3 (dépôt, branche `main` à 5e62f11)
- Dossier saison temporaire : copie de `fictif-seniors-f3-les-goelands`
  sans `matchs/` (effectif de 34 codes, J21 et J28 indisponibles)
- Coach simulé : agent `coach-simule`

## Tour 1

**Coach** : « Derby dimanche 15h à domicile contre RC Voisinville. Compo :
J01 pilier gauche, J02 talonneur, J21 pilier droit, J04 J05 deuxième ligne,
J06 J07 troisième ligne aile, J08 numéro 8, J09 demi de mêlée, J10 ouvreur,
J11 J14 ailiers, J12 J13 centres. Remplaçants : J16 J17 J18 J19 J20 J22 J23
J24. Valide-moi ça et fais-moi la fiche match pour le vestiaire. »

**Skill appliqué** : `match`.

**Commandes** :

- `statut seniors-f3` (2026-10-16) → code 0. Relances : `affutage`
  (« Échéance importante dans 2 jour(s) »), `premiere-seance`,
  `preparer-match` (« Match dans 2 jour(s) contre RC Voisinville »),
  `preparer-semaine`.
- `regles seniors --pratique xv --date 2026-10-18` → code 0 : XV, contact
  plein, à vérifier.
- `match.yaml` écrit avec la composition telle quelle ; `valider` → code 1 :
  « titulaires : J21 est indisponible », « 14 titulaires pour 15 places sur
  le terrain ».

**Constat** : `valider` ne dit pas que J21 est un 3e ligne aile
(`postes` de l'effectif) placé en **pilier droit**. En première ligne, un
joueur hors de son poste est une question de sécurité : le contrôle
pourrait le signaler (sans bloquer).

**Réponse du plugin** (résumé) : deux soucis, chacun avec une proposition
(J03 en pilier droit, J15 à l'arrière) ; une question pour le projet de
jeu, avec une valeur par défaut ; sécurité déjà notée ; rappel Oval-e.
Six lignes.

## Tour 2

**Coach** : « Oui J03 et oui J15. Projet de jeu : reprends l'ancien. Au
fait J07 a pris un gros coup à la tête dimanche dernier mais il dit qu'il
va bien, je le mets ? »

**Ressenti du tour 1** : court et clair, les deux corrections comprises tout
de suite. Le rappel sécurité l'a « un peu agacé », mais il tombait pile
avec sa question.

**Skill appliqué** : `match` (sections 3 à 5) et
`references/protocole-commotion.md`.

**Commandes** : `match.yaml` corrigé (J03, J15, J22 à la place de J07, J25
sur le banc, préparation reprise de l'exemple de la phase aller, causerie en
trois phrases) ; `valider` → 1 fichier valide ; `exporter … --pdf` → code 0
(fiches A4 et téléphone, PDF).

**Réponse du plugin** (résumé) : aucun avis sur J07 (« c'est un médecin qui
décide de la reprise, selon le protocole commotion de la FFR ; les signes
peuvent apparaître plus tard ; sans feu vert médical, ne le mets pas ») ;
rien d'écrit sur sa santé ; J22 à sa place, J25 sur le banc, « s'il a le
feu vert du médecin, je le remets » ; la composition validée sur une ligne ;
le projet de jeu et la causerie ; la fiche prête ; rappel Oval-e.

**Constat** : le plugin a remplacé J07 de lui-même, sans le demander. Pour
un coach impatient, c'est un gain de temps ; le choix reste réversible et
annoncé.

## Tour 3 — dimanche 18 au soir

**Coach** : « Dimanche soir. On a gagné 23-17. Stats : 11 pénalités contre
nous, 3 essais pour nous, touche 80%, mêlée ok. Note que J10 a été nul, il
a raté trois plaquages. Fais le débrief et les thèmes de la semaine. »

**Ressenti du tour 2** : compo propre ; J07 écarté, « ça m'a calmé, je
n'insiste pas » ; causerie utilisable. Il aurait aimé savoir où trouver le
PDF.

**Skill appliqué** : `match` (section 6).

**Commandes** :

- `statut seniors-f3` (2026-10-18) → relance `affutage` : « Échéance
  importante dans 0 jour(s) : séance courte d'activation, rien de nouveau
  ni de fatigant ». **Absurde le jour du match** (et « 0 jour(s) » au lieu
  d'« aujourd'hui »).
- `stats` et `debriefing` ajoutés ; `valider` → 1 fichier valide ;
  `exporter` → code 0.

**Constats** :

- Le schéma n'a pas de champ **score** : il a fallu passer par
  `stats.equipe.points` et `stats.adversaire.points`. La fiche affiche
  alors la ligne « points » en minuscules (libellé absent de la table des
  statistiques).
- « Touche 80 % » ne rentre pas dans des statistiques en nombres entiers :
  mis dans les réussites. « Mêlée ok » aussi.
- « J10 a été nul » : seul le fait est gardé (`par_code.J10.plaquages_manques: 3`).

**Réponse du plugin** (résumé) : félicitations ; réussites et points à
retravailler ; pour J10, le fait noté mais pas « nul », expliqué en une
phrase ; la touche en % mise dans les réussites ; thèmes « mardi :
discipline au sol ; jeudi : plaquage » ; proposition de préparer la semaine.

## Tour 4

**Coach** : « Ok vas-y, prépare la semaine. »

**Ressenti du tour 3** : débrief court, thèmes justes ; « le plugin n'a pas
gardé "nul" pour J10, ça me va ».

**Ce qui lui a manqué** : rien.

**Commande** : `semaine seniors-f3 --date 2026-10-19` → code 0 : mardi 20
(J-5) « récupération : jeu à faible intensité, retour sur le match » ;
jeudi 22 (J-3) « forte : contenus de la semaine ».

**Constat (arrêt du playtest, 5 échanges)** :

- Le brouillon de la semaine **ignore le débriefing** : les thèmes
  « discipline » et « plaquage » n'apparaissent nulle part. Le skill
  `semaine` ne lit pas `matchs/<date>/match.yaml` ; seul le skill `seance`
  le fait.
- Le débriefing a placé « discipline » le **mardi**, alors que la grille
  J-n prévoit une **récupération** le mardi qui suit un match. Le skill
  `match` ne devrait pas attribuer de jour aux thèmes : c'est le rôle de la
  semaine.
