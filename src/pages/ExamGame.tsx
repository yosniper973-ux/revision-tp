import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, Info } from 'lucide-react';
import { pickQuestions, getModuleName } from '../lib/questionUtils';
import { useFormationStore } from '../stores/useFormationStore';
import { useSound } from '../hooks/useSound';
import QuestionRenderer from '../components/questions/QuestionRenderer';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import Confetti from '../components/ui/Confetti';
import type { Question, AnswerDetail, GameResult } from '../types';

interface Props {
  module: number | 'all';
  onFinish: (result: GameResult) => void;
  onBack: () => void;
}

export default function ExamGame({ module, onFinish, onBack }: Props) {
  const formation = useFormationStore(s => s.formation)!;
  const questions = useMemo(() => pickQuestions(formation, module, 20), [formation, module]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Map<number, AnswerDetail>>(new Map());
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { play } = useSound();

  const question = questions[current];
  const isAnswered = answers.has(current);

  const handleAnswer = useCallback((selected: (number | string)[], correct: boolean) => {
    if (answers.has(current)) return;
    const detail: AnswerDetail = {
      questionId: question.id,
      correct,
      userAnswer: selected,
    };
    setAnswers(prev => new Map(prev).set(current, detail));
    setShowExplanation(true);
    if (correct) {
      play('correct');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    } else {
      play('wrong');
    }
  }, [current, question, answers, play]);

  const goNext = () => {
    setShowExplanation(false);
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const goPrev = () => {
    setShowExplanation(false);
    if (current > 0) setCurrent(current - 1);
  };

  const finish = () => {
    const score = [...answers.values()].filter(a => a.correct).length;
    const result: GameResult = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      mode: 'exam',
      module,
      score,
      total: questions.length,
      details: questions.map((q, i) => answers.get(i) ?? { questionId: q.id, correct: false, userAnswer: [] }),
    };
    onFinish(result);
  };

  const answered = answers.size;
  const moduleName = getModuleName(formation, module);

  return (
    <div className="h-full flex flex-col">
      <Confetti show={showConfetti} />

      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm text-white/50">{moduleName}</span>
          <span className="text-sm font-bold">{current + 1}/{questions.length}</span>
        </div>
        <ProgressBar value={answered} max={questions.length} />
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/50">{question.type.replace('_', ' ').toUpperCase()}</span>
              <span className="text-xs text-white/30">{question.id}</span>
            </div>
            <h2 className="text-xl font-bold mb-6 leading-relaxed">{question.type === 'fill_blank' ? '' : question.question}</h2>

            <QuestionRenderer
              question={question}
              onAnswer={handleAnswer}
              disabled={isAnswered}
            />

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && isAnswered && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className={`p-4 rounded-xl border ${answers.get(current)?.correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                    <div className="flex items-start gap-2">
                      <Info size={18} className="text-white/60 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white/80 leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <Button variant="ghost" onClick={goPrev} disabled={current === 0}>
          <ArrowLeft size={18} className="mr-1" /> Précédent
        </Button>
        {current === questions.length - 1 ? (
          <Button onClick={finish} disabled={answered < questions.length}>
            Terminer ({answered}/{questions.length})
          </Button>
        ) : (
          <Button variant="secondary" onClick={goNext}>
            Suivant <ArrowRight size={18} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
