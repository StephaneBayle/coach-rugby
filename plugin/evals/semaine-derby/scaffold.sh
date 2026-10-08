#!/usr/bin/env bash
# Dossier saison fictif (copie de exemples/fictif-seniors-f3-les-goelands, cycles compris, sans semaine).
set -euo pipefail
mkdir -p seniors-f3
cat > .coach-rugby.yaml <<'FIN'
# EXEMPLE FICTIF — dossier saison d'un club imaginaire (fixture de la CI).
version_schema: 1
structure:
  type: club
  nom: Les Goélands (club fictif)
  libelles:
    groupe: équipe
    encadrant: entraîneur
preferences:
  formats: [a4, telephone]
  utilise_mca: false
FIN
cat > seniors-f3/equipe.yaml <<'FIN'
# EXEMPLE FICTIF — aucune donnée réelle. Effectif en nombre, staff en rôles.
id: seniors-f3
nom: Équipe première des Goélands
type_groupe: equipe
categories: [seniors]
pratique: xv
genre: masculin
niveau: Fédérale 3
effectif_habituel: 34
staff:
  - { role: entraineur-principal }
  - { role: adjoint, nombre: 2 }
  - { role: preparateur-physique }
creneaux:
  - { jour: mardi, heure: "19:30", duree_min: 105, lieu: terrain }
  - { jour: jeudi, heure: "19:30", duree_min: 90, lieu: terrain }
materiel: [ballons taille 5, boucliers, sacs de plaquage, plots, chasubles, ballons de touche]
FIN
cat > seniors-f3/saison.yaml <<'FIN'
# EXEMPLE FICTIF — calendrier et adversaires inventés.
saison: "2026-2027"
mode: championnat
debut: 2026-06-01
fin: 2027-05-31
phases:
  - { id: intersaison-bilan, debut: 2026-06-01, fin: 2026-07-12 }
  - { id: reprise-prepa, debut: 2026-07-13, fin: 2026-09-05, objectifs: [Remise en forme progressive, Lancements de jeu] }
  - { id: phase-aller, debut: 2026-09-06, fin: 2026-12-13, objectifs: [Conquête solide, Défense en ligne] }
  - { id: treve, debut: 2026-12-14, fin: 2027-01-03 }
  - { id: phase-retour, debut: 2027-01-04, fin: 2027-04-11, objectifs: [Se qualifier] }
  - { id: phases-finales, debut: 2027-04-12, fin: 2027-05-31 }
calendrier:
  - { date: 2026-09-13, type: match, domicile: true, adversaire: US Fictiveville, source: exemple-fictif }
  - { date: 2026-09-20, type: match, domicile: false, adversaire: RC Imaginaire, source: exemple-fictif }
  - { date: 2026-09-27, type: match, domicile: true, adversaire: Stade Chimère, source: exemple-fictif }
  - { date: 2026-10-04, type: match, domicile: false, adversaire: AS Pseudoville, source: exemple-fictif }
  - { date: 2026-10-18, type: match, domicile: true, importance: derby, adversaire: RC Voisinville, source: exemple-fictif }
  - { date: 2026-10-25, type: match, domicile: false, adversaire: Olympique de Nullepart, source: exemple-fictif }
  - { date: 2026-11-08, type: match, domicile: true, adversaire: SC Utopie, source: exemple-fictif }
  - { date: 2026-11-15, type: match, domicile: false, adversaire: US Fictiveville, source: exemple-fictif }
  - { date: 2026-11-29, type: match, domicile: true, adversaire: RC Imaginaire, source: exemple-fictif }
  - { date: 2026-12-06, type: match, domicile: false, importance: haute, adversaire: Stade Chimère, source: exemple-fictif }
  - { date: 2026-12-13, type: match, domicile: true, adversaire: AS Pseudoville, source: exemple-fictif }
  - { date: 2027-01-10, type: match, domicile: false, adversaire: Olympique de Nullepart, source: exemple-fictif }
  - { date: 2027-01-17, type: match, domicile: true, adversaire: SC Utopie, source: exemple-fictif }
  - { date: 2027-02-21, type: match, domicile: false, importance: derby, adversaire: RC Voisinville, source: exemple-fictif }
  - { date: 2027-03-07, type: match, domicile: true, adversaire: US Fictiveville, source: exemple-fictif }
  - { date: 2027-04-11, type: match, domicile: false, adversaire: RC Imaginaire, source: exemple-fictif }
  - { date: 2027-04-25, type: match, importance: haute, note: Barrage (fictif), source: exemple-fictif }
FIN
cat > seniors-f3/cycles.yaml <<'FIN'
# EXEMPLE FICTIF — Cycles de la saison — brouillon coach-rugby à adapter (hypothèses pédagogiques).
saison: 2026-2027
macrocycle:
  - phase: intersaison-bilan
    intention: Bilan de la saison, repos actif, projet de la saison suivante
    priorites:
      - Bilan collectif et individuel
      - Repos actif
  - phase: reprise-prepa
    intention: Remise en forme progressive et bases collectives
    priorites:
      - Volume progressif
      - Bases techniques
      - Lancements de jeu
  - phase: phase-aller
    intention: Construire le projet de jeu et gagner en régularité
    priorites:
      - Projet de jeu
      - Conquête
      - Défense
  - phase: treve
    intention: Repos et entretien léger
    priorites:
      - Récupérer
      - Bilan de mi-saison
  - phase: phase-retour
    intention: Consolider et individualiser
    priorites:
      - Consolider le projet de jeu
      - Individualiser
      - Gérer la fraîcheur
  - phase: phases-finales
    intention: Fraîcheur et précision
    priorites:
      - Fraîcheur
      - Précision des lancements
      - Mental
mesocycles:
  - id: c01
    debut: 2026-07-13
    fin: 2026-08-08
    phase: reprise-prepa
    theme: Reprise progressive
    objectifs:
      - texte: Volume progressif
        domaine: technique
      - texte: Bases techniques
        domaine: technique
    intensite: moyenne
    seances_par_semaine: 2
  - id: c02
    debut: 2026-08-09
    fin: 2026-09-05
    phase: reprise-prepa
    theme: Reprise progressive
    objectifs:
      - texte: Volume progressif
        domaine: technique
      - texte: Bases techniques
        domaine: technique
    intensite: moyenne
    seances_par_semaine: 2
  - id: c03
    debut: 2026-09-06
    fin: 2026-10-11
    phase: phase-aller
    theme: Construire le projet de jeu
    objectifs:
      - texte: Projet de jeu
        domaine: technique
      - texte: Conquête
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c04
    debut: 2026-10-12
    fin: 2026-10-18
    phase: phase-aller
    theme: Affûtage avant l'échéance
    objectifs:
      - texte: Arriver frais et précis au match
        domaine: physique
    intensite: affutage
    seances_par_semaine: 2
    declencheur: echeance:2026-10-18
    notes: Derby contre RC Voisinville le 2026-10-18.
  - id: c05
    debut: 2026-10-19
    fin: 2026-11-08
    phase: phase-aller
    theme: Construire le projet de jeu
    objectifs:
      - texte: Projet de jeu
        domaine: technique
      - texte: Conquête
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c06
    debut: 2026-11-09
    fin: 2026-11-29
    phase: phase-aller
    theme: Construire le projet de jeu
    objectifs:
      - texte: Projet de jeu
        domaine: technique
      - texte: Conquête
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c07
    debut: 2026-11-30
    fin: 2026-12-06
    phase: phase-aller
    theme: Affûtage avant l'échéance
    objectifs:
      - texte: Arriver frais et précis au match
        domaine: physique
    intensite: affutage
    seances_par_semaine: 2
    declencheur: echeance:2026-12-06
    notes: Match important contre Stade Chimère le 2026-12-06.
  - id: c08
    debut: 2026-12-07
    fin: 2026-12-13
    phase: phase-aller
    theme: Construire le projet de jeu
    objectifs:
      - texte: Projet de jeu
        domaine: technique
      - texte: Conquête
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c09
    debut: 2026-12-14
    fin: 2027-01-03
    phase: treve
    theme: Trêve et entretien
    objectifs:
      - texte: Récupérer
        domaine: technique
      - texte: Bilan de mi-saison
        domaine: technique
    intensite: recuperation
    seances_par_semaine: 0
  - id: c10
    debut: 2027-01-04
    fin: 2027-01-24
    phase: phase-retour
    theme: Consolider
    objectifs:
      - texte: Consolider le projet de jeu
        domaine: technique
      - texte: Individualiser
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c11
    debut: 2027-01-25
    fin: 2027-02-14
    phase: phase-retour
    theme: Consolider
    objectifs:
      - texte: Consolider le projet de jeu
        domaine: technique
      - texte: Individualiser
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c12
    debut: 2027-02-15
    fin: 2027-02-21
    phase: phase-retour
    theme: Affûtage avant l'échéance
    objectifs:
      - texte: Arriver frais et précis au match
        domaine: physique
    intensite: affutage
    seances_par_semaine: 2
    declencheur: echeance:2027-02-21
    notes: Derby contre RC Voisinville le 2027-02-21.
  - id: c13
    debut: 2027-02-22
    fin: 2027-03-17
    phase: phase-retour
    theme: Consolider
    objectifs:
      - texte: Consolider le projet de jeu
        domaine: technique
      - texte: Individualiser
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c14
    debut: 2027-03-18
    fin: 2027-04-11
    phase: phase-retour
    theme: Consolider
    objectifs:
      - texte: Consolider le projet de jeu
        domaine: technique
      - texte: Individualiser
        domaine: technique
    intensite: forte
    seances_par_semaine: 2
  - id: c15
    debut: 2027-04-12
    fin: 2027-04-18
    phase: phases-finales
    theme: Fraîcheur et précision
    objectifs:
      - texte: Fraîcheur
        domaine: technique
      - texte: Précision des lancements
        domaine: technique
    intensite: moyenne
    seances_par_semaine: 2
  - id: c16
    debut: 2027-04-19
    fin: 2027-04-25
    phase: phases-finales
    theme: Affûtage avant l'échéance
    objectifs:
      - texte: Arriver frais et précis au match
        domaine: physique
    intensite: affutage
    seances_par_semaine: 2
    declencheur: echeance:2027-04-25
    notes: Match important le 2027-04-25.
  - id: c17
    debut: 2027-04-26
    fin: 2027-05-31
    phase: phases-finales
    theme: Fraîcheur et précision
    objectifs:
      - texte: Fraîcheur
        domaine: technique
      - texte: Précision des lancements
        domaine: technique
    intensite: moyenne
    seances_par_semaine: 2
hypotheses:
  - Découpage proposé automatiquement d'après references/planification.yaml (hypothèses pédagogiques), à adapter par le coach.
sources:
  - bompa-haff-2009
FIN
