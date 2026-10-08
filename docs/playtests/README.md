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

## Synthèse des playtests du 2026-10-08 (lot 2)

| Scénario | Résultat du coach simulé | Points forts | Défauts majeurs relevés |
|---|---|---|---|
| 1. Éducateur M8 débutant | « Je saurais quoi faire mercredi » | Réponse sur l'asthme sans avis médical ; prénom protégé | Règles des jeux absentes du résumé ; vocabulaire « dossier » anxiogène ; pas d'appel au 15 ou au 112 en cas de détresse ; matériel non disponible demandé |
| 2. Entraîneur F3, derby | « Utilisable jeudi tel quel » | Refus du contact intense argumenté, sans moraliser | Intention incohérente dans le bloc d'affûtage ; ligne Sécurité incomplète (protège-dents, médecin) ; règles « à vérifier » non dites |
| 3. Coach féminines à 7 | Satisfaite (« court, exactement ce qu'il me fallait ») | Réponse courte ; renvoi au club pour la joueuse de 16 ans | Protège-dents absent malgré du plaquage ; pas d'affûtage avant un tournoi ; mise en place des plots jamais donnée ; condition d'admission non sourcée |
| 4. Référent EDR, passage au rugby éducatif à 7 | Satisfait | « Non » net, sourcé et « à vérifier » sur la mêlée ; ruck refusé en décembre par `valider` | Effectif supposé appliqué en silence ; relance de changement de forme trop tardive ; pas de fiche de ruck |

### Corrigé dans ce lot

- **Sécurité, contrôlée par `valider`** :
  - tout bloc avec contact rappelle la conduite en cas de choc à la tête ;
  - toute séance avec plaquage parle du protège-dents.
- **Format de réponse imposé dans le skill `seance`** :
  - règles des jeux en une ou deux phrases ;
  - mise en place et matériel en quantités ;
  - règles du jour « à vérifier », avec leur source ;
  - ligne Sécurité complète ;
  - « si ça coince » ;
  - relecture proposée avant l'export.
- **Règles d'usage** :
  - pas de jargon (dossier, fichier, chemin) ;
  - valeurs supposées annoncées ;
  - parcours express ;
  - réponse courte pour les coachs pressés ;
  - maladie chronique et détresse : appeler le 15 ou le 112 ;
  - groupes qui mêlent mineurs et adultes.
- **Planification** :
  - intention « volume réduit » dans un bloc d'affûtage ;
  - J-n masqué au-delà de 14 jours ou à travers la trêve ;
  - affûtage avant les tournois importants ;
  - relance de changement de forme 35 jours avant.
- **Skills** :
  - `semaine` : conduite quand le coach s'écarte d'un repère, réponse sur la
    « charge », cas d'un seul créneau par semaine ;
  - `saison` : mode « échéance seule » ;
  - `exporter` : fiche remise sans chemin, texte pour Mon Coach Assistant
    seulement si le club l'utilise.
- **Bibliothèque** : 3 nouvelles fiches (ruck éducatif progressif, jeu au
  contact à 5 contre 5, lancements de jeu).

### Reporté (issues ouvertes)

Voir les issues avec le label `type:retour-coach` du jalon Lot 2 et des lots
suivants.

### Biais

Ces quatre playtests ont été joués par **un seul orchestrateur**, qui
connaît bien le plugin et a parfois amélioré les skills en les appliquant
(rapport du scénario 1). Ils mesurent ce que le plugin **peut** faire, pas
encore ce qu'un vrai bénévole en fera. Ils ne remplacent pas les coachs
pilotes du lot 6.
