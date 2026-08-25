import type { Formation, GameResult, Profile } from '../types';

/** Identifiant du format, vérifié à l'import pour rejeter un fichier étranger. */
export const REPORT_FORMAT = 'revision-tp-resultats';
export const REPORT_VERSION = 1;

/** Ce qu'un apprenant transmet à sa formatrice. */
export interface LearnerReport {
  format: typeof REPORT_FORMAT;
  version: number;
  exportedAt: string;
  formationId: string;
  formationShortName: string;
  profileName: string;
  level: number;
  xp: number;
  badges: string[];
  results: GameResult[];
}

export function buildReport(profile: Profile, formation: Formation): LearnerReport {
  return {
    format: REPORT_FORMAT,
    version: REPORT_VERSION,
    exportedAt: new Date().toISOString(),
    formationId: formation.id,
    formationShortName: formation.shortName,
    profileName: profile.name,
    level: profile.level,
    xp: profile.xp,
    badges: profile.badges,
    results: profile.history,
  };
}

export function reportFilename(report: LearnerReport): string {
  const safeName = report.profileName.replace(/[^a-zA-Z0-9-_]/g, '_') || 'apprenant';
  const dateSlug = report.exportedAt.slice(0, 10);
  return `Resultats_${report.formationShortName}_${safeName}_${dateSlug}.json`;
}

/** Clé de déduplication : un même envoi importé deux fois ne compte qu'une fois. */
export function reportKey(report: LearnerReport): string {
  return `${report.formationId}|${report.profileName.trim().toLowerCase()}|${report.exportedAt}`;
}

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Génère le fichier de résultats et le télécharge. Retourne le nom du fichier produit. */
export function downloadReport(profile: Profile, formation: Formation): string {
  const report = buildReport(profile, formation);
  const filename = reportFilename(report);
  download(JSON.stringify(report, null, 2), filename);
  return filename;
}

/**
 * Télécharge le fichier puis ouvre le client mail prérempli.
 * mailto ne permet pas de joindre un fichier : on demande à l'apprenant de l'attacher.
 */
export function shareReportByEmail(profile: Profile, formation: Formation): string {
  const filename = downloadReport(profile, formation);
  const exams = profile.history.filter(h => h.mode === 'exam');
  const avg = exams.length
    ? Math.round((exams.reduce((s, h) => s + (h.score / h.total) * 20, 0) / exams.length) * 10) / 10
    : 0;

  const subject = `Résultats ${formation.shortName} — ${profile.name}`;
  const lines = [
    'Bonjour,',
    '',
    `Voici mes résultats de révision pour le titre ${formation.fullName}.`,
    '',
    `• Apprenant : ${profile.name}`,
    `• Formation : ${formation.shortName}`,
    `• Sessions enregistrées : ${profile.history.length} (dont ${exams.length} en mode examen)`,
    exams.length ? `• Moyenne en examen : ${avg}/20` : '• Aucun examen passé pour l\'instant',
    '',
    `Le fichier "${filename}" vient d'être téléchargé sur mon ordinateur.`,
    'Merci de l\'attacher à ce mail avant de l\'envoyer.',
    '',
    'Cordialement,',
    profile.name,
  ];

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;
  setTimeout(() => { window.location.href = mailtoUrl; }, 300);
  return filename;
}

/** Analyse un fichier importé. Lève une erreur explicite si le contenu n'est pas exploitable. */
export function parseReport(raw: string): LearnerReport {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Ce fichier n\'est pas un fichier de résultats lisible.');
  }
  const r = data as Partial<LearnerReport>;
  if (r?.format !== REPORT_FORMAT) {
    throw new Error('Ce fichier ne provient pas de l\'application de révision.');
  }
  if (typeof r.version !== 'number' || r.version > REPORT_VERSION) {
    throw new Error('Ce fichier a été produit par une version plus récente de l\'application.');
  }
  if (!r.profileName || !r.formationId || !Array.isArray(r.results)) {
    throw new Error('Ce fichier de résultats est incomplet.');
  }
  return r as LearnerReport;
}
