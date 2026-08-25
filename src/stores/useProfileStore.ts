import { create } from 'zustand';
import type { AppData, Profile, GameResult } from '../types';
import { BADGES } from '../data/badges';

/** Clé utilisée avant le multi-formation : contenait les profils MSADS. */
const LEGACY_KEY = 'msads-revision-data';

function storageKey(formationId: string): string {
  return `revision-data-${formationId}`;
}

function loadData(formationId: string): AppData {
  try {
    const raw = localStorage.getItem(storageKey(formationId));
    if (raw) return JSON.parse(raw);

    // Reprise des profils créés avant le passage au multi-formation.
    if (formationId === 'msads') {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        localStorage.setItem(storageKey('msads'), legacy);
        return JSON.parse(legacy);
      }
    }
  } catch { /* ignore */ }
  return { profiles: [], activeProfileId: null };
}

function saveData(formationId: string | null, data: AppData) {
  if (!formationId) return;
  localStorage.setItem(storageKey(formationId), JSON.stringify(data));
}

function calcLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

interface ProfileStore {
  /** Formation dont les profils sont actuellement chargés. */
  formationId: string | null;
  profiles: Profile[];
  activeProfileId: string | null;
  /** Charge les profils de la formation donnée. Chaque formation a ses propres profils. */
  setFormation: (formationId: string) => void;
  getActiveProfile: () => Profile | null;
  createProfile: (name: string, avatarIndex: number) => void;
  selectProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  addResult: (result: GameResult) => void;
  resetProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  formationId: null,
  profiles: [],
  activeProfileId: null,

  setFormation: (formationId) => {
    if (get().formationId === formationId) return;
    const data = loadData(formationId);
    set({ formationId, profiles: data.profiles, activeProfileId: data.activeProfileId });
  },

  getActiveProfile: () => {
    const { profiles, activeProfileId } = get();
    return profiles.find(p => p.id === activeProfileId) ?? null;
  },

  createProfile: (name, avatarIndex) => {
    const newProfile: Profile = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      avatarIndex,
      createdAt: new Date().toISOString(),
      xp: 0,
      level: 1,
      history: [],
      badges: [],
      bestScores: {},
    };
    set(state => {
      const profiles = [...state.profiles, newProfile];
      const data = { profiles, activeProfileId: newProfile.id };
      saveData(state.formationId, data);
      return data;
    });
  },

  selectProfile: (id) => {
    set(state => {
      saveData(state.formationId, { profiles: state.profiles, activeProfileId: id });
      return { activeProfileId: id };
    });
  },

  deleteProfile: (id) => {
    set(state => {
      const profiles = state.profiles.filter(p => p.id !== id);
      const activeProfileId = state.activeProfileId === id ? null : state.activeProfileId;
      const data = { profiles, activeProfileId };
      saveData(state.formationId, data);
      return data;
    });
  },

  addResult: (result) => {
    set(state => {
      const profiles = state.profiles.map(p => {
        if (p.id !== state.activeProfileId) return p;
        const history = [...p.history, result];
        const correctCount = result.details.filter(d => d.correct).length;
        const xpGain = result.mode === 'exam'
          ? correctCount * 50
          : (result.points ?? 0);
        const xp = p.xp + xpGain;
        const level = calcLevel(xp);

        const moduleKey = `${result.mode}-${result.module}`;
        const bestScores = { ...p.bestScores };
        const currentScore = result.mode === 'exam' ? result.score : (result.points ?? 0);
        if (!bestScores[moduleKey] || currentScore > bestScores[moduleKey]) {
          bestScores[moduleKey] = currentScore;
        }

        const updatedProfile: Profile = { ...p, history, xp, level, bestScores };
        const newBadges = BADGES
          .filter(b => !p.badges.includes(b.id) && b.condition(updatedProfile))
          .map(b => b.id);
        updatedProfile.badges = [...p.badges, ...newBadges];

        return updatedProfile;
      });
      saveData(state.formationId, { profiles, activeProfileId: state.activeProfileId });
      return { profiles };
    });
  },

  resetProfile: (id) => {
    set(state => {
      const profiles = state.profiles.map(p => {
        if (p.id !== id) return p;
        return { ...p, xp: 0, level: 1, history: [], badges: [], bestScores: {} };
      });
      saveData(state.formationId, { profiles, activeProfileId: state.activeProfileId });
      return { profiles };
    });
  },
}));
