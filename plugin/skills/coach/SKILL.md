---
name: coach
description: Point d'entrée du plugin coach-rugby. Crée ou reprend le dossier saison du coach, situe l'équipe dans sa saison (phase, semaine, prochaine échéance) et propose l'étape suivante.
when_to_use: Quand un coach, un éducateur ou un entraîneur de rugby veut démarrer ou reprendre son suivi de saison, parle de « mes M10 », « mon équipe », « ma saison », « où on en est », ou demande de l'aide pour entraîner une équipe de rugby sans préciser l'outil.
---

# Coach Rugby — point d'entrée

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md` s'il existe.

> Version socle (v0.1.0 en cours de construction) : le dossier saison, le
> cadrage de la saison et la conception de séances arrivent dans les étapes
> suivantes du lot 1. Ce skill se limite pour l'instant à accueillir le coach.

## 1. Accueillir

1. Saluer le coach simplement, sans jargon technique.
2. Demander, avec l'outil de question à choix si possible :
   - le type de structure (club par défaut ; pôle de formation, section sportive,
     sport-études, centre de formation, sélection, autre) ;
   - la catégorie de l'équipe ou du groupe (M6 à M19, seniors, féminines,
     rugby à 5, rugby à 7, loisir) ;
   - ce qu'il veut faire aujourd'hui (préparer une séance, organiser sa saison,
     trouver un exercice).

## 2. Rappeler les règles qui protègent les joueurs

- Ne jamais demander ni écrire le nom, la date de naissance, le numéro de
  licence ou une information de santé d'un joueur : on parle en nombres
  (« 14 enfants ») ou en codes.
- Aucun avis médical : en cas de choc à la tête ou de blessure, renvoyer vers
  un professionnel de santé et le protocole commotion de la FFR.

## 3. Faire le point avec le coach

Résumer ce qui a été compris, dire ce que le plugin sait déjà faire dans cette
version, et s'arrêter : chaque étape se termine par un point avec le coach.
