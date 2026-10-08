---
name: relire
description: Fait relire une séance ou une fiche d'exercice de rugby par quatre relecteurs (sécurité des jeunes, règlement de la catégorie, sources, confidentialité) et regroupe leurs verdicts, avant d'utiliser, d'imprimer ou de partager.
when_to_use: Quand le coach veut vérifier une séance ou un exercice (« c'est sans danger pour mes M8 ? », « relis ma séance », « est-ce conforme au règlement ? »), avant d'exporter ou de partager, ou avant de proposer une fiche à la bibliothèque commune.
argument-hint: "[séance ou fiche]"
---

# Relire une séance ou une fiche

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md`.

Les critères des relecteurs sont tous dans
`${CLAUDE_PLUGIN_ROOT}/references/grilles-relecture.md`.

## 1. Identifier ce qu'il faut relire

Prendre la séance, la fiche ou le match cité ($ARGUMENTS), sinon la séance la
plus récente de l'équipe. Un `match.yaml` se relit de la même façon (sécurité,
règlement, sources, confidentialité). Si c'est une séance, la faire d'abord passer au contrôle
automatique (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" valider <fichier>
```

Une erreur de contrôle concernant le contact ou les règles du jour est déjà
**bloquante**. La signaler au coach et proposer de corriger avant la
relecture.

## 2. Lancer les quatre relecteurs en parallèle

Si l'outil Agent est disponible, lancer **en même temps** les quatre agents :
`coach-rugby:relecteur-securite-jeunes`, `coach-rugby:relecteur-reglement`,
`coach-rugby:relecteur-sources` et `coach-rugby:relecteur-confidentialite`.

Donner à chacun dans sa demande :

- le chemin absolu du fichier à relire ;
- le chemin de la grille : `${CLAUDE_PLUGIN_ROOT}/references/grilles-relecture.md` ;
- le chemin des références : `${CLAUDE_PLUGIN_ROOT}/references/`
  (`categories.yaml`, `sources.yaml`, `protocole-commotion.md`) et de la
  bibliothèque : `${CLAUDE_PLUGIN_ROOT}/bibliotheque/exercices/` ;
- pour la confidentialité, le chemin de `<dossier saison>/.joueurs-proteges.txt`
  et, s'il existe, celui de `<equipe>/.prenoms.yaml` : ses prénoms ne
  doivent apparaître nulle part. Les **codes** (J01…) sont permis.

**Sans agents** (chat, ou outil indisponible) : appliquer soi-même les quatre
grilles, l'une après l'autre, avec le même format de réponse.

## 3. Regrouper les verdicts

1. Écrire `relecture.md` à côté de la séance, ou de la fiche dans la
   bibliothèque personnelle. Il contient :
   - la date ;
   - les quatre tableaux ;
   - les quatre verdicts ;
   - une synthèse de trois lignes au plus.
2. Pour une séance, renseigner son champ `relecture` (date, `verdicts` des
   quatre relecteurs), puis relancer `valider`.
3. Pour une fiche de la bibliothèque commune relue sans point bloquant,
   proposer au mainteneur de passer `relecture.statut` à `relu-ia`.

## 4. Restituer au coach

- **Verdict global** : `bloquant` si un relecteur est bloquant, sinon
  `a-revoir` s'il y a au moins un point à revoir, sinon `ok`.
- Les points bloquants d'abord, en langage simple, avec une correction
  possible pour chacun.
- Ne jamais recopier une donnée personnelle signalée : désigner son
  emplacement (bloc, champ).
- Proposer de corriger la séance (`/coach-rugby:seance`), puis de relire à
  nouveau. Si le verdict est `ok`, proposer `/coach-rugby:exporter`.
