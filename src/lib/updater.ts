import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

/** Hors application Tauri (navigateur de dev), il n'y a rien à mettre à jour. */
function inTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Retourne la mise à jour disponible, ou null. N'échoue jamais bruyamment : sans réseau, on continue. */
export async function checkForUpdate(): Promise<Update | null> {
  if (!inTauri()) return null;
  try {
    return await check();
  } catch (err) {
    console.warn('Vérification de mise à jour impossible :', err);
    return null;
  }
}

/**
 * Télécharge et installe la mise à jour, puis redémarre l'application.
 * `onProgress` reçoit un pourcentage entre 0 et 100.
 */
export async function installUpdate(update: Update, onProgress?: (percent: number) => void): Promise<void> {
  let total = 0;
  let downloaded = 0;

  await update.downloadAndInstall(event => {
    switch (event.event) {
      case 'Started':
        total = event.data.contentLength ?? 0;
        onProgress?.(0);
        break;
      case 'Progress':
        downloaded += event.data.chunkLength;
        if (total > 0) onProgress?.(Math.min(100, Math.round((downloaded / total) * 100)));
        break;
      case 'Finished':
        onProgress?.(100);
        break;
    }
  });

  await relaunch();
}
