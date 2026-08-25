import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Sparkles, Trophy } from 'lucide-react';
import type { Formation } from '../types';
import Icon from '../lib/Icon';

interface Props {
  /** Formation retenue du dernier lancement, ou null au tout premier démarrage. */
  formation: Formation | null;
  onDone: () => void;
}

const ACCENTS = ['text-violet-400', 'text-orange-400', 'text-cyan-400'];

export default function SplashScreen({ formation, onDone }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const gradient = formation?.splashGradient ?? 'from-indigo-950 via-purple-900 to-indigo-950';
  const title = formation?.appTitle ?? 'Révision TP';
  const subtitle = formation?.fullName ?? 'Réviser son titre professionnel';
  const footer = formation
    ? [formation.rncp, formation.level].filter(Boolean).join(' - ')
    : '';

  return (
    <div className={`h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient}`}>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className="flex justify-center gap-4 mb-8">
            {(formation?.splashIcons ?? []).length > 0
              ? formation!.splashIcons.slice(0, 3).map((name, i) => (
                  <motion.div
                    key={name + i}
                    animate={{ rotate: phase >= 1 ? 360 : 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  >
                    <Icon name={name} size={40} className={ACCENTS[i % ACCENTS.length]} />
                  </motion.div>
                ))
              : [GraduationCap, Sparkles, Trophy].map((Cmp, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: phase >= 1 ? 360 : 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  >
                    <Cmp size={40} className={ACCENTS[i % ACCENTS.length]} />
                  </motion.div>
                ))}
          </div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent mb-4"
          >
            {title}
          </motion.h1>

          {phase >= 1 && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white/60 text-lg"
            >
              {subtitle}
            </motion.p>
          )}

          {phase >= 2 && footer && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white/40 text-sm mt-2"
            >
              {footer}
            </motion.p>
          )}

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 2, ease: 'linear' }}
            className="h-1 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full mx-auto mt-8"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
