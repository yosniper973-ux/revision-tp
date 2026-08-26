/**
 * Empreinte non réversible d'un secret, pour ne pas écrire les codes en clair
 * dans les sources ni dans le build.
 *
 * Attention : sur une application de bureau, tout le code est lisible sur le poste.
 * Ces verrous découragent un usage non prévu, ils ne résistent pas à quelqu'un de
 * déterminé. Ne rien protéger de confidentiel avec.
 */
export function fingerprint(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h * 33) ^ value.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/** Normalise la saisie : les codes sont insensibles à la casse et aux espaces. */
export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '');
}
