---
name: exercices
description: Cherche, explique, adapte ou crée un exercice de rugby dans la bibliothèque libre de coach-rugby (fiches CC BY-SA avec schéma de terrain), en respectant la catégorie et les règles de jeu du moment. Prépare aussi une contribution d'exercice pour la bibliothèque commune.
when_to_use: Quand le coach cherche un exercice, un jeu, une situation ou un atelier (« un jeu de passes pour mes M8 », « un exercice de défense », « comment apprendre à plaquer »), veut adapter une fiche à son effectif ou à son terrain, demande un schéma, ou veut proposer son propre exercice.
argument-hint: "[thème, catégorie ou nom d'exercice]"
---

# Exercices

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md` et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md`.

- Bibliothèque : `${CLAUDE_PLUGIN_ROOT}/bibliotheque/INDEX.md` (liste) et
  `${CLAUDE_PLUGIN_ROOT}/bibliotheque/exercices/*.yaml` (fiches).
- Bibliothèque personnelle du coach : `<dossier saison>/_bibliotheque-perso/exercices/`.
- Schéma d'une fiche : `${CLAUDE_PLUGIN_ROOT}/schemas/exercice.schema.json` ;
  gabarit commenté : `${CLAUDE_PLUGIN_ROOT}/gabarits/fiche-exercice.exemple.yaml`.
- Dessins : `${CLAUDE_PLUGIN_ROOT}/references/conventions-terrain.md`.

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

## 1. Comprendre la demande

Repérer le thème, la catégorie (sinon, celle de l'équipe du coach), l'effectif,
l'espace et le matériel. Une question au plus si quelque chose d'essentiel
manque.

## 2. Vérifier ce qui est permis aujourd'hui

1. Obtenir les **règles du jour** de la catégorie la plus jeune du groupe :
   `regles <categorie> --date <date de la séance>` (chemin A), ou la méthode
   de `outillage.md` (chemin B).
2. Garder seulement les fiches compatibles :
   - leur `contact` ne dépasse pas le **contact maximal** ;
   - leurs `exige` (plaquage, mêlée, touche, ruck) sont permis ;
   - la catégorie fait partie de leurs `categories`.
3. Une fiche hors règles n'est **jamais proposée telle quelle** : proposer à la
   place une variante permise, par exemple au toucher.

## 3. Proposer

Pour une recherche, proposer **2 ou 3 fiches**, avec pour chacune :

- le titre ;
- le but ;
- la durée et l'effectif ;
- le contact ;
- une ligne qui dit pourquoi elle convient.

Pour une fiche choisie, la présenter simplement :

- but, organisation, consignes, variantes, critères de réussite, **sécurité** ;
- les renvois `pour_aller_plus_loin` (lien vers la ressource FFR, sans la
  recopier).

Le schéma s'obtient par `terrain <fiche>` (chemin A), ou en dessinant le SVG
selon `conventions-terrain.md` (chemin B).

## 4. Adapter

Adapter à l'effectif, à l'espace, au matériel ou au niveau en jouant sur les
`variables`. Le contact ne doit jamais dépasser ce qui est permis.

L'adaptation est enregistrée seulement si le coach le souhaite :

- dans `_bibliotheque-perso/exercices/<id>.yaml` ;
- avec un nouvel `id`, `auteurs` = pseudonyme du coach et
  `relecture.statut: a-relire` ;
- puis `valider` sur le fichier.

## 5. Créer ou contribuer

Pour créer une fiche, suivre le gabarit champ par champ, avec le coach. Les
règles :

- une **création originale**, jamais une copie de document FFR ou d'un livre ;
- les joueurs s'appellent A1 et D1, jamais par un prénom ;
- toujours au moins un point de sécurité.

Pour la **proposer à la bibliothèque commune** :

1. Expliquer que la fiche sera publiée sous **CC BY-SA 4.0**.
2. Vérifier qu'elle ne contient aucune donnée personnelle.
3. Donner au coach le lien du modèle d'issue « Une idée d'exercice ou de jeu »
   : <https://github.com/StephaneBayle/coach-rugby/issues/new?template=idee-exercice.yml>.
4. Pour un coach à l'aise avec GitHub, renvoyer plutôt vers `CONTRIBUTING.md`
   (pull request).

Ne jamais publier quoi que ce soit à sa place sans son accord explicite.

## 6. Faire le point

Résumer la fiche retenue ou créée, puis proposer de l'intégrer à une séance
(`/coach-rugby:seance`). Ne pas enchaîner sans l'accord du coach.
