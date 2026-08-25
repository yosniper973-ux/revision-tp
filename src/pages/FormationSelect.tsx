import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { FORMATIONS } from '../data/formations';
import { useFormationStore } from '../stores/useFormationStore';
import Icon from '../lib/Icon';

interface Props {
  onSelect: () => void;
  /** Fourni uniquement quand on change de formation depuis l'app (pas au démarrage). */
  onBack?: () => void;
}

export default function FormationSelect({ onSelect, onBack }: Props) {
  const selectFormation = useFormationStore(s => s.selectFormation);

  const handleSelect = (id: string) => {
    selectFormation(id);
    onSelect();
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center justify-center p-8">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold mb-2">Quelle formation révises-tu ?</h1>
        <p className="text-white/50">Chaque formation a ses propres profils et ses propres scores</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl w-full">
        {FORMATIONS.map((formation, i) => {
          const available = formation.questions.length > 0;
          return (
            <motion.button
              key={formation.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => available && handleSelect(formation.id)}
              disabled={!available}
              className={`p-6 rounded-2xl border text-left transition-all ${
                available
                  ? 'bg-white/10 hover:bg-white/15 border-white/10 hover:border-white/25 cursor-pointer'
                  : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${formation.modules[0]?.color ?? 'from-violet-500 to-purple-600'} flex items-center justify-center mb-4`}>
                <Icon name={formation.modules[0]?.icon ?? 'BookOpen'} size={28} />
              </div>
              <h2 className="text-xl font-bold mb-1">{formation.shortName}</h2>
              <p className="text-sm text-white/60 leading-snug mb-3">{formation.fullName}</p>
              <p className="text-xs text-white/35">
                {[formation.rncp, formation.level].filter(Boolean).join(' — ')}
              </p>
              <p className="text-xs text-white/35 mt-1">
                {available
                  ? `${formation.questions.length} questions — ${formation.modules.length} ${formation.modulePrefix === 'CCP' ? 'CCP' : 'modules'}`
                  : 'Questions en préparation'}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
