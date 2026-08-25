import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import type { Update } from '@tauri-apps/plugin-updater';
import { checkForUpdate, installUpdate } from '../lib/updater';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

/**
 * Propose la mise à jour quand une nouvelle version est publiée.
 * Discret : l'apprenant peut l'ignorer et continuer à réviser.
 */
export default function UpdateBanner() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    checkForUpdate().then(setUpdate);
  }, []);

  if (!update || dismissed) return null;

  const start = async () => {
    setFailed(false);
    setProgress(0);
    try {
      await installUpdate(update, setProgress);
    } catch (err) {
      console.error('Mise à jour impossible :', err);
      setProgress(null);
      setFailed(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,420px)]"
      >
        <div className="bg-indigo-950/95 border border-violet-400/30 rounded-2xl p-4 shadow-lg shadow-black/40 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Download size={20} className="text-violet-300 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Mise à jour disponible</p>
              <p className="text-sm text-white/50">Version {update.version}</p>
            </div>
            {progress === null && (
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Plus tard"
              >
                <X size={16} className="text-white/50" />
              </button>
            )}
          </div>

          {progress !== null ? (
            <div className="mt-3">
              <ProgressBar value={progress} max={100} color="bg-violet-500" height="h-2" />
              <p className="text-xs text-white/40 mt-1">
                {progress < 100 ? `Téléchargement ${progress} %` : 'Installation, l\'application va redémarrer…'}
              </p>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={() => setDismissed(true)} className="flex-1">
                Plus tard
              </Button>
              <Button size="sm" onClick={start} className="flex-1">
                Installer
              </Button>
            </div>
          )}

          {failed && (
            <p className="text-xs text-red-400 mt-2">
              La mise à jour a échoué. Réessaie plus tard ou préviens ta formatrice.
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
