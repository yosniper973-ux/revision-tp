import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { pickQuestions, getModuleName } from '../lib/questionUtils';
import { useFormationStore } from '../stores/useFormationStore';
import { calcQuizPoints } from '../lib/scoring';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../hooks/useSound';
import QuestionRenderer from '../components/questions/QuestionRenderer';
import TimerBar from '../components/game/TimerBar';
import ScoreDisplay from '../components/game/ScoreDisplay';
import Confetti from '../components/ui/Confetti';
import type { AnswerDetail, GameResult } from '../types';

const QUESTION_COUNT = 20;
const TIME_PER_QUESTION = 35000;

interface Props {
  module: number | 'all';
  onFinish: (result: GameResult) => void;
  onBack: () => void;
}

export default function QuizGame({ module, onFinish, onBack }: Props) {
  const formation = useFormationStore(s => s.formation)!;
  const questions = useMemo(() => pickQuestions(formation, module, QUESTION_COUNT), [formation, module]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { play } = useSound();

  const goNext = useCallback(() => {
    if (current >= questions.length - 1) {
      setGameOver(true);
      return;
    }
    setCurrent(c => c + 1);
    setWaiting(false);
  }, [current, questions.length]);

  const handleTimeout = useCallback(() => {
    if (waiting || gameOver) return;
    play('wrong');
    setAnswers(prev => [...prev, { questionId: questions[current].id, correct: false, userAnswer: [] }]);
    setCombo(0);
    setWaiting(true);
    setTimeout(goNext, 1500);
  }, [current, questions, play, goNext, waiting, gameOver]);

  const timer = useTimer(TIME_PER_QUESTION, handleTimeout);

  useEffect(() => {
    if (!gameOver && !waiting) {
      timer.reset();
    }
  }, [current, gameOver]);

  useEffect(() => {
    if (gameOver) {
      timer.stop();
      const score = answers.filter(a => a.correct).length;
      const result: GameResult = {
        id: Date.now().toString(36),
        date: new Date().toISOString(),
        mode: 'quiz',
        module,
        score,
        total: questions.length,
        points: totalPoints,
        details: answers,
      };
      onFinish(result);
    }
  }, [gameOver]);

  const handleAnswer = useCallback((selected: (number | string)[], correct: boolean) => {
    if (waiting || gameOver) return;
    timer.stop();
    setWaiting(true);

    const { points, newCombo } = calcQuizPoints(correct, timer.remaining, combo);
    setTotalPoints(p => p + points);
    setCombo(newCombo);
    setAnswers(prev => [...prev, { questionId: questions[current].id, correct, userAnswer: selected, timeSpent: TIME_PER_QUESTION - timer.remaining }]);

    if (correct) {
      play('correct');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    } else {
      play('wrong');
    }

    setTimeout(goNext, 2000);
  }, [current, combo, timer, questions, play, goNext, waiting, gameOver]);

  if (gameOver) return null;

  const question = questions[current];
  const moduleName = getModuleName(formation, module);

  return (
    <div className="h-full flex flex-col">
      <Confetti show={showConfetti} />

      {/* Header */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm text-white/50">{moduleName} - {current + 1}/{questions.length}</span>
          <ScoreDisplay points={totalPoints} combo={combo} />
        </div>
        <TimerBar progress={timer.progress} remaining={timer.remaining} />
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-6 leading-relaxed">
              {question.type === 'fill_blank' ? '' : question.question}
            </h2>

            <QuestionRenderer
              question={question}
              onAnswer={handleAnswer}
              disabled={waiting}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
