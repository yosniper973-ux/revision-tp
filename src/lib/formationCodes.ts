import { fingerprint, normalizeCode } from './fingerprint';
import { TEACHER_SALT, TEACHER_FINGERPRINT } from './teacherSecret';

const SALT = 'revision-tp:formation:';

/**
 * Formations qui exigent une activation au premier accès sur un poste.
 * Le code attendu est celui de la formatrice : elle le saisit elle-même chez l'apprenant,
 * qui ne le connaît donc pas.
 */
const REQUIRES_ACTIVATION = new Set(['msads', 'advf']);

/**
 * Codes propres à une formation, si un jour il en faut de distincts.
 * Vide : seule la clé de la formatrice ouvre. Les codes n'apparaissent jamais en clair,
 * leur empreinte se calcule avec `scripts/code-empreinte.mjs`.
 */
const CODES: Record<string, string> = {};

function unlockKey(formationId: string): string {
  return `revision-unlocked-${formationId}`;
}

/** Une formation déverrouillée le reste sur ce poste : le code n'est demandé qu'une fois. */
export function isFormationUnlocked(formationId: string): boolean {
  return localStorage.getItem(unlockKey(formationId)) === '1';
}

export function markFormationUnlocked(formationId: string): void {
  localStorage.setItem(unlockKey(formationId), '1');
}

export function formationNeedsCode(formationId: string): boolean {
  return REQUIRES_ACTIVATION.has(formationId);
}

/**
 * Accepte le code de la formation, ou le mot de passe de la formatrice qui sert de passe-partout.
 */
export function checkFormationCode(formationId: string, input: string): boolean {
  const code = normalizeCode(input);
  if (!code) return false;
  // La clé de la formatrice ouvre toutes les formations.
  if (fingerprint(TEACHER_SALT + input.trim()) === TEACHER_FINGERPRINT) return true;
  const expected = CODES[formationId];
  if (!expected) return false;
  return fingerprint(SALT + formationId + ':' + code) === expected;
}
