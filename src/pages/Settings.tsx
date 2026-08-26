import { useState } from 'react';
import { ChevronLeft, Volume2, VolumeX, Type, RotateCcw, GraduationCap, Users } from 'lucide-react';
import { useProfileStore } from '../stores/useProfileStore';
import { useFormationStore } from '../stores/useFormationStore';
import { useTeacherStore } from '../stores/useTeacherStore';
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
  const teacherMode = useTeacherStore(s => s.teacherMode);
  const unlockTeacherMode = useTeacherStore(s => s.unlockTeacherMode);
  const disableTeacherMode = useTeacherStore(s => s.disableTeacherMode);
  const [unlockFor, setUnlockFor] = useState<'teacher' | null>(null);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const resetProfile = useProfileStore(s => s.resetProfile);
  const [showReset, setShowReset] = useState(false);

  const askPassword = (purpose: 'teacher') => {
    setPassword('');
    setUnlockError(false);
    setUnlockFor(purpose);
  };

  const handleToggleTeacher = () => {
    if (teacherMode) {
      disableTeacherMode();
      return;
    }
    askPassword('teacher');
  };

  const handleUnlock = () => {
    if (unlockTeacherMode(password)) {
      setUnlockFor(null);
      setPassword('');
    } else {
      setUnlockError(true);
    }
  };

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

        {/* Mode formateur */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={20} className={teacherMode ? 'text-violet-400' : 'text-white/40'} />
              <div>
                <p className="font-semibold">Mode formateur</p>
                <p className="text-sm text-white/50">
                  {teacherMode ? 'Activé sur ce poste' : 'Réservé à la formatrice, protégé par mot de passe'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleTeacher}
              className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${teacherMode ? 'bg-violet-500' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${teacherMode ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
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

      <Modal
        isOpen={unlockFor !== null}
        onClose={() => setUnlockFor(null)}
        title="Mode formateur"
      >
        <p className="text-white/70 mb-4">
          Saisis le mot de passe pour activer le suivi des apprenants sur ce poste.
        </p>
        <input
          type="password"
          value={password}
          autoFocus
          onChange={e => { setPassword(e.target.value); setUnlockError(false); }}
          onKeyDown={e => { if (e.key === 'Enter') handleUnlock(); }}
          placeholder="Mot de passe"
          className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl outline-none focus:border-violet-400 transition-colors mb-2"
        />
        {unlockError && <p className="text-sm text-red-400 mb-2">Mot de passe incorrect.</p>}
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={() => setUnlockFor(null)} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleUnlock} disabled={!password.trim()} className="flex-1">
            Activer
          </Button>
        </div>
      </Modal>

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
