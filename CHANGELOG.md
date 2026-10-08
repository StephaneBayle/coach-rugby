# Journal des versions

Ce journal est écrit pour les coachs : il dit ce qui change pour vous, pas
comment c'est programmé. Format inspiré de
[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions selon
[SemVer](https://semver.org/lang/fr/).

## [Non publié]

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
