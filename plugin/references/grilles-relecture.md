# Grilles de relecture

Source unique des critères des quatre relecteurs : `relecteur-securite-jeunes`,
`relecteur-reglement`, `relecteur-sources` et `relecteur-confidentialite`. En
l'absence d'agents (chat), le skill `relire` applique lui-même ces quatre
grilles, l'une après l'autre.

**Les relecteurs signalent, ils ne corrigent pas.**

## Format de réponse, identique pour les quatre

```text
RELECTEUR: <nom>
| gravité | passage | problème | raison |
|---|---|---|---|
| bloquant | bloc 5 « … » | … | … |
VERDICT: ok | a-revoir | bloquant
```

- `bloquant` : danger pour un joueur, règle de jeu enfreinte, donnée
  personnelle, avis médical ou document protégé recopié. La séance ne doit pas
  être utilisée ni publiée en l'état.
- `a-revoir` : un point à corriger ou à préciser, sans danger immédiat.
- `remarque` : une suggestion. Elle n'affecte pas le verdict.
- Aucun point relevé : un tableau vide et `VERDICT: ok`.
- Citer le passage exact (bloc, champ). Ne pas inventer de règle : si un doute
  porte sur la réglementation, le signaler comme `a-revoir` en disant « à
  vérifier ».

## 1. Sécurité des jeunes (`relecteur-securite-jeunes`)

Lire d'abord les règles du jour : `regles` dans la séance, à recouper avec
`categories.yaml` pour la date et la catégorie la plus jeune.

| Critère | Gravité si manquant |
|---|---|
| Le `contact` de chaque bloc ne dépasse pas le `contact_max` du jour | bloquant |
| Échauffement présent, adapté à l'âge, en début de séance | bloquant |
| Retour au calme présent | a-revoir |
| Contact progressif : progression par étapes (à genoux, puis accroupi, puis debout), sol souple, gabarits comparables | bloquant |
| Plaquage : bas (taille ou en dessous), tête sur le côté, vitesse réduite | bloquant |
| Chaque bloc a au moins un point de sécurité concret | a-revoir |
| Bloc avec contact : rappel de la sortie définitive en cas de choc à la tête | a-revoir |
| Durée totale et intensité raisonnables pour l'âge ; pauses d'hydratation | a-revoir |
| Encadrement suffisant pour l'effectif et le nombre d'ateliers | a-revoir |
| Aucun avis médical, diagnostic ni durée de reprise (voir `protocole-commotion.md`) | bloquant |

## 2. Conformité au règlement (`relecteur-reglement`)

| Critère | Gravité si manquant |
|---|---|
| Les formes de jeu utilisées sont permises ce mois-ci pour la catégorie la plus jeune | bloquant |
| Mêlée, touche, ruck ou plaquage seulement si la forme du jour les permet | bloquant |
| École de rugby : pas de « match sec » ; rencontres en plateau ou tournoi à au moins 3 équipes | a-revoir |
| Les règles citées ont un statut ; si ce n'est pas `verifie`, la mention « à vérifier (saison) » apparaît | a-revoir |
| Aucune valeur réglementaire sans source | bloquant |
| Effectifs et formats de jeu cohérents avec la forme (5 × 5, 7 × 7, 10 × 10…) | remarque |

## 3. Sources (`relecteur-sources`)

| Critère | Gravité si manquant |
|---|---|
| Chaque affirmation réglementaire ou scientifique renvoie à une entrée de `sources.yaml` | a-revoir |
| Une source au statut `a-verifier` n'est pas présentée comme certaine | a-revoir |
| Ce qui n'est pas sourcé figure dans `hypotheses` | a-revoir |
| Aucun texte, schéma ou passage d'un document FFR, World Rugby ou d'un éditeur n'est reproduit (au plus un renvoi avec lien) | bloquant |
| Les exercices cités existent dans la bibliothèque ; les renvois `pour_aller_plus_loin` pointent vers des sources connues | remarque |

## 4. Confidentialité (`relecteur-confidentialite`)

| Critère | Gravité si manquant |
|---|---|
| Aucun nom ni prénom de joueur (y compris dans les adaptations, consignes et notes) | bloquant |
| Aucune date de naissance, aucun numéro de licence, téléphone, e-mail ou adresse | bloquant |
| Aucune information de santé liée à une personne identifiable | bloquant |
| Effectifs en nombres, joueurs en codes (A1, D1, J01) | a-revoir |
| Aucun prénom de la table locale `.prenoms.yaml` (fiches, tableaux, match) | bloquant |
| Aucun motif d'indisponibilité, aucun jugement sur un joueur (progrès en trois niveaux, débriefing sur le jeu de l'équipe) | bloquant |
| Staff désigné par son rôle, pas par son nom | a-revoir |
| Fichier hors de tout dépôt git (dossier saison) | a-revoir |

Un prénom isolé peut passer inaperçu pour les outils automatiques : le
relecteur est la dernière barrière.
