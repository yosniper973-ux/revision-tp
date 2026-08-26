import { create } from 'zustand';
import type { LearnerReport } from '../lib/resultsExport';
import { reportKey } from '../lib/resultsExport';

const MODE_KEY = 'revision-mode-formateur';
const REPORTS_KEY = 'revision-promo';

/**
 * Empreinte du mot de passe qui déverrouille le mode formateur.
 * Le mot de passe lui-même n'apparaît pas dans le code source.
 *
 * Attention : dans une application de bureau, tout le code est lisible sur le poste.
 * Ce verrou empêche une activation par curiosité, il ne protège pas contre quelqu'un
 * de déterminé. Ne rien y mettre de confidentiel.
 */
const SALT = 'revision-tp:formateur:';
const PASSWORD_FINGERPRINT = 'wz62ab';

function fingerprint(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h * 33) ^ value.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/**
 * Données du mode formateur : elles ne dépendent pas de la formation active,
 * puisque la formatrice suit des apprenants de plusieurs formations.
 */
function loadMode(): boolean {
  return localStorage.getItem(MODE_KEY) === '1';
}

function loadReports(): LearnerReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveReports(reports: LearnerReport[]) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

/** Un apprenant est identifié par sa formation et son prénom, indépendamment de la date d'envoi. */
function learnerKey(r: LearnerReport): string {
  return `${r.formationId}|${r.profileName.trim().toLowerCase()}`;
}

interface TeacherStore {
  teacherMode: boolean;
  reports: LearnerReport[];
  /** Vérifie le mot de passe sans rien activer : sert aussi à autoriser un changement de formation. */
  checkPassword: (password: string) => boolean;
  /** Active le mode formateur si le mot de passe est le bon. */
  unlockTeacherMode: (password: string) => boolean;
  /** Désactive le mode formateur : aucun mot de passe requis pour sortir. */
  disableTeacherMode: () => void;
  /** Ajoute un envoi. Retourne 'ajouté', 'remplacé' si plus récent, ou 'ignoré' si déjà connu. */
  importReport: (report: LearnerReport) => 'ajouté' | 'remplacé' | 'ignoré';
  removeReport: (report: LearnerReport) => void;
  clearReports: () => void;
}

export const useTeacherStore = create<TeacherStore>((set, get) => ({
  teacherMode: loadMode(),
  reports: loadReports(),

  checkPassword: (password) => fingerprint(SALT + password.trim()) === PASSWORD_FINGERPRINT,

  unlockTeacherMode: (password) => {
    if (!get().checkPassword(password)) return false;
    localStorage.setItem(MODE_KEY, '1');
    set({ teacherMode: true });
    return true;
  },

  disableTeacherMode: () => {
    localStorage.setItem(MODE_KEY, '0');
    set({ teacherMode: false });
  },

  importReport: (report) => {
    const reports = [...get().reports];
    const idx = reports.findIndex(r => learnerKey(r) === learnerKey(report));

    if (idx === -1) {
      reports.push(report);
      saveReports(reports);
      set({ reports });
      return 'ajouté';
    }

    // Un envoi plus ancien ou identique n'écrase pas ce qui est déjà connu :
    // le fichier contient tout l'historique, le plus récent fait foi.
    if (reportKey(reports[idx]) === reportKey(report) || reports[idx].exportedAt >= report.exportedAt) {
      return 'ignoré';
    }
    reports[idx] = report;
    saveReports(reports);
    set({ reports });
    return 'remplacé';
  },

  removeReport: (report) => {
    const reports = get().reports.filter(r => learnerKey(r) !== learnerKey(report));
    saveReports(reports);
    set({ reports });
  },

  clearReports: () => {
    saveReports([]);
    set({ reports: [] });
  },
}));
