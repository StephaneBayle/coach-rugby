# Feuille de route

Le projet avance par **lots**. Chaque lot se termine par une version publiée et
un point avec le mainteneur avant le lot suivant. Le suivi détaillé est dans le
[tableau de projet](https://github.com/users/StephaneBayle/projects/16) et les
[jalons](https://github.com/StephaneBayle/coach-rugby/milestones).

| Lot | Version | Contenu | État |
|---|---|---|---|
| 1 | 0.1.0 | Socle et première séance de bout en bout : dossier saison, cadrage de la saison, conception de séance, bibliothèque de 24 exercices, schémas de terrain, fiches HTML/PDF (A4 et téléphone), relecteurs, garde RGPD, passerelles Mon Coach Assistant par copier-coller | publié le 2026-10-08 |
| 2 | 0.2.0 | Planification (macrocycle, mésocycles, semaine type, affûtage), relances proactives complètes, playtests simulés | publié le 2026-10-08 |
| 3 | 0.3.0 | Effectif en codes, présences, progrès, composition, fiche match, rotation du temps de jeu, préparation et débriefing de match, tableaux Excel et CSV | publié le 2026-10-08 |
| 4 | 0.4.0 | Charge d'entraînement (RPE), préparation physique, prévention, rappel commotion et retour au jeu | à venir |
| 5 | 0.5.0 | Communication (convocations, messages aux parents, comptes rendus) et accompagnement pédagogique | à venir |
| 6 | 0.6.0 | Documentation en ligne, bêta avec des coachs pilotes | à venir |
| 7 | 0.7.0 | Structures hors club : pôles, sections sportives, sport-études, centres de formation | à venir |
| 8 | 0.8.0 | Capitalisation des leçons, contributions d'exercices facilitées | à venir |
| 9 | 1.0.0 | Révision des règles pour 2027-2028, corrections des pilotes, contact FFR (export ou API de Mon Coach Assistant) | à venir |

## Lot 1 — étapes

| Étape | Contenu | État |
|---|---|---|
| 0 | Vérifications de la documentation ([structure.md](structure.md)) | fait |
| 1 | Socle du dépôt : manifestes, licences, `.github/`, CI | fait |
| 2 | Dossier saison : schémas, références, CLI, exemples, skills `coach` et `saison` | fait |
| 3 | Garde RGPD : hooks et contrôle CI | fait |
| 4 | Bibliothèque d'exercices et schémas de terrain | fait |
| 5 | Séance et export (HTML, PDF, SVG, texte pour Mon Coach Assistant) | fait |
| 6 | Relecteurs et évals | fait (évals écrites, non lancées : accès anticipé) |
| 7 | Publication de la version 0.1.0 | fait |

## Lot 2 — étapes

| Étape | Contenu | État |
|---|---|---|
| 1 | Modèle de planification : cycles, semaine, contrôles, CLI | fait |
| 2 | Skills `planifier` et `semaine`, relances complètes | fait |
| 3 | Fiche semaine (A4 et téléphone) | fait |
| 4 | Outil de playtest (développement) | fait |
| 5 | Quatre playtests simulés et corrections ([synthèse](playtests/README.md)) | fait |
| 6 | Publication de la version 0.2.0 | fait |

## Lot 3 — étapes

| Étape | Contenu | État |
|---|---|---|
| 1 | Effectif en codes, table locale des prénoms, présences, progrès, garde RGPD étendue | fait |
| 2 | Match et temps de jeu équitable : schéma, contrôles, rotation | fait |
| 3 | Tableaux Excel et CSV, fiche match, feuille de présence | fait |
| 4 | Skills `effectif` et `match`, relances du suivi, évals | fait |
| 5 | Deux playtests simulés et corrections ([synthèse](playtests/README.md)) | fait |
| 6 | Publication de la version 0.3.0 | en cours |
