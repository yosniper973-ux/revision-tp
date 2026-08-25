import { useState } from 'react';
import { ChevronLeft, Volume2, VolumeX, Type, RotateCcw, GraduationCap } from 'lucide-react';
import { useProfileStore } from '../stores/useProfileStore';
import { useFormationStore } from '../stores/useFormationStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

interface Props {
  onBack: () => void;
  onChangeFormation: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  fontSize: number;
  onFontSize: (size: number) => void;
}

export default function Settings({ onBack, onChangeFormation, soundEnabled, onToggleSound, fontSize, onFontSize }: Props) {
  const profile = useProfileStore(s => s.getActiveProfile());
  const formation = useFormationStore(s => s.formation);
  const resetProfile = useProfileStore(s => s.resetProfile);
  const [showReset, setShowReset] = useState(false);

  const handleReset = () => {
    if (profile) {
      resetProfile(profile.id);
    }
    setShowReset(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Sound */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 size={20} className="text-violet-400" /> : <VolumeX size={20} className="text-white/40" />}
              <div>
                <p className="font-semibold">Sons</p>
                <p className="text-sm text-white/50">Effets sonores de feedback</p>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${soundEnabled ? 'bg-violet-500' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${soundEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </Card>

        {/* Font size */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Type size={20} className="text-violet-400" />
            <div>
              <p className="font-semibold">Taille du texte</p>
              <p className="text-sm text-white/50">Ajuster la lisibilité</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onFontSize(Math.max(14, fontSize - 2))}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
            >
              A-
            </button>
            <div className="flex-1 text-center">
              <span className="text-lg font-bold">{fontSize}px</span>
            </div>
            <button
              onClick={() => onFontSize(Math.min(24, fontSize + 2))}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
            >
              A+
            </button>
          </div>
        </Card>

        {/* Formation */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap size={20} className="text-violet-400" />
              <div>
                <p className="font-semibold">Formation</p>
                <p className="text-sm text-white/50">{formation?.shortName ?? '—'}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={onChangeFormation}>
              Changer
            </Button>
          </div>
        </Card>

        {/* Reset */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw size={20} className="text-red-400" />
              <div>
                <p className="font-semibold">Réinitialiser le profil</p>
                <p className="text-sm text-white/50">Supprimer scores et badges</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowReset(true)}>
              Réinitialiser
            </Button>
          </div>
        </Card>

        {/* Info */}
        <Card className="text-center text-white/40 text-sm">
          <p className="font-bold text-white/60 mb-1">{formation?.appTitle ?? 'Révision TP'} v1.1</p>
          <p>Application de révision pour le Titre Professionnel</p>
          <p>{formation?.fullName}</p>
          {formation && [formation.rncp, formation.level].filter(Boolean).length > 0 && (
            <p className="mt-2">{[formation.rncp, formation.level].filter(Boolean).join(' - ')}</p>
          )}
          {formation && (
            <p>
              {formation.questions.length} questions - {formation.modules.length}{' '}
              {formation.modulePrefix === 'CCP' ? 'CCP' : 'modules thématiques'}
            </p>
          )}
        </Card>
      </div>

      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Réinitialiser le profil">
        <p className="text-white/70 mb-6">
          Cette action supprimera tous tes scores, badges et ton historique. Ton profil sera conservé. Es-tu sûr ?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowReset(false)} className="flex-1">
            Annuler
          </Button>
          <Button variant="danger" onClick={handleReset} className="flex-1">
            Confirmer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
