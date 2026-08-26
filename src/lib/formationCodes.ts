import { fingerprint, normalizeCode } from './fingerprint';
import { TEACHER_SALT, TEACHER_FINGERPRINT } from './teacherSecret';

const SALT = 'revision-tp:formation:';

/**
 * Empreinte du code de déverrouillage de chaque formation.
 * Les codes eux-mêmes n'apparaissent nulle part dans le dépôt.
 *
 * Pour changer un code : recalculer l'empreinte avec `scripts/code-empreinte.mjs`.
 */
const CODES: Record<string, string> = {
  msads: 'REMPLACER',
  advf: 'REMPLACER',
};

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

/** Une formation sans code déclaré reste ouverte, pour ne jamais bloquer sur un oubli de configuration. */
export function formationNeedsCode(formationId: string): boolean {
  return Boolean(CODES[formationId]) && CODES[formationId] !== 'REMPLACER';
}

/**
 * Accepte le code de la formation, ou le mot de passe de la formatrice qui sert de passe-partout.
 */
export function checkFormationCode(formationId: string, input: string): boolean {
  const code = normalizeCode(input);
  if (!code) return false;
  if (fingerprint(TEACHER_SALT + input.trim()) === TEACHER_FINGERPRINT) return true;
  const expected = CODES[formationId];
  if (!expected || expected === 'REMPLACER') return true;
  return fingerprint(SALT + formationId + ':' + code) === expected;
}
