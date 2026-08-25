import type { Formation, Question } from '../../types';
import questions from './advf.questions.json';

// TODO — à confirmer sur le REAC ADVF : le code RNCP (laissé vide, l'UI le masque)
// et l'intitulé exact des trois CCP.
export const advf: Formation = {
  id: 'advf',
  shortName: 'ADVF',
  appTitle: 'ADVF Révision',
  fullName: 'Assistant De Vie aux Familles',
  rncp: '',
  level: 'Niveau 3',
  moduleSectionTitle: 'Blocs de compétences (CCP)',
  modulePrefix: 'CCP',
  allModulesLabel: 'Tous les CCP',
  splashGradient: 'from-teal-950 via-emerald-900 to-teal-950',
  splashIcons: ['House', 'HandHeart', 'Baby'],
  pdfAccent: [16, 185, 129],
  modules: [
    { id: 1, name: 'Entretenir le logement et le linge d\'un particulier', color: 'from-emerald-500 to-teal-600', icon: 'House' },
    { id: 2, name: 'Accompagner la personne dans les actes essentiels du quotidien', color: 'from-sky-400 to-blue-500', icon: 'HandHeart' },
    { id: 3, name: 'Relayer les parents dans la prise en charge de leurs enfants à domicile', color: 'from-amber-400 to-orange-500', icon: 'Baby' },
  ],
  questions: questions as Question[],
};
