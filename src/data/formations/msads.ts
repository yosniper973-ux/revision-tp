import type { Formation, Question } from '../../types';
import questions from './msads.questions.json';

export const msads: Formation = {
  id: 'msads',
  shortName: 'MSADS',
  appTitle: 'MSADS Révision',
  fullName: 'Médiateur Social Accès aux Droits et Services',
  rncp: 'RNCP36241',
  level: 'Niveau 4',
  moduleSectionTitle: 'Modules thématiques',
  modulePrefix: 'M',
  allModulesLabel: 'Tous modules',
  splashGradient: 'from-indigo-950 via-purple-900 to-indigo-950',
  splashIcons: ['BookOpen', 'Users', 'Heart'],
  pdfAccent: [139, 92, 246],
  modules: [
    { id: 1, name: 'Fondamentaux & Déontologie', color: 'from-violet-500 to-purple-600', icon: 'BookOpen' },
    { id: 2, name: 'Posture du médiateur', color: 'from-orange-400 to-red-500', icon: 'Users' },
    { id: 3, name: 'Processus & Techniques de médiation', color: 'from-cyan-400 to-blue-500', icon: 'MessageCircle' },
    { id: 4, name: 'Accès aux droits & Numérique', color: 'from-emerald-400 to-teal-500', icon: 'Monitor' },
    { id: 5, name: 'Veille sociale & Territoire', color: 'from-amber-400 to-orange-500', icon: 'Map' },
    { id: 6, name: 'Inclusion & Handicap', color: 'from-pink-400 to-rose-500', icon: 'Heart' },
  ],
  questions: questions as Question[],
};
