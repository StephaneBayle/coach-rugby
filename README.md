# coach-rugby

Assistant de saison pour **coachs et éducateurs de rugby amateur**, sous forme
de plugin pour Claude (Cowork, Claude desktop et Claude Code).

> **Version 0.3.0** — saison, cycles et semaines, séances, bibliothèque
> d'exercices, effectif et matchs (temps de jeu équitable, fiche match,
> débriefing), fiches imprimables et téléphone, tableaux Excel. La suite
> (charge, communication) est dans la
> [feuille de route](docs/feuille-de-route.md).

## À quoi ça sert

- Préparer une **séance** adaptée à votre catégorie, à l'effectif présent, à
  la durée et au matériel.
- Organiser votre **saison** : reprise, phase aller, trêve, phase retour,
  phases finales, ou calendrier de plateaux pour l'école de rugby.
- Puiser dans une **bibliothèque d'exercices** libre (CC BY-SA), avec des
  schémas de terrain.
- Suivre vos **joueurs en codes** (les prénoms restent sur votre
  ordinateur) : présences, progrès, feuille de présence, tableaux Excel.
- Préparer vos **matchs et plateaux** : convocation, composition, temps de
  jeu équitable chez les jeunes, causerie, puis débriefing.
- Obtenir des **fiches imprimables** et lisibles sur téléphone au bord du
  terrain.
- Être **relancé au bon moment** : affûtage avant un derby, préparation de la
  trêve, bilan de mi-saison.

Catégories couvertes : école de rugby (M6 à M14), M16, M19, seniors, rugby
féminin, rugby à 5, à 7 et loisir.

## Installation

### Dans Claude Code

```text
/plugin marketplace add StephaneBayle/coach-rugby
/plugin install coach-rugby@coach-rugby
```

### Dans Cowork / Claude desktop

*Personnaliser* › *Plugins* › *Ajouter* › *Ajouter une marketplace*, puis
saisir `StephaneBayle/coach-rugby`. Vous pouvez aussi téléverser le fichier
`.zip` joint à chaque [version publiée](https://github.com/StephaneBayle/coach-rugby/releases).

Guide détaillé : [docs/installation.md](docs/installation.md).

## Premier pas

Dites simplement : *« Prépare la séance de mercredi de mes M10 »*, ou lancez
`/coach-rugby:coach`.

## Ce que vous pouvez demander

| Commande | Pour |
|---|---|
| `/coach-rugby:coach` | Démarrer, retrouver où en est votre équipe, savoir quoi faire ensuite |
| `/coach-rugby:saison` | Organiser la saison : phases, matchs, plateaux, tournois |
| `/coach-rugby:planifier` | Découper la saison en cycles (thèmes, intensité, affûtage, changements de forme de jeu) |
| `/coach-rugby:semaine` | Préparer la semaine (séances, jours avant le match, intensités) et sa fiche |
| `/coach-rugby:seance` | Préparer une séance pour votre groupe |
| `/coach-rugby:match` | Préparer un match ou un plateau (convocation, composition, temps de jeu équitable, causerie), puis le débriefer ; fiche match |
| `/coach-rugby:charge` | Noter la charge des séances (durée × intensité ressentie) et faire le bilan de la semaine, à partir de M14 |
| `/coach-rugby:prevention` | Échauffement préventif, chaleur et terrain gelé, préparation physique (terrain, salle), programmes de trêve, tests physiques, reprise après le feu vert du médecin |
| `/coach-rugby:effectif` | Suivre vos joueurs en codes (prénoms gardés sur votre ordinateur) : présences, progrès, feuille de présence, tableaux Excel |
| `/coach-rugby:exercices` | Trouver, adapter ou créer un exercice |
| `/coach-rugby:relire` | Faire vérifier une séance (sécurité, règlement, sources, données) |
| `/coach-rugby:exporter` | Obtenir la fiche à imprimer, la fiche téléphone, le PDF |

Pas besoin de retenir les commandes : décrivez simplement ce que vous voulez.

## Vos données restent chez vous

Vos équipes, saisons et séances sont enregistrées dans un dossier de votre
ordinateur (`~/Rugby-Saisons` par défaut), jamais dans ce dépôt. Le plugin ne
vous demande **jamais** le nom, la date de naissance, le numéro de licence ou
la santé de vos joueurs : on raisonne en nombres (« 14 enfants ») ou en codes.

Aucun avis médical : en cas de choc à la tête, le plugin rappelle le
protocole commotion et renvoie vers un professionnel de santé.

## Avec Mon Coach Assistant (FFR)

[Mon Coach Assistant](https://monclubhouse.ffr.fr/actualites/mon-coach-assistant-arrive-votre-assistant-coach-100-gratuit),
l'outil gratuit de la FFR dans Mon Club House, gère l'administration de
l'équipe : effectif licencié, calendrier officiel, sondages de présence.
coach-rugby est un **assistant pédagogique** qui se veut complémentaire : vous
pourrez y coller votre calendrier ou le résultat d'un sondage, et copier vos
séances vers Mon Coach Assistant. Aucune connexion directe : le plugin ne
vous demandera jamais vos identifiants.

## Licences

Code sous [MIT](LICENSE), contenus pédagogiques sous
[CC BY-SA 4.0](LICENSE-CONTENU.md) : voir [LICENCES.md](LICENCES.md).

## Contribuer, faire un retour

- Une idée d'exercice, une erreur de règlement, un retour de terrain :
  [ouvrir une issue](https://github.com/StephaneBayle/coach-rugby/issues/new/choose).
- Une question, un échange entre coachs :
  [Discussions](https://github.com/StephaneBayle/coach-rugby/discussions).
