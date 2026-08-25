import { create } from 'zustand';
import type { Formation } from '../types';
import { getFormation } from '../data/formations';
import { useProfileStore } from './useProfileStore';

const ACTIVE_KEY = 'revision-active-formation';

interface FormationStore {
  formation: Formation | null;
  selectFormation: (id: string) => void;
  clearFormation: () => void;
}

export const useFormationStore = create<FormationStore>((set) => {
  // Reprise de la dernière formation utilisée, pour ne pas la redemander à chaque lancement.
  const saved = getFormation(localStorage.getItem(ACTIVE_KEY));
  if (saved) useProfileStore.getState().setFormation(saved.id);

  return {
    formation: saved,

    selectFormation: (id) => {
      const formation = getFormation(id);
      if (!formation) return;
      localStorage.setItem(ACTIVE_KEY, id);
      useProfileStore.getState().setFormation(id);
      set({ formation });
    },

    clearFormation: () => {
      localStorage.removeItem(ACTIVE_KEY);
      set({ formation: null });
    },
  };
});
