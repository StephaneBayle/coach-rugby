# coach-rugby — règles du moteur

Ce fichier fait foi pour tout agent qui travaille dans ce dépôt.

## Page blanche

Ne réutiliser ni la structure, ni le vocabulaire, ni les skills d'autres
projets chargés par un `CLAUDE.md` parent. Le seul modèle d'architecture est
`~/Developer/plugin-wargame`, dont on reprend les patterns, jamais le
vocabulaire (wargame, client, prospect…).

## Ce que contient le dépôt

- `plugin/` : le **plugin livré**, vers lequel pointe la marketplace. Il
  contient skills, agents, hooks, scripts, schémas, références, gabarits,
  bibliothèque d'exercices, exemples 100 % fictifs et évals.
- La racine sert au développement : ce fichier, `tests/`, `docs/`, la CI, la
  marketplace.

Ce `CLAUDE.md` n'est **pas** chargé quand le plugin est utilisé. Les règles qui
doivent s'appliquer à l'usage vivent dans les skills et dans
`plugin/references/regles-d-usage.md`.

## Public

Des coachs et éducateurs de rugby amateur, souvent bénévoles et peu
techniciens. D'abord les clubs, ensuite des structures hors club (pôles,
sections sportives, sport-études, centres de formation, sélections). Les
réponses du plugin sont simples, courtes et sans jargon technique.

## Confidentialité (non négociable)

- Les données des coachs vivent dans le **dossier saison**, hors du dépôt
  (`userConfig.dossier_saison`, par défaut `~/Rugby-Saisons`).
- On ne désigne jamais un joueur par son nom : des **nombres** (« 14 enfants »)
  ou des **codes locaux** (J01…).
- Aucun nom, aucune date de naissance, aucun numéro de licence, téléphone,
  e-mail ou information de santé d'un joueur dans le code, les exemples, les
  commits, les issues, les PR ou les releases.
- Tout nom de joueur qui apparaît dans une conversation va dans
  `<dossier saison>/.joueurs-proteges.txt`.
- La garde `garde-rgpd` (hook) et le job CI `donnees-personnelles` bloquent les
  fuites. **Ne jamais les contourner.**
- Les exemples sont 100 % fictifs ; le nom de test est « Zébulon Testard ».

## Santé et sécurité

- **Aucun avis médical**, aucun diagnostic, aucune durée de retour au jeu
  prescrite. En cas de choc ou de blessure : rappel du protocole commotion et
  renvoi vers un professionnel de santé
  (`plugin/references/protocole-commotion.md`).
- Les contenus pour les jeunes respectent la catégorie : le contact ne dépasse
  jamais le `contact_max` de la catégorie la plus jeune du groupe.

## Sources

- Les règles de la FFR changent chaque saison : ce sont des **paramètres datés**
  (`plugin/references/categories.yaml`), au statut `a-verifier` tant qu'un
  mainteneur ne les a pas confirmés avec une source datée. **Jamais de valeur
  réglementaire codée en dur** dans le code ou dans un skill.
- Toute affirmation réglementaire ou scientifique renvoie à une entrée de
  `plugin/references/sources.yaml`. Ce qui n'est pas sourcé est une
  **hypothèse**, marquée comme telle jusque dans les fiches.
- Documents FFR, World Rugby et formation.ffr.fr : **résumer et renvoyer**
  (lien et date), ne jamais reproduire de texte, de schéma ni de PDF.
- Mon Coach Assistant (FFR) : passerelles par copier-coller seulement. Jamais
  d'identifiants, jamais d'automatisation de navigateur.

## Licences

Code sous MIT, contenus pédagogiques sous CC BY-SA 4.0 : voir `LICENCES.md`.

## Technique

- **Le Markdown d'abord.** Chaque skill fonctionne sans Node (chemin B,
  décrit dans `plugin/references/outillage.md`). Les scripts Node accélèrent
  et fiabilisent (chemin A), et tournent en CI.
- **Jamais de dossier `bin/`** à la racine du plugin : Cowork et claude.ai
  refuseraient alors tout le plugin. La CLI est `plugin/scripts/coach-rugby.mjs`.
- Les hooks (`garde-rgpd.mjs`, `session-start.mjs`) n'importent **que des
  modules `node:*`**, pour fonctionner même sans dépendances installées.
- `${CLAUDE_PLUGIN_ROOT}` et `${CLAUDE_PLUGIN_DATA}` ne sont pas exportés au
  Bash lancé par Claude : les écrire en clair dans les SKILL.md, où ils sont
  substitués au chargement.
- Node 20 ou plus. Données en YAML, validées par JSON Schema 2020-12 (Ajv).
- Les fiches générées se **régénèrent**, elles ne se retouchent pas.
- Les tests ne touchent jamais le vrai dossier saison :
  `tests/environnement.mjs` impose un `COACH_RUGBY_DOSSIER` temporaire.
- Projet hors iCloud.

Avant toute PR : `npm test` et `npm run valider` doivent passer.

## Évals

`claude plugin eval` se lance **en local uniquement** (`npm run evals`), jamais
en CI : aucune clé d'API sur GitHub. La commande est en accès anticipé ; les
résultats sont consignés dans `docs/evals/resultats.md`.

## Git

- Une branche par sujet, `lot-<n>/<sujet>`, et une PR par branche, avec la
  checklist du modèle de PR.
- Commits et PR en français, avec la ligne `Co-Authored-By`.
- Versions `0.<lot>.0` à la clôture de chaque lot ; `CHANGELOG.md` rédigé pour
  des coachs, pas pour des développeurs.
