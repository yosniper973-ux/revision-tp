import type { Formation, Question } from '../../types';
import questions from './advf.questions.json';

// Structure conforme au référentiel d'évaluation TP-00391 millésime 07
// (arrêté du 04/07/2023, JO du 09/07/2023).
export const advf: Formation = {
  id: 'advf',
  shortName: 'ADVF',
  appTitle: 'ADVF Révision',
  fullName: 'Assistant de vie aux familles',
  rncp: 'RNCP35506',
  level: 'Niveau 3',
  moduleSectionTitle: 'Blocs de compétences (CCP)',
  modulePrefix: 'CCP',
  allModulesLabel: 'Tous les CCP',
  splashGradient: 'from-teal-950 via-emerald-900 to-teal-950',
  splashIcons: ['House', 'HandHeart', 'Baby'],
  pdfAccent: [16, 185, 129],
  modules: [
    {
      id: 1,
      name: 'Entretenir le logement et le linge d\'un particulier',
      color: 'from-emerald-500 to-teal-600',
      icon: 'House',
    },
    {
      id: 2,
      name: 'Accompagner la personne dans ses activités essentielles du quotidien et dans ses projets',
      color: 'from-sky-400 to-blue-500',
      icon: 'HandHeart',
    },
    {
      id: 3,
      name: 'Assurer le relai du parent dans la garde de l\'enfant à domicile',
      color: 'from-amber-400 to-orange-500',
      icon: 'Baby',
    },
  ],
  questions: questions as Question[],
};
