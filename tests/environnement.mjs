// Chargé avant chaque fichier de test (node --import) : les tests ne lisent
// jamais le vrai dossier saison du coach (~/Rugby-Saisons) ni sa liste de
// joueurs protégés. Un dossier vide, propre à chaque fichier, en tient lieu ;
// les tests qui en ont besoin le remplacent.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.COACH_RUGBY_DOSSIER = mkdtempSync(path.join(tmpdir(), 'coach-rugby-tests-'));
delete process.env.CLAUDE_PLUGIN_OPTION_DOSSIER_SAISON;
delete process.env.CLAUDE_PLUGIN_OPTION_dossier_saison;
delete process.env.COACH_RUGBY_AUJOURDHUI;
delete process.env.EVAL_COACH_RUGBY_AUJOURDHUI;
delete process.env.EVAL_COACH_RUGBY_DOSSIER;
