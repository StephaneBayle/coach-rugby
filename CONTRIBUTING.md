# Contribuer à coach-rugby

Merci ! Il y a deux façons de contribuer : partager un **exercice**, ce qui est
ouvert à tous les éducateurs, ou améliorer le **code**, pour les développeurs.

## Règles communes

- **Protection des joueurs.** Aucun nom, prénom, photo, date de naissance,
  numéro de licence, coordonnée ni information de santé d'un joueur, nulle
  part : ni dans un fichier, ni dans une issue, ni dans un message de commit.
  On parle en nombres (« 14 enfants ») ou en codes (A1, J01). La CI le vérifie
  (job « Données personnelles »).
- **Droits.** Uniquement des contenus que vous avez créés. Les documents de la
  FFR, de World Rugby, des livres ou des sites ne sont jamais recopiés : on y
  renvoie (lien et date) dans `pour_aller_plus_loin`.
- **Sécurité.** Un exercice pour les jeunes respecte le niveau de contact de la
  catégorie ; il comporte toujours des points de sécurité.
- **Licences.** Les contenus sont publiés sous CC BY-SA 4.0 et le code sous
  MIT (voir [LICENCES.md](LICENCES.md)).
- [Code de conduite](CODE_OF_CONDUCT.md).

## Partager un exercice

### Sans GitHub (le plus simple)

Ouvrez l'issue **[« Une idée d'exercice ou de jeu »](https://github.com/StephaneBayle/coach-rugby/issues/new?template=idee-exercice.yml)**
et remplissez le formulaire. Le mainteneur se charge d'en faire une fiche.

### Avec une pull request

1. Copiez `plugin/gabarits/fiche-exercice.exemple.yaml` dans
   `plugin/bibliotheque/exercices/<id>.yaml`. L'`id` est en minuscules avec des
   tirets, et c'est aussi le nom du fichier.
2. Remplissez chaque champ. Le dessin suit
   `plugin/references/conventions-terrain.md`.
3. Vérifiez la fiche et dessinez le schéma :

   ```bash
   npm run preparer
   node plugin/scripts/coach-rugby.mjs valider plugin/bibliotheque/exercices/<id>.yaml
   node plugin/scripts/coach-rugby.mjs terrain plugin/bibliotheque/exercices/<id>.yaml --sortie /tmp
   node plugin/scripts/coach-rugby.mjs index-bibliotheque
   ```

4. Ouvrez la pull request avec le modèle proposé, en mettant
   `relecture: { statut: a-relire }`.
5. **Relecture** :
   - la CI vérifie le format, la sécurité (contact par catégorie) et l'absence
     de donnée personnelle ;
   - le mainteneur fait relire la fiche par les relecteurs du plugin
     (`/coach-rugby:relire`), puis la valide : statut `relu-mainteneur` et
     label `contenu:valide`.

## Améliorer le code

- Node 20 ou plus. Le plugin livré est dans `plugin/` ; tests, CI et
  documentation sont à la racine.
- Lisez [CLAUDE.md](CLAUDE.md), qui contient les règles du moteur. Les plus
  importantes :
  - le Markdown d'abord, chaque skill fonctionne sans Node ;
  - jamais de dossier `bin/` ;
  - les hooks n'utilisent que des modules `node:*` ;
  - aucune règle de la FFR codée en dur.
- Avant toute PR :

  ```bash
  npm run preparer
  npm test
  npm run valider
  npm run lint
  ```

- Une branche par sujet (`lot-<n>/<sujet>`), une PR par branche, avec la
  checklist du modèle.
- Si vous modifiez un skill, lancez les évals en local (`npm run evals`) : elles
  ne tournent pas en CI.
