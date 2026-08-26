import type { DragDropOption, Question } from '../types';

/** Rend lisible ce que l'apprenant a saisi, selon le type de question. */
export function formatUserAnswer(question: Question, userAnswer: (number | string)[]): string {
  if (userAnswer.length === 0) return 'Aucune réponse';

  switch (question.type) {
    case 'qcm_single':
    case 'qcm_multi':
    case 'true_false': {
      const options = question.options as string[];
      return userAnswer
        .map(i => (typeof i === 'number' ? options[i] : String(i)))
        .filter(Boolean)
        .join(' • ');
    }
    case 'fill_blank':
      return userAnswer.map(v => `« ${v} »`).join(' , ');
    case 'open_text':
      return `« ${userAnswer[0]} »`;
    case 'drag_drop':
      return 'Associations erronées';
    default:
      return userAnswer.join(', ');
  }
}

/** Rend lisible la réponse attendue. */
export function formatExpectedAnswer(question: Question): string {
  switch (question.type) {
    case 'qcm_single':
    case 'qcm_multi':
    case 'true_false': {
      const options = question.options as string[];
      return question.correct
        .map(i => (typeof i === 'number' ? options[i] : String(i)))
        .filter(Boolean)
        .join(' • ');
    }
    case 'fill_blank':
      return question.correct.map(v => `« ${v} »`).join(' , ');
    case 'open_text':
      return `Mots-clés attendus : ${question.keywords.join(', ')}`;
    case 'drag_drop':
      return (question.options as DragDropOption[])
        .map(o => `${o.left} → ${o.right}`)
        .join(' | ');
    default:
      return '—';
  }
}

/** Énoncé lisible hors contexte : les trous deviennent des points de suspension. */
export function questionLabel(question: Question): string {
  return question.question.replace(/___/g, '…');
}
