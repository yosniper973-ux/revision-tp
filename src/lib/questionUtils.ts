import type { Formation, Question } from '../types';

export function getQuestionsByModule(formation: Formation, module: number): Question[] {
  return formation.questions.filter(q => q.module === module);
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickQuestions(formation: Formation, module: number | 'all', count: number): Question[] {
  const pool = module === 'all' ? formation.questions : getQuestionsByModule(formation, module);
  return shuffleArray(pool).slice(0, count);
}

export function getModuleName(formation: Formation, module: number | 'all'): string {
  if (module === 'all') return formation.allModulesLabel;
  return formation.modules.find(m => m.id === module)?.name ?? `${formation.modulePrefix}${module}`;
}

export function getModuleStats(
  formation: Formation,
  history: { module: number | 'all'; score: number; total: number }[],
) {
  const stats: Record<number, { attempts: number; avgScore: number; bestScore: number }> = {};
  for (const m of formation.modules) {
    const moduleResults = history.filter(h => h.module === m.id);
    if (moduleResults.length === 0) {
      stats[m.id] = { attempts: 0, avgScore: 0, bestScore: 0 };
    } else {
      const scores = moduleResults.map(h => (h.score / h.total) * 20);
      stats[m.id] = {
        attempts: moduleResults.length,
        avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
        bestScore: Math.max(...scores),
      };
    }
  }
  return stats;
}

export function getStars(avgScore: number): number {
  if (avgScore >= 18) return 3;
  if (avgScore >= 14) return 2;
  if (avgScore >= 10) return 1;
  return 0;
}
