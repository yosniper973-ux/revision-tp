import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProfileStore } from './stores/useProfileStore';
import { useFormationStore } from './stores/useFormationStore';
import { useSound } from './hooks/useSound';
import SplashScreen from './pages/SplashScreen';
import FormationSelect from './pages/FormationSelect';
import ProfileSelect from './pages/ProfileSelect';
import ProfileCreate from './pages/ProfileCreate';
import Home from './pages/Home';
import ExamGame from './pages/ExamGame';
import QuizGame from './pages/QuizGame';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import type { GameResult } from './types';

type Screen =
  | 'splash'
  | 'formation-select'
  | 'profile-select'
  | 'profile-create'
  | 'home'
  | 'exam'
  | 'quiz'
  | 'results'
  | 'dashboard'
  | 'leaderboard'
  | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [gameModule, setGameModule] = useState<number | 'all'>('all');
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const { setEnabled } = useSound();

  const { activeProfileId, addResult, getActiveProfile } = useProfileStore();
  const formation = useFormationStore(s => s.formation);
  /** Vrai quand on change de formation depuis les paramètres : permet de revenir en arrière. */
  const [changingFormation, setChangingFormation] = useState(false);

  useEffect(() => {
    setEnabled(soundEnabled);
  }, [soundEnabled, setEnabled]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const handleSplashDone = useCallback(() => {
    if (!formation) setScreen('formation-select');
    else if (activeProfileId) setScreen('home');
    else setScreen('profile-select');
  }, [formation, activeProfileId]);

  const handleFormationSelected = useCallback(() => {
    setChangingFormation(false);
    // Chaque formation a ses propres profils : on reprend celui déjà actif s'il existe.
    setScreen(useProfileStore.getState().activeProfileId ? 'home' : 'profile-select');
  }, []);

  const handleChangeFormation = useCallback(() => {
    setChangingFormation(true);
    setScreen('formation-select');
  }, []);

  const handleStartExam = useCallback((module: number | 'all') => {
    setGameModule(module);
    setScreen('exam');
  }, []);

  const handleStartQuiz = useCallback((module: number | 'all') => {
    setGameModule(module);
    setScreen('quiz');
  }, []);

  const handleFinish = useCallback((result: GameResult) => {
    const profileBefore = getActiveProfile();
    const badgesBefore = profileBefore?.badges ?? [];
    addResult(result);
    const profileAfter = getActiveProfile();
    const badgesAfter = profileAfter?.badges ?? [];
    const earned = badgesAfter.filter(b => !badgesBefore.includes(b));
    setNewBadges(earned);
    setLastResult(result);
    setScreen('results');
  }, [addResult, getActiveProfile]);

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {screen === 'splash' && (
            <SplashScreen formation={formation} onDone={handleSplashDone} />
          )}

          {screen === 'formation-select' && (
            <FormationSelect
              onSelect={handleFormationSelected}
              onBack={changingFormation ? () => setScreen('settings') : undefined}
            />
          )}

          {screen === 'profile-select' && (
            <ProfileSelect
              onSelect={() => setScreen('home')}
              onCreateNew={() => setScreen('profile-create')}
            />
          )}

          {screen === 'profile-create' && (
            <ProfileCreate
              onDone={() => setScreen('home')}
              onBack={() => setScreen('profile-select')}
            />
          )}

          {screen === 'home' && (
            <Home
              onStartExam={handleStartExam}
              onStartQuiz={handleStartQuiz}
              onDashboard={() => setScreen('dashboard')}
              onLeaderboard={() => setScreen('leaderboard')}
              onSettings={() => setScreen('settings')}
              onLogout={() => setScreen('profile-select')}
            />
          )}

          {screen === 'exam' && (
            <ExamGame
              module={gameModule}
              onFinish={handleFinish}
              onBack={() => setScreen('home')}
            />
          )}

          {screen === 'quiz' && (
            <QuizGame
              module={gameModule}
              onFinish={handleFinish}
              onBack={() => setScreen('home')}
            />
          )}

          {screen === 'results' && lastResult && (
            <Results
              result={lastResult}
              newBadges={newBadges}
              onHome={() => setScreen('home')}
              onRetry={() => {
                if (lastResult.mode === 'exam') setScreen('exam');
                else setScreen('quiz');
              }}
            />
          )}

          {screen === 'dashboard' && (
            <Dashboard onBack={() => setScreen('home')} />
          )}

          {screen === 'leaderboard' && (
            <Leaderboard onBack={() => setScreen('home')} />
          )}

          {screen === 'settings' && (
            <Settings
              onBack={() => setScreen('home')}
              onChangeFormation={handleChangeFormation}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              fontSize={fontSize}
              onFontSize={setFontSize}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
