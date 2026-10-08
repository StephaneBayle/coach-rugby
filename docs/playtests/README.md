# Playtests simulés

Outil de **développement** du dépôt : il n'est pas livré dans le plugin.

Le skill `.claude/skills/playtest` fait jouer un coach fictif (agent
`coach-simule`) face au plugin tel qu'il est dans le dépôt. L'orchestrateur
applique réellement les skills et la CLI, dans un dossier saison temporaire.
L'agent `critique-playtest` écrit ensuite le rapport.

- Scénarios : [`playtests/scenarios/`](../../playtests/scenarios/).
- Résultats : un dossier `<AAAA-MM-JJ>-<scénario>/` par playtest, avec
  `journal.md` et `rapport.md`.

Lancer un playtest depuis une session Claude Code ouverte dans le dépôt :

```text
/playtest 2-entraineur-f3-derby
```

**Limites.** Un coach simulé est plus patient et plus méthodique qu'un vrai
bénévole, et il ne teste ni le terrain, ni le téléphone au soleil, ni
l'imprimante du club. Les playtests préparent les tests avec de **vrais
coachs pilotes** (lot 6) ; ils ne les remplacent pas.

Tout est fictif : aucune donnée réelle dans les journaux ni dans les
rapports.
