# Sécurité et données personnelles

## Une donnée personnelle a été publiée par erreur

Un nom de joueur, une date de naissance, un numéro de licence, un téléphone,
une information de santé… apparaît dans une issue, une pull request, une
discussion ou le code ?

1. **Ne le recopiez pas** dans un nouveau message public.
2. Signalez-le **en privé** via
   [« Report a vulnerability »](https://github.com/StephaneBayle/coach-rugby/security/advisories/new),
   en indiquant seulement le lien vers le contenu concerné.
3. Le mainteneur supprime ou masque le contenu, réécrit l'historique si
   nécessaire et vous tient informé.

Les mineurs sont nombreux parmi les joueurs concernés : ces signalements sont
traités en priorité.

## Une faille dans le plugin

Même procédure : un avis de sécurité privé, avec une description et, si
possible, les étapes pour reproduire. Merci de ne pas ouvrir d'issue publique.

## Ce que fait le plugin pour éviter les fuites

- Les données des coachs restent dans leur dossier saison, hors de tout dépôt.
- Le hook `garde-rgpd` bloque, dans Claude Code, les commits, pushs, issues et
  PR qui contiennent un nom protégé ou une donnée personnelle reconnaissable.
- La CI rejette les fichiers qui en contiennent.
- La protection contre la publication de secrets de GitHub est activée.

Ces protections réduisent le risque sans le supprimer : un prénom isolé, par
exemple, n'est pas détectable de façon fiable. La relecture humaine reste
indispensable.
