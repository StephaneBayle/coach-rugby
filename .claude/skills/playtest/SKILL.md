---
name: playtest
description: Outil de développement de coach-rugby. Joue un playtest simulé — un coach fictif (agent coach-simule) utilise le plugin sur un scénario de playtests/scenarios/, l'orchestrateur exécute réellement les skills du plugin du dépôt, puis l'agent critique-playtest écrit le rapport dans docs/playtests/. À utiliser avant une publication ou après un changement de skill.
when_to_use: Quand le mainteneur demande un playtest, un test utilisateur simulé, ou de « faire essayer le plugin à un coach fictif ».
argument-hint: "[scénario]"
disable-model-invocation: true
---

# Playtest simulé de coach-rugby

Le playtest **ne remplace pas** un test avec un vrai coach. Le rapport le
dit.

## 0. Préparer

1. Choisir le scénario ($ARGUMENTS, sinon le demander) dans
   `playtests/scenarios/*.md`, et le lire en entier : profil, départ, date,
   pièges, critères de réussite.
2. Créer un **dossier saison temporaire**, jamais `~/Rugby-Saisons` :

   ```bash
   D=$(mktemp -d)/Rugby-Saisons
   ```

   Puis le préparer comme indiqué dans la section « Départ » du scénario :
   - partir d'un dossier vide ;
   - ou copier un exemple de `plugin/exemples/`.
3. Créer `docs/playtests/<AAAA-MM-JJ>-<scénario>/` avec `journal.md`, qui
   contient :
   - en en-tête : scénario, date fixée, profil perturbateur, version du
     plugin (`plugin/.claude-plugin/plugin.json`) ;
   - un échange par section.
4. **Profil perturbateur** : en tirer un dans au moins un playtest sur trois,
   et toujours si le scénario le demande :

   ```bash
   node -e "const p=['impatient','sceptique','lecteur pressé','technophobe','hors-sujet']; console.log(p[require('node:crypto').randomInt(p.length)])"
   ```

   Le noter dans le journal.

## 1. Jouer le plugin tel qu'il est dans le dépôt

L'orchestrateur, c'est-à-dire toi, joue **le plugin** :

1. Repérer le skill que la demande du coach déclencherait, d'après les
   `description` et `when_to_use` de `plugin/skills/*/SKILL.md`.
2. **Lire ce SKILL.md et l'appliquer fidèlement**, en remplaçant
   `${CLAUDE_PLUGIN_ROOT}` par `plugin` (chemin du dépôt) et
   `${user_config.dossier_saison}` par le dossier temporaire.
3. Lancer réellement la CLI avec l'environnement du scénario :

   ```bash
   COACH_RUGBY_DOSSIER="$D" COACH_RUGBY_AUJOURDHUI=<date du scénario> node plugin/scripts/coach-rugby.mjs <commande>
   ```

4. Écrire réellement les fichiers dans `$D`, puis les valider.

Réponds au coach **exactement comme le plugin le ferait** : règles d'usage,
ton, longueur, une question à la fois. Ne corrige pas en silence un défaut du
skill ; note-le dans le journal (« le skill dit X, ce qui conduit à Y »).

## 2. Échanges (3 à 5)

À chaque tour :

1. Lancer l'agent `coach-simule` (outil Agent, `subagent_type: coach-simule`)
   avec :
   - le profil ;
   - le profil perturbateur ;
   - la situation ;
   - l'objectif du coach ;
   - les pièges à placer, et quand ;
   - l'historique complet.
2. Jouer le plugin sur son `MESSAGE AU PLUGIN`.
3. Consigner dans `journal.md` :
   - le message ;
   - le skill appliqué ;
   - les commandes lancées et leur code de sortie ;
   - les fichiers écrits et le résultat de `valider` ;
   - la réponse donnée au coach ;
   - puis, au tour suivant, son RESSENTI et ce qui lui a MANQUÉ.

Arrêter quand le coach répond `J'ARRÊTE : oui`, ou après 5 échanges.

## 3. Rapport critique

Lancer l'agent `critique-playtest` avec :

- le chemin du scénario ;
- le chemin de `journal.md` ;
- `plugin/references/regles-d-usage.md` ;
- les chemins des fichiers produits.

Il écrit `docs/playtests/<…>/rapport.md`.

## 4. Restituer

Présenter au mainteneur :

- la synthèse ;
- les critères atteints ou non ;
- les recommandations **P1** et **P2**.

Proposer de corriger, ou d'ouvrir des issues (`type:retour-coach`, label du
domaine). Le dossier temporaire est jetable. Seuls `journal.md` et
`rapport.md` sont versionnés, et ils ne contiennent aucune donnée réelle.
