import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, ArrowRight, Home as HomeIcon, Zap, ChevronDown, Info, FileDown, Mail, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Confetti from '../components/ui/Confetti';
import { getRecommendation } from '../lib/scoring';
import { getModuleName } from '../lib/questionUtils';
import { downloadResultsPdf, shareResultsByEmail } from '../lib/pdfExport';
import { shareReportByEmail } from '../lib/resultsExport';
import type { GameResult } from '../types';
import { BADGES } from '../data/badges';
import { useProfileStore } from '../stores/useProfileStore';
import { useFormationStore } from '../stores/useFormationStore';
import { useState } from 'react';

interface Props {
  result: GameResult;
  newBadges: string[];
  onHome: () => void;
  onRetry: () => void;
}

export default function Results({ result, newBadges, onHome, onRetry }: Props) {
  const { text: recText, color: recColor } = getRecommendation(result.score, result.total);
  const note = Math.round((result.score / result.total) * 20 * 10) / 10;
  const isExam = result.mode === 'exam';
  const [showDetails, setShowDetails] = useState(false);
  const isPerfect = result.score === result.total;
  const profile = useProfileStore(s => s.getActiveProfile());
  const formation = useFormationStore(s => s.formation)!;

  const handleExportPdf = () => {
    try {
      downloadResultsPdf({ result, profile, formation });
    } catch (err) {
      console.error('Erreur export PDF :', err);
      alert('Impossible de générer le PDF. Vérifie la console pour plus de détails.');
    }
  };

  const handleShareEmail = () => {
    try {
      shareResultsByEmail({ result, profile, formation });
    } catch (err) {
      console.error('Erreur partage mail :', err);
      alert('Impossible d\'ouvrir le client mail. Vérifie la console pour plus de détails.');
    }
  };

  const handleSendToTeacher = () => {
    if (!profile) return;
    try {
      const filename = shareReportByEmail(profile, formation);
      alert(`Le fichier « ${filename} » a été téléchargé.\n\nTon client mail va s'ouvrir : pense à joindre ce fichier avant d'envoyer.`);
    } catch (err) {
      console.error('Erreur envoi formatrice :', err);
      alert('Impossible de générer le fichier de résultats. Vérifie la console pour plus de détails.');
    }
  };

  const moduleName = getModuleName(formation, result.module);

  const earnedBadges = BADGES.filter(b => newBadges.includes(b.id));

  return (
    <div className="h-full overflow-y-auto p-6">
      <Confetti show={isPerfect} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
          {isExam ? <Trophy size={40} /> : <Zap size={40} />}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {isExam ? 'Résultats' : 'Score final'}
        </h1>
        <p className="text-white/50">{moduleName}</p>
      </motion.div>

      {/* Score */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6"
      >
        <Card className="text-center">
          <p className="text-4xl font-bold text-violet-400">
            {isExam ? `${note}/20` : result.points}
          </p>
          <p className="text-sm text-white/50 mt-1">
            {isExam ? 'Note' : 'Points'}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-4xl font-bold text-cyan-400">
            {result.score}/{result.total}
          </p>
          <p className="text-sm text-white/50 mt-1">Bonnes réponses</p>
        </Card>
      </motion.div>

      {/* Recommendation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="text-center mb-6 max-w-md mx-auto">
          <Target size={24} className={`mx-auto mb-2 ${recColor}`} />
          <p className={`text-lg font-bold ${recColor}`}>{recText}</p>
        </Card>
      </motion.div>

      {/* New badges */}
      {earnedBadges.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto mb-6"
        >
          <h3 className="text-center text-sm text-white/50 mb-3">Badges débloqués !</h3>
          <div className="flex justify-center gap-3">
            {earnedBadges.map(badge => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 text-center"
              >
                <p className="font-bold text-sm text-amber-300">{badge.name}</p>
                <p className="text-xs text-white/50 mt-1">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Details toggle */}
      {isExam && (
        <div className="max-w-md mx-auto mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-white/50 hover:text-white/70 transition-colors cursor-pointer"
          >
            Détail des réponses
            <ChevronDown size={16} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-2 mt-2"
            >
              {result.details.map((detail, i) => {
                const q = formation.questions.find(q => q.id === detail.questionId);
                if (!q) return null;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-sm ${detail.correct ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}
                  >
                    <p className="font-medium mb-1">
                      <span className={detail.correct ? 'text-emerald-400' : 'text-red-400'}>
                        {detail.correct ? '✓' : '✗'}
                      </span>
                      {' '}{q.question.substring(0, 80)}{q.question.length > 80 ? '...' : ''}
                    </p>
                    {!detail.correct && (
                      <p className="text-white/50 text-xs flex items-start gap-1">
                        <Info size={12} className="mt-0.5 flex-shrink-0" />
                        {q.explanation.substring(0, 120)}...
                      </p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* Export & share */}
      <div className="flex gap-3 justify-center max-w-md mx-auto mb-3">
        <Button variant="secondary" onClick={handleExportPdf} className="flex-1">
          <FileDown size={18} className="inline mr-2" /> Exporter PDF
        </Button>
        <Button variant="secondary" onClick={handleShareEmail} className="flex-1">
          <Mail size={18} className="inline mr-2" /> Envoyer par mail
        </Button>
      </div>

      <div className="flex justify-center max-w-md mx-auto mb-6">
        <Button onClick={handleSendToTeacher} className="flex-1">
          <Send size={18} className="inline mr-2" /> Envoyer mes résultats à ma formatrice
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center max-w-md mx-auto">
        <Button variant="secondary" onClick={onHome} className="flex-1">
          <HomeIcon size={18} className="inline mr-2" /> Accueil
        </Button>
        <Button onClick={onRetry} className="flex-1">
          Recommencer <ArrowRight size={18} className="inline ml-2" />
        </Button>
      </div>
    </div>
  );
}
