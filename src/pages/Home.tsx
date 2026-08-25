import { motion } from 'framer-motion';
import { Trophy, BarChart3, Settings as SettingsIcon, LogOut, Zap, GraduationCap } from 'lucide-react';
import { useProfileStore } from '../stores/useProfileStore';
import { useFormationStore } from '../stores/useFormationStore';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import Icon from '../lib/Icon';
import { getModuleStats, getStars } from '../lib/questionUtils';

interface Props {
  onStartExam: (module: number | 'all') => void;
  onStartQuiz: (module: number | 'all') => void;
  onDashboard: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export default function Home({ onStartExam, onStartQuiz, onDashboard, onLeaderboard, onSettings, onLogout }: Props) {
  const profile = useProfileStore(s => s.getActiveProfile());
  const formation = useFormationStore(s => s.formation);
  if (!profile || !formation) return null;

  const examHistory = profile.history.filter(h => h.mode === 'exam');
  const stats = getModuleStats(formation, examHistory);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar index={profile.avatarIndex} size={48} />
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-white/50">
              {formation.shortName} - Niveau {profile.level} - {profile.xp} XP
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDashboard} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Tableau de bord">
            <BarChart3 size={20} className="text-white/60" />
          </button>
          <button onClick={onLeaderboard} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Classement">
            <Trophy size={20} className="text-white/60" />
          </button>
          <button onClick={onSettings} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Paramètres">
            <SettingsIcon size={20} className="text-white/60" />
          </button>
          <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Changer de profil">
            <LogOut size={20} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Mode selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card gradient="from-violet-600 to-indigo-700" hoverable onClick={() => onStartExam('all')}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold">Mode Examen</h3>
              <p className="text-sm text-white/70">20 questions - {formation.allModulesLabel}</p>
            </div>
          </div>
        </Card>
        <Card gradient="from-orange-500 to-red-600" hoverable onClick={() => onStartQuiz('all')}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold">Mode Quiz</h3>
              <p className="text-sm text-white/70">Chrono 35s - {formation.allModulesLabel}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Module tiles */}
      <h2 className="text-xl font-bold mb-4">{formation.moduleSectionTitle}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {formation.modules.map((mod, i) => {
          const stars = getStars(stats[mod.id].avgScore);
          return (
            <motion.div
              key={mod.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card gradient={mod.color} hoverable className="relative">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={mod.icon} size={28} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-sm leading-tight">{mod.name}</h3>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-sm ${s <= stars ? 'text-amber-300' : 'text-white/20'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartExam(mod.id); }}
                    className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Examen
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartQuiz(mod.id); }}
                    className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Quiz
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
