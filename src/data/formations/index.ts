import type { Formation } from '../../types';
import { msads } from './msads';
import { advf } from './advf';

/** Toutes les formations proposées au démarrage. Ajouter une formation = ajouter une entrée ici. */
export const FORMATIONS: Formation[] = [msads, advf];

export function getFormation(id: string | null): Formation | null {
  if (!id) return null;
  return FORMATIONS.find(f => f.id === id) ?? null;
}
