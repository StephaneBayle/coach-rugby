# Installer et utiliser coach-rugby

coach-rugby est un plugin pour Claude. Il fonctionne dans **Cowork /
Claude desktop**, ce qui est conseillé si vous n'êtes pas informaticien, et
dans **Claude Code**.

## Cowork / Claude desktop

### Installation

1. Ouvrez Claude desktop, puis **Personnaliser** › **Plugins**.
2. **Ajouter** › **Ajouter une marketplace**, puis saisissez
   `StephaneBayle/coach-rugby`.
3. Installez **coach-rugby** dans la liste.

**Autre possibilité** : téléchargez le fichier `coach-rugby-vX.Y.Z.zip` de la
[dernière version](https://github.com/StephaneBayle/coach-rugby/releases/latest),
puis **Ajouter** › **Téléverser un plugin**. Ne décompressez pas le zip.

### Votre dossier saison

Le plugin enregistre vos équipes, saisons et séances dans un dossier de votre
ordinateur, **`Rugby-Saisons`**, placé dans votre dossier personnel.

- Si Cowork vous demande un dossier de travail, créez ou choisissez ce dossier
  `Rugby-Saisons`.
- Ne le placez pas dans un dossier synchronisé avec GitHub. iCloud ou Google
  Drive sont possibles, mais restez prudent si vous partagez ce dossier : il
  peut contenir les noms de vos joueurs, que le plugin protège.

### Premier pas

Écrivez simplement : *« Je suis éducateur des M10 de mon club, aide-moi à
préparer ma saison »*. Vous pouvez aussi taper `/coach-rugby:coach`.

## Claude Code

```text
/plugin marketplace add StephaneBayle/coach-rugby
/plugin install coach-rugby@coach-rugby
```

Ouvrez ensuite une nouvelle session. Si Node.js 20 ou plus est installé, le
plugin s'en sert pour aller plus vite :

- validation automatique ;
- PDF via Google Chrome ;
- protection renforcée de vos données lors des publications sur GitHub.

Sans Node, tout fonctionne aussi.

Options (menu des plugins) :

| Option | Rôle | Par défaut |
|---|---|---|
| Dossier saison | Où sont vos équipes et séances | `~/Rugby-Saisons` |
| Chemin de Chrome | Pour l'export PDF | détection automatique |

## Au bord du terrain, sur téléphone

Après `/coach-rugby:exporter`, envoyez-vous la fiche **`fiche-telephone.html`**
par mail, par messagerie ou par AirDrop.

- Elle s'ouvre dans le navigateur du téléphone, **sans connexion**.
- Une version PDF au format téléphone est aussi produite quand c'est
  possible.

## Avec Mon Coach Assistant (FFR)

[Mon Coach Assistant](https://monclubhouse.ffr.fr/actualites/mon-coach-assistant-arrive-votre-assistant-coach-100-gratuit)
est l'outil gratuit de la FFR, dans Mon Club House, pour administrer votre
équipe : effectif licencié, calendrier officiel, sondages de présence.
coach-rugby est son complément pédagogique, pour les clubs. Trois passerelles
existent, toutes par **copier-coller**, puisqu'aucune connexion directe n'est
possible et que le plugin ne vous demandera jamais vos identifiants :

| Vous voulez… | Faites |
|---|---|
| Reprendre votre calendrier | Copiez le calendrier de Mon Coach Assistant, ou faites une capture, et collez-le dans `/coach-rugby:saison` |
| Partir des présences | Collez le résultat d'un sondage dans `/coach-rugby:seance` : seul le **nombre** de présents est gardé |
| Mettre votre séance dans Mon Coach Assistant | Ouvrez `exports/pour-mca.txt`, copiez tout, puis collez-le dans la description de la séance |

## Mettre à jour

- **Cowork** : *Personnaliser* › *Plugins* › coach-rugby › mettre à jour, ou
  téléverser le nouveau zip.
- **Claude Code** :

  ```text
  /plugin marketplace update coach-rugby
  ```

Votre dossier saison n'est jamais touché par une mise à jour.

## En cas de problème

- **Pas de PDF** : ouvrez la fiche HTML dans votre navigateur, puis
  *Imprimer* › *Enregistrer en PDF*.
- **Le plugin ne trouve pas vos équipes** : dans Cowork, vérifiez que le
  dossier de travail est bien `Rugby-Saisons` ; dans Claude Code, vérifiez
  l'option « Dossier saison ».
- **Une règle de jeu vous semble fausse** : les règles changent chaque saison
  et peuvent varier selon votre comité. Signalez-le avec le formulaire
  [« Une erreur de règlement »](https://github.com/StephaneBayle/coach-rugby/issues/new?template=erreur-reglement.yml).
- **Autre problème** : [« Un problème avec le plugin »](https://github.com/StephaneBayle/coach-rugby/issues/new?template=bug.yml).
  Ne mettez **aucune donnée personnelle** d'un joueur.
