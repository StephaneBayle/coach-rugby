#!/usr/bin/env bash
# Dossier saison fictif (copie de exemples/fictif-m10-les-ecureuils, sans séance, effectif de 13 codes).
set -euo pipefail
mkdir -p m10
cat > .coach-rugby.yaml <<'FIN'
# EXEMPLE FICTIF — dossier saison d'un club imaginaire (fixture de la CI).
version_schema: 1
structure:
  type: club
  nom: Les Écureuils (club fictif)
  libelles:
    groupe: équipe
    encadrant: éducateur
preferences:
  formats: [a4, telephone]
  utilise_mca: true
FIN
cat > m10/equipe.yaml <<'FIN'
# EXEMPLE FICTIF — aucune donnée réelle. Effectif en nombre, staff en rôles.
id: m10
nom: M10 des Écureuils
type_groupe: equipe
categories: [m10]
pratique: ecole-de-rugby
genre: mixte
effectif_habituel: 16
staff:
  - { role: educateur, nombre: 2 }
  - { role: referent-edr }
creneaux:
  - { jour: mercredi, heure: "14:00", duree_min: 75, lieu: demi-terrain }
materiel: [ballons taille 4, plots, chasubles, ceintures à flag, boucliers mousse]
FIN
cat > m10/saison.yaml <<'FIN'
# EXEMPLE FICTIF — dates de plateaux inventées, à ne pas utiliser comme calendrier réel.
saison: "2026-2027"
mode: plateaux
debut: 2026-07-01
fin: 2027-06-30
zone_vacances: { valeur: A, statut: perso, note: Zone choisie pour l'exemple. }
phases:
  - { id: intersaison-bilan, debut: 2026-07-01, fin: 2026-08-23 }
  - { id: reprise-prepa, debut: 2026-08-24, fin: 2026-09-26, objectifs: [Accueillir les nouveaux, Jouer en toucher + 2 secondes] }
  - { id: plateaux-automne, debut: 2026-09-27, fin: 2026-12-18, objectifs: [Avancer et soutenir, Découvrir le jeu au contact] }
  - { id: treve, debut: 2026-12-19, fin: 2027-01-03 }
  - { id: plateaux-printemps, debut: 2027-01-04, fin: 2027-04-30, objectifs: [Rugby éducatif à 7, Plaquer en sécurité] }
  - { id: tournois-fin-saison, debut: 2027-05-01, fin: 2027-06-30 }
calendrier:
  - { date: 2026-10-03, type: plateau, lieu: Terrain fictif A, source: exemple-fictif }
  - { date: 2026-10-17, type: plateau, domicile: true, source: exemple-fictif }
  - { date: 2026-10-24, type: vacances, note: Vacances de la Toussaint (dates fictives). }
  - { date: 2026-11-14, type: plateau, source: exemple-fictif }
  - { date: 2026-11-28, type: plateau, source: exemple-fictif }
  - { date: 2026-12-12, type: plateau, importance: haute, note: Plateau de Noël, source: exemple-fictif }
  - { date: 2027-01-23, type: plateau, source: exemple-fictif }
  - { date: 2027-02-06, type: plateau, source: exemple-fictif }
  - { date: 2027-03-13, type: plateau, source: exemple-fictif }
  - { date: 2027-03-27, type: plateau, source: exemple-fictif }
  - { date: 2027-04-10, type: plateau, source: exemple-fictif }
  - { date: 2027-05-15, type: tournoi, importance: haute, note: Tournoi du club, source: exemple-fictif }
  - { date: 2027-06-05, type: tournoi, source: exemple-fictif }
FIN
{
  echo "# EXEMPLE FICTIF — effectif en codes, aucun nom."
  echo "equipe: m10"
  echo "joueurs:"
  for i in $(seq -w 1 13); do echo "  - { code: J$i, disponible: true }"; done
} > m10/effectif.yaml
