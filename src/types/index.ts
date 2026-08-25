import type { IconName } from '../lib/icons';

export type { IconName };

export type QuestionType = 'qcm_single' | 'qcm_multi' | 'true_false' | 'open_text' | 'drag_drop' | 'fill_blank';

export interface DragDropOption {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  module: number;
  type: QuestionType;
  difficulty: number;
  question: string;
  options: string[] | DragDropOption[];
  correct: (number | string)[];
  keywords: string[];
  explanation: string;
}

/** Un module (MSADS) ou un bloc de compétences / CCP (ADVF). */
export interface FormationModule {
  /** Numéro du module, tel que référencé par `Question.module`. */
  id: number;
  name: string;
  /** Dégradé Tailwind, ex. 'from-violet-500 to-purple-600'. */
  color: string;
  /** Nom d'icône déclaré dans `src/lib/icons.ts`. */
  icon: IconName;
}

/** Tout ce qui distingue une formation d'une autre : contenu + identité visuelle. */
export interface Formation {
  /** Identifiant technique, sert de clé de stockage. Ne jamais le changer. */
  id: string;
  /** Sigle affiché, ex. 'MSADS'. */
  shortName: string;
  /** Titre de l'app pour cette formation, ex. 'MSADS Révision'. */
  appTitle: string;
  /** Intitulé complet du titre professionnel. */
  fullName: string;
  /** Code RNCP, ex. 'RNCP36241'. */
  rncp: string;
  /** Niveau du titre, ex. 'Niveau 4'. */
  level: string;
  /** Titre de la section des modules sur l'accueil. */
  moduleSectionTitle: string;
  /** Préfixe court des modules dans les graphiques, ex. 'M' ou 'CCP'. */
  modulePrefix: string;
  /** Libellé de l'option « tous les modules ». */
  allModulesLabel: string;
  /** Dégradé Tailwind du fond de l'écran de démarrage. */
  splashGradient: string;
  /** Trois icônes affichées au démarrage. */
  splashIcons: IconName[];
  /** Couleur d'accent du PDF, en RGB. */
  pdfAccent: [number, number, number];
  modules: FormationModule[];
  questions: Question[];
}

export interface GameResult {
  id: string;
  date: string;
  mode: 'exam' | 'quiz';
  module: number | 'all';
  score: number;
  total: number;
  points?: number;
  details: AnswerDetail[];
}

export interface AnswerDetail {
  questionId: string;
  correct: boolean;
  userAnswer: (number | string)[];
  timeSpent?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (profile: Profile) => boolean;
}

export interface Profile {
  id: string;
  name: string;
  avatarIndex: number;
  createdAt: string;
  xp: number;
  level: number;
  history: GameResult[];
  badges: string[];
  bestScores: Record<string, number>;
}

export interface AppData {
  profiles: Profile[];
  activeProfileId: string | null;
}
