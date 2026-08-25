import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, Award, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useProfileStore } from '../stores/useProfileStore';
import { useFormationStore } from '../stores/useFormationStore';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Avatar from '../components/ui/Avatar';
import { getModuleStats, getStars } from '../lib/questionUtils';
import { BADGES } from '../data/badges';

interface Props {
  onBack: () => void;
}

export default function Dashboard({ onBack }: Props) {
  const profile = useProfileStore(s => s.getActiveProfile());
  const formation = useFormationStore(s => s.formation);
  if (!profile || !formation) return null;

  const examHistory = profile.history.filter(h => h.mode === 'exam');
  const stats = getModuleStats(formation, examHistory);

  const radarData = formation.modules.map(m => ({
    module: `${formation.modulePrefix}${m.id}`,
    fullName: m.name,
    score: stats[m.id].avgScore,
  }));

  const historyData = examHistory.slice(-10).map((h, i) => ({
    name: `#${i + 1}`,
    note: Math.round((h.score / h.total) * 20 * 10) / 10,
  }));

  const totalExams = examHistory.length;
  const avgNote = totalExams > 0
    ? Math.round(examHistory.reduce((sum, h) => sum + (h.score / h.total) * 20, 0) / totalExams * 10) / 10
    : 0;

  const xpForNext = ((profile.level) * 500) - profile.xp;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
      </div>

      {/* Profile overview */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar index={profile.avatarIndex} size={64} />
        <div className="flex-1">
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-sm text-white/50 mb-2">Niveau {profile.level} - {profile.xp} XP</p>
          <ProgressBar value={profile.xp % 500} max={500} color="bg-violet-500" />
          <p className="text-xs text-white/30 mt-1">{xpForNext} XP pour le niveau suivant</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <TrendingUp size={20} className="mx-auto text-violet-400 mb-1" />
          <p className="text-2xl font-bold">{avgNote}</p>
          <p className="text-xs text-white/50">Moy. /20</p>
        </Card>
        <Card className="text-center">
          <Target size={20} className="mx-auto text-cyan-400 mb-1" />
          <p className="text-2xl font-bold">{totalExams}</p>
          <p className="text-xs text-white/50">Examens</p>
        </Card>
        <Card className="text-center">
          <Award size={20} className="mx-auto text-amber-400 mb-1" />
          <p className="text-2xl font-bold">{profile.badges.length}</p>
          <p className="text-xs text-white/50">Badges</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Radar chart */}
        <Card>
          <h3 className="font-bold mb-4">Radar des compétences</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="module" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              <Radar dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* History chart */}
        <Card>
          <h3 className="font-bold mb-4">Progression (derniers examens)</h3>
          {historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={historyData}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis domain={[0, 20]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="note" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-white/30">
              Pas encore de données
            </div>
          )}
        </Card>
      </div>

      {/* Module details */}
      <Card className="mb-6">
        <h3 className="font-bold mb-4">Détail par {formation.modulePrefix === 'CCP' ? 'CCP' : 'module'}</h3>
        <div className="space-y-3">
          {formation.modules.map(mod => {
            const s = stats[mod.id];
            const stars = getStars(s.avgScore);
            return (
              <div key={mod.id} className="flex items-center gap-3">
                <span className="text-sm font-bold w-12">{formation.modulePrefix}{mod.id}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{mod.name}</span>
                    <span className="text-white/50">{s.attempts > 0 ? `${s.avgScore}/20` : '-'}</span>
                  </div>
                  <ProgressBar value={s.avgScore} max={20} color={s.avgScore >= 14 ? 'bg-emerald-500' : s.avgScore >= 10 ? 'bg-amber-500' : 'bg-red-500'} height="h-2" />
                </div>
                <div className="flex gap-0.5 w-16 justify-end">
                  {[1, 2, 3].map(star => (
                    <span key={star} className={`text-sm ${star <= stars ? 'text-amber-300' : 'text-white/10'}`}>★</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <h3 className="font-bold mb-4">Badges ({profile.badges.length}/{BADGES.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map(badge => {
            const earned = profile.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl text-center transition-all ${
                  earned ? 'bg-amber-500/15 border border-amber-400/30' : 'bg-white/5 border border-white/5 opacity-40'
                }`}
              >
                <p className={`font-bold text-sm ${earned ? 'text-amber-300' : 'text-white/40'}`}>{badge.name}</p>
                <p className="text-xs text-white/40 mt-1">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
