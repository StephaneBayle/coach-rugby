# Journal des versions

Ce journal est écrit pour les coachs : il dit ce qui change pour vous, pas
comment c'est programmé. Format inspiré de
[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions selon
[SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Planification : le plugin propose un découpage de votre saison en cycles
  d'environ 4 semaines (thème, intensité prévue), avec un bloc d'affûtage
  avant chaque match important, et repère les changements de forme de jeu
  de l'école de rugby (par exemple le passage des M10 au rugby éducatif à 7
  en janvier). Il propose aussi le plan de chaque semaine : séances, jours
  avant l'échéance, intensité et intention de chaque séance.
- `/coach-rugby:planifier` et `/coach-rugby:semaine` : ces plans se
  construisent avec vous, puis la séance du jour reprend l'intention et
  l'intensité prévues.
- Fiche de la semaine (A4 et téléphone, PDF) à partager au staff : les sept
  jours, les jours avant l'échéance, l'intensité prévue (en texte et en
  pictogramme, lisible en noir et blanc), les cycles autour de la semaine.
- Relances : semaine à préparer, séance prévue demain à préparer, fin de
  cycle, changement de forme de jeu à venir (école de rugby), reprise
  progressive après la trêve.

- Trois nouveaux exercices : ruck éducatif progressif, jeu au contact à 5
  contre 5 (école de rugby), lancements de jeu sans opposition.

### Amélioré (après quatre tests avec des coachs simulés)

- Chaque séance présentée dit comment on joue chaque jeu, la mise en place,
  le matériel en quantités, les règles « à vérifier » et une ligne sécurité
  complète (protège-dents, choc à la tête, avis médical).
- Le plugin refuse une séance avec contact qui ne rappelle pas la conduite
  en cas de choc à la tête, ou avec du plaquage sans parler du protège-dents.
- Moins de jargon, un parcours rapide pour les coachs débutants ou pressés,
  et toute valeur supposée (effectif, matériel, dates) est annoncée.
- Maladie chronique d'un joueur : consigne écrite des parents, et en cas de
  détresse, appeler le 15 ou le 112.
- Affûtage aussi avant un tournoi important ; changement de forme de jeu
  annoncé plus tôt (avant la trêve).
- Le texte pour Mon Coach Assistant n'est produit que si votre club l'utilise.

### Corrigé

- La protection des données bloquait à tort des phrases comme « le cycle se
  termine le 18/12 », prises pour une date de naissance.

## [0.1.0] — 2026-10-08

### Ajouté

- Socle du plugin : installation depuis la marketplace, premier accueil du
  coach (`/coach-rugby:coach`).
- Dossier saison sur votre ordinateur (`~/Rugby-Saisons`) : vos équipes ou
  groupes, leur saison et leur calendrier. Structures hors club prévues
  (pôles, sections sportives, sport-études).
- `/coach-rugby:saison` : phases de la saison (championnat, plateaux d'école
  de rugby, rythme scolaire), calendrier des matchs, plateaux et tournois ;
  reprise d'un calendrier copié depuis Mon Coach Assistant.
- Le plugin sait où vous en êtes (phase, semaine, prochaine échéance) et vous
  relance au bon moment : affûtage avant un derby, préparation de la trêve,
  logistique d'un plateau.
- Règles de jeu du moment selon la catégorie et le mois, d'après le Cahier
  des écoles de rugby 2026-2027 de la FFR (à vérifier selon votre comité).
- Protection des joueurs : dans Claude Code, le plugin refuse de publier sur
  GitHub un nom de joueur protégé, un téléphone, un e-mail, une date de
  naissance ou un numéro de licence. En début de session, il rappelle où en
  est chaque équipe.
- `/coach-rugby:exercices` : une bibliothèque libre de 24 exercices originaux
  (échauffement, passes, jeux réduits, contact progressif, jeu au pied,
  défense, rugby à 5, retour au calme), chacun avec son schéma de terrain
  imprimable en noir et blanc. Le plugin ne propose que les exercices permis
  par les règles de jeu du moment pour votre catégorie.
- Vous pouvez adapter une fiche, créer la vôtre et la proposer à la
  bibliothèque commune (licence CC BY-SA).
- `/coach-rugby:seance` : une séance construite pour votre groupe (nombre de
  joueurs, durée, terrain, moment de la saison, prochaine échéance). Le
  plugin refuse un exercice trop dur pour la catégorie ce mois-ci. Vous
  pouvez coller le résultat d'un sondage de présence de Mon Coach Assistant :
  seul le nombre de présents est gardé.
- `/coach-rugby:exporter` : fiche A4 à imprimer, fiche téléphone pour le bord
  du terrain (fonctionne hors connexion), schémas de terrain, PDF, et texte à
  coller dans Mon Coach Assistant.
- `/coach-rugby:relire` : quatre relecteurs passent votre séance au crible
  (sécurité des jeunes, règlement de la catégorie, sources, protection des
  données) et vous disent ce qu'il faut corriger avant de l'utiliser.
- Commotion : le plugin rappelle toujours la conduite à tenir (sortie
  immédiate et définitive, avis médical) et ne donne jamais d'avis médical.
