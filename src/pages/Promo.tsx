import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Upload, Trash2, Users, AlertTriangle } from 'lucide-react';
import { useTeacherStore } from '../stores/useTeacherStore';
import { getFormation } from '../data/formations';
import { parseReport, type LearnerReport } from '../lib/resultsExport';
import { getModuleStats, getStars } from '../lib/questionUtils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';

interface Props {
  onBack: () => void;
}

function examAverage(report: LearnerReport): number | null {
  const exams = report.results.filter(r => r.mode === 'exam');
  if (exams.length === 0) return null;
  const sum = exams.reduce((s, h) => s + (h.score / h.total) * 20, 0);
  return Math.round((sum / exams.length) * 10) / 10;
}

function lastActivity(report: LearnerReport): string {
  const dates = report.results.map(r => r.date).sort();
  const last = dates[dates.length - 1] ?? report.exportedAt;
  return new Date(last).toLocaleDateString('fr-FR');
}

export default function Promo({ onBack }: Props) {
  const { reports, importReport, removeReport } = useTeacherStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const counts = { ajouté: 0, remplacé: 0, ignoré: 0 };
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const report = parseReport(await file.text());
        counts[importReport(report)]++;
      } catch (err) {
        errors.push(`${file.name} : ${(err as Error).message}`);
      }
    }

    const parts: string[] = [];
    if (counts.ajouté) parts.push(`${counts.ajouté} apprenant(s) ajouté(s)`);
    if (counts.remplacé) parts.push(`${counts.remplacé} mis à jour`);
    if (counts.ignoré) parts.push(`${counts.ignoré} déjà à jour`);
    if (errors.length) parts.push(errors.join(' — '));
    setFeedback(parts.join(', ') || 'Aucun fichier exploitable.');
    if (fileInput.current) fileInput.current.value = '';
  };

  /** Les apprenants sont regroupés par formation : une promo ADVF ne se compare pas à une promo MSADS. */
  const byFormation = useMemo(() => {
    const groups = new Map<string, LearnerReport[]>();
    for (const r of reports) {
      const list = groups.get(r.formationId) ?? [];
      list.push(r);
      groups.set(r.formationId, list);
    }
    return [...groups.entries()];
  }, [reports]);

  const selectedReport = reports.find(
    r => `${r.formationId}|${r.profileName}` === selected,
  );
  const selectedFormation = selectedReport ? getFormation(selectedReport.formationId) : null;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Suivi de promo</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-5">
        {/* Import */}
        <Card>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Upload size={20} className="text-violet-400" />
              <div>
                <p className="font-semibold">Importer des résultats</p>
                <p className="text-sm text-white/50">
                  Sélectionne les fichiers reçus par mail. Plusieurs fichiers à la fois sont acceptés.
                </p>
              </div>
            </div>
            <Button onClick={() => fileInput.current?.click()}>Choisir des fichiers</Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
          {feedback && <p className="text-sm text-cyan-300 mt-3">{feedback}</p>}
        </Card>

        {reports.length === 0 && (
          <Card className="text-center py-10">
            <Users size={32} className="mx-auto text-white/25 mb-3" />
            <p className="text-white/50">Aucun résultat importé pour l'instant.</p>
            <p className="text-sm text-white/30 mt-1">
              Les apprenants envoient leur fichier depuis l'écran de résultats de leur application.
            </p>
          </Card>
        )}

        {byFormation.map(([formationId, group]) => {
          const formation = getFormation(formationId);
          if (!formation) {
            return (
              <Card key={formationId}>
                <p className="text-amber-300 text-sm">
                  <AlertTriangle size={16} className="inline mr-1" />
                  {group.length} résultat(s) reçus pour une formation inconnue de cette version ({formationId}).
                </p>
              </Card>
            );
          }

          // Moyenne de la promo par module, pour repérer les notions à retravailler.
          const promoStats = formation.modules.map(mod => {
            const notes = group.flatMap(r =>
              r.results
                .filter(h => h.mode === 'exam' && (h.module === mod.id || h.module === 'all'))
                .map(h => (h.score / h.total) * 20),
            );
            const avg = notes.length
              ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10
              : null;
            return { mod, avg };
          });

          return (
            <Card key={formationId}>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-bold text-lg">{formation.shortName}</h2>
                <span className="text-sm text-white/40">{group.length} apprenant(s)</span>
              </div>

              {/* Tableau des apprenants */}
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="text-white/40 text-left">
                      <th className="font-medium px-2 pb-2">Apprenant</th>
                      <th className="font-medium px-2 pb-2">Niveau</th>
                      <th className="font-medium px-2 pb-2">Sessions</th>
                      <th className="font-medium px-2 pb-2">Moy. examen</th>
                      <th className="font-medium px-2 pb-2">Dernière activité</th>
                      <th className="px-2 pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group
                      .slice()
                      .sort((a, b) => (examAverage(b) ?? -1) - (examAverage(a) ?? -1))
                      .map(r => {
                        const key = `${r.formationId}|${r.profileName}`;
                        const avg = examAverage(r);
                        return (
                          <tr
                            key={key}
                            onClick={() => setSelected(selected === key ? null : key)}
                            className={`cursor-pointer border-t border-white/5 hover:bg-white/5 ${selected === key ? 'bg-white/10' : ''}`}
                          >
                            <td className="px-2 py-2 font-semibold">{r.profileName}</td>
                            <td className="px-2 py-2 text-white/60">Niv. {r.level}</td>
                            <td className="px-2 py-2 text-white/60">{r.results.length}</td>
                            <td className={`px-2 py-2 font-bold ${avg === null ? 'text-white/30' : avg >= 14 ? 'text-emerald-400' : avg >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                              {avg === null ? '—' : `${avg}/20`}
                            </td>
                            <td className="px-2 py-2 text-white/50">{lastActivity(r)}</td>
                            <td className="px-2 py-2 text-right">
                              <button
                                onClick={e => { e.stopPropagation(); removeReport(r); if (selected === key) setSelected(null); }}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                                title="Retirer cet apprenant"
                              >
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Niveau de la promo par module */}
              <div className="mt-6">
                <h3 className="font-semibold text-sm mb-3 text-white/70">
                  Niveau de la promo par {formation.modulePrefix === 'CCP' ? 'CCP' : 'module'}
                </h3>
                <div className="space-y-2">
                  {promoStats.map(({ mod, avg }) => (
                    <div key={mod.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-12 text-white/50">{formation.modulePrefix}{mod.id}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60 truncate pr-2">{mod.name}</span>
                          <span className="text-white/40">{avg === null ? '—' : `${avg}/20`}</span>
                        </div>
                        <ProgressBar
                          value={avg ?? 0}
                          max={20}
                          color={avg === null ? 'bg-white/10' : avg >= 14 ? 'bg-emerald-500' : avg >= 10 ? 'bg-amber-500' : 'bg-red-500'}
                          height="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}

        {/* Détail d'un apprenant */}
        {selectedReport && selectedFormation && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <h2 className="font-bold text-lg mb-1">{selectedReport.profileName}</h2>
              <p className="text-sm text-white/40 mb-4">
                {selectedFormation.shortName} — envoi du{' '}
                {new Date(selectedReport.exportedAt).toLocaleDateString('fr-FR')} — {selectedReport.badges.length} badge(s)
              </p>

              {(() => {
                const exams = selectedReport.results.filter(h => h.mode === 'exam');
                const stats = getModuleStats(selectedFormation, exams);
                return (
                  <div className="space-y-3">
                    {selectedFormation.modules.map(mod => {
                      const s = stats[mod.id];
                      const stars = getStars(s.avgScore);
                      return (
                        <div key={mod.id} className="flex items-center gap-3">
                          <span className="text-xs font-bold w-12 text-white/50">{selectedFormation.modulePrefix}{mod.id}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-white/70 truncate pr-2">{mod.name}</span>
                              <span className="text-white/40">
                                {s.attempts > 0 ? `${s.avgScore}/20 sur ${s.attempts} essai(s)` : 'jamais travaillé'}
                              </span>
                            </div>
                            <ProgressBar
                              value={s.avgScore}
                              max={20}
                              color={s.attempts === 0 ? 'bg-white/10' : s.avgScore >= 14 ? 'bg-emerald-500' : s.avgScore >= 10 ? 'bg-amber-500' : 'bg-red-500'}
                              height="h-2"
                            />
                          </div>
                          <div className="flex gap-0.5 w-14 justify-end">
                            {[1, 2, 3].map(star => (
                              <span key={star} className={`text-sm ${star <= stars ? 'text-amber-300' : 'text-white/10'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Questions les plus souvent ratées */}
              {(() => {
                const misses = new Map<string, number>();
                for (const r of selectedReport.results) {
                  for (const d of r.details) {
                    if (!d.correct) misses.set(d.questionId, (misses.get(d.questionId) ?? 0) + 1);
                  }
                }
                const top = [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
                if (top.length === 0) return null;
                return (
                  <div className="mt-6">
                    <h3 className="font-semibold text-sm mb-2 text-white/70">Questions les plus souvent manquées</h3>
                    <ul className="space-y-2">
                      {top.map(([qid, count]) => {
                        const q = selectedFormation.questions.find(x => x.id === qid);
                        return (
                          <li key={qid} className="text-sm text-white/60 flex gap-2">
                            <span className="text-red-400 font-bold flex-shrink-0">{count}×</span>
                            <span>{q ? q.question.replace(/___/g, '…') : `Question ${qid} (absente de cette version)`}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })()}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
