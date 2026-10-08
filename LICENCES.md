# Licences de coach-rugby

coach-rugby réunit deux types de contenus sous deux licences.

| Ce qui | Chemins | Licence |
|---|---|---|
| **Code** : scripts, bibliothèques, hooks, tests, CI, schémas, manifestes | `plugin/scripts/`, `plugin/lib/`, `plugin/hooks/`, `plugin/schemas/`, `plugin/.claude-plugin/`, `tests/`, `.github/`, `.claude-plugin/`, `package.json` | [MIT](LICENSE) |
| **Contenus pédagogiques** : skills, agents, références, gabarits, bibliothèque d'exercices, exemples, documentation | `plugin/skills/`, `plugin/agents/`, `plugin/references/`, `plugin/gabarits/`, `plugin/bibliotheque/`, `plugin/exemples/`, `plugin/evals/`, `docs/`, `*.md` à la racine | [CC BY-SA 4.0](LICENSE-CONTENU.md) |

Dans le manifeste du plugin, cela s'écrit `"license": "MIT AND CC-BY-SA-4.0"`.

## Pour les contributeurs

En proposant une contribution (pull request), vous acceptez qu'elle soit
publiée sous la licence correspondant à son chemin : MIT pour le code,
CC BY-SA 4.0 pour les contenus. Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Documents de tiers

Les documents de la FFR, de World Rugby et des autres sources citées dans
`plugin/references/sources.yaml` ne sont **pas** couverts par ces licences :
coach-rugby les résume et y renvoie, sans les reproduire.
