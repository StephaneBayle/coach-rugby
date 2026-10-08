# Prompt — Création d'un plugin Claude pour coachs de rugby amateur

> À utiliser dans Claude Code **en mode plan**, depuis `~/Developer/plugin-rugby`.

---

## Rôle et mode de travail

Tu es l'architecte et le développeur principal d'un plugin Claude destiné aux coachs de rugby amateur en France. Tu travailles **en mode plan** : tu ne crées aucun fichier tant qu'un lot n'a pas été validé.

Ordre de travail imposé :

1. **Explorer** (lecture seule) :
   - la documentation officielle des plugins Claude Code et Cowork : manifeste, skills, commandes, agents, hooks, `userConfig`, marketplace, `claude plugin eval` ;
   - le plugin de référence `~/Developer/plugin-wargame` (dépôt `StephaneBayle/plugin-wargame`) : son `CLAUDE.md`, `plugin/`, `.claude-plugin/marketplace.json`, `.github/workflows/ci.yml`, `tests/`, `docs/structure.md`.
2. **Me poser tes questions** (outil AskUserQuestion) sur tout ce qui reste ambigu après l'exploration. Ne devine pas ce qui relève de ma décision.
3. **Proposer un plan découpé en lots successifs**. Chaque lot doit être livrable, testable et validé par moi avant le suivant. Détaille le lot 1 et donne les autres en grandes lignes.
4. À la fin de chaque lot : bilan (fait, testé, reporté), mise à jour de la feuille de route, puis nouveau passage en mode plan pour le lot suivant.

---

## Contexte

- **Utilisateurs** : tous les coachs et éducateurs de rugby **amateur en France**, souvent bénévoles et peu techniciens. Le staff peut être composé d'un entraîneur principal, d'adjoints, d'un préparateur physique et d'un référent école de rugby.
- **Catégories couvertes dès la v1** :
  - école de rugby (M6 à M14) ;
  - jeunes (M16 à M19) ;
  - seniors (Régionale, Fédérale) ;
  - pratiques féminines, rugby à 5, rugby à 7 et loisir.
- **Surfaces d'usage** :
  - Cowork / Claude desktop (prioritaire) ;
  - Claude Code ;
  - consultation **mobile au bord du terrain**, d'où des sorties courtes et lisibles sur téléphone.
- **Mission** : accompagner le coach **tout au long de la saison**, de l'intersaison au bilan.
- **Distribution** : dépôt GitHub **public**, installation en une commande via une marketplace.
- **Échéance** : aucune. On avance lot par lot, en privilégiant la qualité.

---

## Principes directeurs (à reporter dans le `CLAUDE.md` du dépôt et dans les skills)

1. **Modèle d'architecture : `plugin-wargame`.** Reprends ses patterns éprouvés :
   - un skill point d'entrée qui crée ou reprend un dossier et oriente vers l'étape suivante ;
   - des skills chaînés par étape ;
   - des sous-agents relecteurs spécialisés et des sous-agents de playtest ;
   - des hooks de confidentialité, une configuration par `userConfig` et des schémas de données ;
   - un dossier `plugin/` livré, séparé du développement à la racine ;
   - des exemples 100 % fictifs, des gabarits `*.exemple.*` et une CLI utilitaire si elle est utile.

   Ne copie pas le vocabulaire wargame : adapte-le au rugby.
2. **Tout en français** : noms de commandes et de skills, fichiers, identifiants, contenus, messages de commit et documentation.
3. **Dossier saison persistant et local** :
   - l'état de chaque équipe (effectif, calendrier, cycles, séances faites, présences, charge, matchs, bilans) vit en fichiers Markdown/YAML **hors du dépôt**, dans un dossier configurable par `userConfig` ;
   - ce dossier est relu à chaque session ;
   - un coach peut gérer **plusieurs équipes**.
4. **Posture proactive, calée sur la saison.** Le plugin sait en quelle phase et quelle semaine on est, et il suggère la suite : ajuster la charge avant un match important, anticiper la trêve, lancer le bilan de mi-saison, préparer les tournois d'école de rugby.

   Phases à modéliser, en les validant avec moi :
   - intersaison et bilan ;
   - reprise et préparation physique ;
   - phase aller ;
   - trêve ;
   - phase retour ;
   - phases finales.
5. **Sources faisant autorité**, toujours **citées et datées** :
   - FFR : règlements généraux, règles adaptées par catégorie, guides école de rugby, référentiels de formation ;
   - World Rugby : lois du jeu, santé et sécurité du joueur ;
   - contenus propres au coach ou au club ;
   - littérature pédagogique : approches par le jeu, mouvement général, sciences du sport.

   Les règles FFR changent chaque saison. Ce sont des **paramètres datés à vérifier**, jamais des valeurs codées en dur. Ce qui n'est pas sourcé est présenté comme une **hypothèse**.
6. **Sécurité et santé** :
   - **aucun diagnostic ni avis médical** ;
   - le protocole commotion FFR est rappelé et renvoie systématiquement vers les professionnels de santé ;
   - les contenus pour les jeunes respectent les règles et les charges adaptées à l'âge.
7. **Confidentialité stricte (RGPD, mineurs, santé)** :
   - aucune donnée nominative ni médicale de joueur dans le dépôt, les exemples, les issues, les PR, les commits ou les releases ;
   - des **hooks bloquants** empêchent toute fuite vers le dépôt ou GitHub, sur le modèle de la garde des noms protégés de `plugin-wargame` ;
   - les exemples utilisent des équipes et des joueurs fictifs.
8. **Aucune intégration externe en v1.** Uniquement des fichiers locaux. L'architecture doit cependant permettre d'ajouter plus tard des connecteurs (Calendar, Drive, Gmail, Notion).

---

## Périmètre fonctionnel de la v1

À répartir dans les lots. Propose l'ordre en le justifiant.

| Domaine | Fonctions attendues |
|---|---|
| **Planification et séances** | Macrocycle de saison, mésocycles, microcycle hebdomadaire. Conception de séances (objectifs, échauffement, ateliers, jeux, retour au calme) adaptées à la catégorie, à l'effectif présent, à la durée et au matériel. Bibliothèque d'exercices et de jeux classés par thème, catégorie et niveau. |
| **Effectif et match** | Présences et disponibilités, suivi individuel et progression. Composition d'équipe, feuille de match, rotation du temps de jeu chez les jeunes. Préparation de match (projet de jeu, adversaire, plan de match, causerie). Analyse après le match et débriefing. |
| **Santé et préparation physique** | Suivi de la charge (RPE), prévention, préparation physique par catégorie. Rappel du protocole commotion et du retour au jeu, sans avis médical. |
| **Communication et formation** | Convocations, messages aux parents et aux joueurs (textes prêts à copier), comptes rendus. Accompagnement pédagogique du coach : pédagogie selon l'âge, gestion de groupe, valeurs. |

**Formats de sortie** :
- **PDF imprimable** : fiches séance, plans de match, feuilles de présence ;
- **schémas de terrain SVG** : exercices, lancements de jeu ;
- **Excel** : charge, présences, temps de jeu ;
- **Markdown / HTML** : consultation rapide, y compris sur mobile.

---

## Dépôt GitHub (à mobiliser pleinement)

- **Nom** : propose trois noms de plugin et de dépôt, avec leurs avantages, et je choisis. Le dossier local s'appelle `plugin-rugby`.
- **Visibilité et licences** : dépôt public. Le code est sous **MIT**, les contenus pédagogiques sous **CC BY-SA 4.0**. Le README et un fichier `LICENCES.md` expliquent cette double licence.
- **Issues** : modèles « bug », « idée d'exercice ou de jeu », « retour de coach », « erreur de règlement ».
- **Labels** : par catégorie d'âge, par phase de saison et par domaine.
- **Milestones** : un par lot ou par version.
- **Projects** : tableau de feuille de route.
- **PR** : une branche et une PR par lot ou par fonctionnalité, revue par Claude, avec un modèle de PR et une checklist (confidentialité, sources datées, sécurité des jeunes).
- **Actions (CI)** :
  - validation du manifeste et de la marketplace ;
  - lint Markdown/YAML ;
  - validation des schémas du dossier saison et des fiches exercices ;
  - vérification de l'absence de données personnelles ;
  - évaluations `claude plugin eval`.
- **Releases** : versionnement sémantique, `CHANGELOG.md`, notes de version rédigées pour des coachs non techniciens.
- **Marketplace** : `.claude-plugin/marketplace.json` pour une installation en une commande, avec une procédure documentée pour Cowork et pour Claude Code.
- **Discussions** : communauté de coachs (questions, partage d'exercices, retours de saison).
- **Pages** : documentation utilisateur (prise en main, une page par commande, FAQ, exemples fictifs).
- **Contributions de contenu** :
  - par PR, avec un **gabarit de fiche exercice** ;
  - la CI vérifie le format ;
  - les sous-agents relecteurs (sécurité des jeunes, conformité au règlement par catégorie, sources) donnent leur avis ;
  - la validation finale revient à un mainteneur ;
  - un `CONTRIBUTING.md` décrit le processus.

---

## Qualité et tests

1. **Évaluations automatisées en CI** (`claude plugin eval`) sur des cas types, par exemple :
   - séance M10 de 75 minutes avec 14 enfants ;
   - plan de semaine seniors Fédérale 3 avant un derby ;
   - feuille de match M14 avec rotation équitable ;
   - message aux parents pour un tournoi.
2. **Sous-agents relecteurs**, qui signalent sans corriger :
   - sécurité des jeunes et charge adaptée à l'âge ;
   - conformité au règlement de la catégorie ;
   - sources citées et datées ;
   - confidentialité.
3. **Playtests simulés.** Des sous-agents incarnent des profils de coachs, par exemple « éducateur bénévole M8 débutant », « entraîneur Fédérale 3 exigeant », « coach féminines à 7 » ou « référent école de rugby ». Ils utilisent le plugin sur un scénario de saison fictif, puis un agent critique rédige un rapport (clarté, pertinence, oublis, ton).
4. **Coachs pilotes réels** : prévoir le circuit de retour (modèle d'issue « retour de coach », labels, tri) dès le premier lot publiable.

---

## Attendus du plan (lot 1)

Pour le lot 1, le plan doit préciser :

- l'**arborescence** complète du dépôt et de `plugin/` ;
- la liste des **skills, commandes, agents et hooks**, avec leur nom en français, leur rôle et leurs entrées et sorties ;
- le **schéma du dossier saison** (fichiers, champs, exemples fictifs) ;
- le contenu du **`CLAUDE.md`** du dépôt (règles du moteur, confidentialité, sécurité, sources) ;
- la mise en place GitHub de ce lot : fichiers `.github/`, CI, labels, milestones ;
- les **critères d'acceptation** vérifiables, au minimum :
  - le plugin s'installe en une commande depuis la marketplace ;
  - une séance est générée, relue par les sous-agents et exportée en PDF et en SVG ;
  - la CI est au vert ;
  - le hook bloque une donnée nominative de test ;
- les **risques et questions ouvertes**.

Ne commence l'implémentation qu'après ma validation explicite du plan.
