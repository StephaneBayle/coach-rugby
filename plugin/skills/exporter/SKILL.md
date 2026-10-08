---
name: exporter
description: Produit les fiches d'une séance ou d'une semaine de rugby - fiche imprimable A4, fiche lisible sur téléphone au bord du terrain, schémas de terrain SVG, PDF si possible, et texte à coller dans Mon Coach Assistant de la FFR (séances).
when_to_use: Quand le coach veut imprimer sa séance ou le programme de sa semaine, l'avoir sur son téléphone, l'envoyer à son staff, en faire un PDF, ou copier une séance dans Mon Coach Assistant.
argument-hint: "[équipe] [date de la séance]"
---

# Exporter une séance

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md` et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md`.

Gabarits utilisés :

- `${CLAUDE_PLUGIN_ROOT}/gabarits/fiche-seance.html`, une seule fiche en deux
  formats (`format-a4` et `format-telephone`) ;
- `${CLAUDE_PLUGIN_ROOT}/gabarits/pour-mca.txt` ;
- `${CLAUDE_PLUGIN_ROOT}/references/conventions-terrain.md`, pour les schémas.

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" exporter <seance.yaml> --pdf
```

## 0. Séance ou semaine ?

- **Une semaine** (`semaines/<lundi>/semaine.yaml`) : `exporter <semaine.yaml> --pdf`
  produit `exports/fiche-semaine-a4.html`, `exports/fiche-semaine-telephone.html`
  et leurs PDF. La fiche contient :
  - la frise des 7 jours (J-n, intensité prévue en texte et en pictogramme,
    intention) ;
  - les échéances ;
  - la vigilance ;
  - les cycles autour de la semaine ;
  - les règles du moment.

  Au chemin B, remplir `${CLAUDE_PLUGIN_ROOT}/gabarits/fiche-semaine.html`.
  Pour une équipe d'école de rugby, le mot « affûtage » n'apparaît jamais.
- **Une séance** : suivre les étapes ci-dessous.

## 1. Trouver la séance

Prendre la séance citée ($ARGUMENTS), sinon la plus récente de l'équipe
(`seances/<date>/seance.yaml`). Si elle n'a pas été relue, proposer
`/coach-rugby:relire` avant d'exporter, sans l'imposer.

## 2. Produire les fichiers

### Chemin A

Lancer `exporter <seance.yaml> --pdf`. La commande valide d'abord la séance,
puis écrit dans `seances/<date>/exports/` :

- `fiche-a4.html` et `fiche-telephone.html` : fichiers autonomes, que l'on peut
  envoyer par mail ou par messagerie ;
- `schemas/*.svg` : un schéma par bloc qui en a un ;
- `pour-mca.txt` : seulement pour un club qui a dit utiliser Mon Coach
  Assistant (`utilise_mca: true`) ;
- `fiche-a4.pdf` et `fiche-telephone.pdf` si Chrome est disponible.

### Chemin B, sans Node

1. Remplir `fiche-seance.html` :
   - les doubles accolades reçoivent du texte échappé ;
   - les triples accolades reçoivent du HTML déjà prêt ;
   - les zones `@repeter:liste … @fin:liste` sont répétées pour chaque
     élément ;
   - `{{format}}` vaut `a4` ou `telephone`, et `{{{page}}}` vaut
     `size: A4; margin: 12mm` ou `size: 90mm 160mm; margin: 5mm`.
2. Dessiner chaque schéma en SVG selon `conventions-terrain.md`. Partir du bloc
   `schema` de la fiche d'exercice, et copier les symboles de
   `gabarits/terrain.svg`.
3. Remplir `pour-mca.txt`.
4. Pour le PDF, utiliser la capacité de création de PDF de l'application si
   elle existe. Sinon, dire au coach : « ouvrez la fiche dans un navigateur,
   puis Imprimer > Enregistrer en PDF ».

Ne jamais retoucher une fiche à la main après coup : corriger `seance.yaml`,
puis réexporter.

## 3. Remettre les fichiers au coach

- **Imprimer** : `fiche-a4.pdf`, ou `fiche-a4.html` puis Imprimer.
- **Au bord du terrain** : `fiche-telephone.html` (ou le PDF téléphone),
  envoyé par mail, par messagerie ou par AirDrop. Il fonctionne hors connexion.
  **Ne pas donner de chemin** à un coach peu technicien : proposer d'ouvrir la
  fiche pour lui (lien cliquable ou ouverture dans le navigateur), puis lui
  expliquer « Partager › Mail » ou « Partager › Messages ». Les schémas des
  ateliers sont dans la fiche : les signaler (« où poser les plots »).
- **Au staff** : les mêmes fichiers. Ils ne contiennent aucune donnée
  personnelle de joueur.
- **Mon Coach Assistant**, pour les clubs :
  1. ouvrir `pour-mca.txt` et en copier le contenu ;
  2. dans Mon Coach Assistant, créer la séance et coller le texte dans sa
     description.

  Le plugin ne se connecte jamais à Mon Coach Assistant et ne demande aucun
  identifiant.

## 4. Faire le point

1. Lister les fichiers produits en une ligne chacun, et dire si le PDF n'a pas
   pu être fait, avec la solution.
2. Ajouter une ligne datée dans `journal.md`.
3. Proposer de revenir après la séance pour noter le bilan.
