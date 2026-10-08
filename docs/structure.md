# Structure du plugin et contraintes vérifiées

Constats établis le **2026-10-08** (étape 0 du lot 1) à partir de la
documentation officielle et d'essais locaux avec Claude Code 2.1.247. En cas de
doute, `claude plugin validate --strict` fait foi.

## Emplacements

| Élément | Emplacement | Remarque |
|---|---|---|
| Manifeste | `plugin/.claude-plugin/plugin.json` | `displayName` et `userConfig` acceptés par `validate --strict` (vérifié) |
| Marketplace | `.claude-plugin/marketplace.json` | `"source": "./plugin"` |
| Skills | `plugin/skills/<nom>/SKILL.md` | `name` = nom du dossier ; pas de `commands/` (fusionnées dans les skills) |
| Agents | `plugin/agents/*.md` | `hooks`, `mcpServers`, `permissionMode` non pris en charge pour les agents de plugin |
| Hooks | `plugin/hooks/hooks.json` | événements enveloppés dans une clé `"hooks"` |
| Scripts | `plugin/scripts/` | **jamais `bin/`** : Cowork et claude.ai refusent un plugin qui en contient un |
| Évals | `plugin/evals/<cas>/` | `claude plugin eval` cherche `evals/` **sous le plugin** (ou `--eval-dir`, ou `experimental.evals` du manifeste) |

Le plugin vit dans `plugin/` et non à la racine : un `CLAUDE.md` à la racine
d'un plugin n'est pas chargé et `validate --strict` le signale.

## Variables

| Variable | Contenu | Disponible dans |
|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | dossier de la version installée (change à chaque mise à jour, ne rien y écrire) | hooks, contenu des skills et agents (substitué au chargement) |
| `${CLAUDE_PLUGIN_DATA}` | `~/.claude/plugins/data/<id>/`, persistant entre mises à jour | idem |
| `${user_config.<clé>}` | valeur d'une option non sensible | contenu des skills et agents, `args` des hooks en forme exec |
| `CLAUDE_PLUGIN_OPTION_<CLÉ>` | valeur d'une option | environnement des hooks |

Ni `CLAUDE_PLUGIN_ROOT`, ni `CLAUDE_PLUGIN_DATA`, ni les options ne sont
exportés au Bash lancé par Claude : les skills les écrivent en clair dans leur
Markdown et passent `COACH_RUGBY_DOSSIER` explicitement aux scripts.

`CLAUDE_PLUGIN_DATA` peut appartenir à un **autre** plugin dans un shell : ne le
retenir que si son nom commence par `coach-rugby`.

## Surfaces

| Composant | Chat (web, desktop, mobile) | Cowork | Claude Code |
|---|---|---|---|
| Skills | oui | oui | oui |
| Agents | ignorés | oui | oui |
| Hooks | ignorés | « chargés » selon la doc ; des utilisateurs signalent qu'ils ne se déclenchent pas : **non fiable** | oui |
| `userConfig` | ignoré | **pas de question posée** : la valeur par défaut s'applique | oui |
| `bin/` à la racine | plugin refusé | plugin refusé | oui |

Conséquences pour coach-rugby :

- chaque skill fonctionne sans Node ni hook (chemin B, `references/outillage.md`) ;
- chaque option `userConfig` a une valeur par défaut utilisable ;
- la garde RGPD est doublée côté GitHub (CI, modèles d'issue, push protection).

## Dépendances Node

Claude Code installe les dépendances si la racine du plugin contient
`package.json` et un lockfile (scripts de cycle de vie non lancés, délai 60 s,
Node doit être dans le `PATH`). Le hook `session-start` n'installe qu'en
secours. Les hooks n'importent que des modules `node:*`.

## Évals

`claude plugin eval` existe dans Claude Code 2.1.247, mais renvoie « currently
in early access » sur le compte du mainteneur : les cas d'éval sont écrits au
format documenté (`prompt.md` + `graders/*.md`) et seront lancés dès que
l'accès est ouvert. Jamais en CI (pas de clé d'API sur GitHub).

## Restant à vérifier sur une vraie installation

Ces points ne peuvent être vérifiés qu'en installant le plugin ; ils sont
suivis dans une issue et dans la recette du lot 1.

- [ ] Cowork : accès au dossier `~/Rugby-Saisons` ou nécessité de sélectionner un dossier de travail.
- [ ] Cowork : exécution de Node et déclenchement des hooks.
- [ ] Expansion du `~` dans la valeur par défaut d'une option `directory`.
- [ ] Emplacement de `node_modules` après l'installation automatique des dépendances.

## Sources

- <https://code.claude.com/docs/en/plugins-reference>
- <https://code.claude.com/docs/en/skills>
- <https://code.claude.com/docs/en/sub-agents>
- <https://code.claude.com/docs/en/hooks>
- <https://code.claude.com/docs/en/plugins/marketplace-reference>
- <https://code.claude.com/docs/en/plugins/loading>
- <https://code.claude.com/docs/en/plugin-evals>
- <https://claude.com/docs/plugins/platform-support>
- <https://claude.com/docs/cowork/guide/plugins>
