import { jsPDF } from 'jspdf';
import type { Formation, GameResult, Profile } from '../types';
import { getModuleName } from './questionUtils';
import { getRecommendation } from './scoring';

interface ExportOptions {
  result: GameResult;
  profile: Profile | null;
  formation: Formation;
}

/**
 * Génère un PDF stylé des résultats d'une session.
 * Retourne le blob du PDF et le nom de fichier.
 */
export function buildResultsPdf({ result, profile, formation }: ExportOptions): {
  blob: Blob;
  filename: string;
  dataUri: string;
} {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Couleurs (RGB)
  const accent: [number, number, number] = formation.pdfAccent;
  const cyan: [number, number, number] = [34, 211, 238];
  const grayDark: [number, number, number] = [55, 65, 81];
  const grayLight: [number, number, number] = [156, 163, 175];
  const green: [number, number, number] = [16, 185, 129];
  const red: [number, number, number] = [239, 68, 68];

  const isExam = result.mode === 'exam';
  const note = Math.round((result.score / result.total) * 20 * 10) / 10;
  const moduleName = getModuleName(formation, result.module);
  const dateStr = new Date(result.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const { text: recText } = getRecommendation(result.score, result.total);

  // ===== En-tête =====
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(formation.appTitle, margin, 13);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Titre Pro ${formation.fullName}`, margin, 20);
  doc.setFontSize(9);
  doc.text([formation.rncp, formation.level].filter(Boolean).join(' — '), margin, 25);
  y = 38;

  // ===== Bloc info session =====
  doc.setTextColor(...grayDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(isExam ? 'Résultats — Mode Examen' : 'Résultats — Mode Quiz', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...grayLight);
  if (profile) {
    doc.text(`Apprenant : ${profile.name}`, margin, y);
    y += 5;
  }
  doc.text(`${formation.modulePrefix === 'CCP' ? 'CCP' : 'Module'} : ${moduleName}`, margin, y);
  y += 5;
  doc.text(`Date : ${dateStr}`, margin, y);
  y += 10;

  // ===== Bloc score =====
  const boxWidth = (contentWidth - 5) / 2;
  const boxHeight = 28;

  // Box 1 — Note ou Points
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(...accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const mainScore = isExam ? `${note}/20` : `${result.points ?? 0}`;
  doc.text(mainScore, margin + boxWidth / 2, y + 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayLight);
  doc.text(isExam ? 'Note finale' : 'Points', margin + boxWidth / 2, y + 22, {
    align: 'center',
  });

  // Box 2 — Bonnes réponses
  doc.setFillColor(236, 254, 255);
  doc.roundedRect(margin + boxWidth + 5, y, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(...cyan);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(
    `${result.score}/${result.total}`,
    margin + boxWidth + 5 + boxWidth / 2,
    y + 14,
    { align: 'center' },
  );
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayLight);
  doc.text(
    'Bonnes réponses',
    margin + boxWidth + 5 + boxWidth / 2,
    y + 22,
    { align: 'center' },
  );
  y += boxHeight + 6;

  // ===== Recommandation =====
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  doc.setTextColor(...grayDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Recommandation : ${recText}`, pageWidth / 2, y + 8, { align: 'center' });
  y += 18;

  // ===== Détail des réponses =====
  doc.setTextColor(...grayDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Détail des réponses', margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  result.details.forEach((detail, i) => {
    const q = formation.questions.find((qq) => qq.id === detail.questionId);
    if (!q) return;

    // Estimation hauteur nécessaire
    const questionLines = doc.splitTextToSize(
      `${i + 1}. ${q.question}`,
      contentWidth - 8,
    );
    const explanationLines = !detail.correct
      ? doc.splitTextToSize(`Explication : ${q.explanation}`, contentWidth - 8)
      : [];
    const blockHeight = 6 + questionLines.length * 4 + explanationLines.length * 4 + 4;

    // Saut de page si nécessaire
    if (y + blockHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    // Bordure colorée à gauche
    doc.setFillColor(...(detail.correct ? green : red));
    doc.rect(margin, y, 1.5, blockHeight - 2, 'F');

    // Statut
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(detail.correct ? green : red));
    doc.text(detail.correct ? 'CORRECT' : 'INCORRECT', margin + 4, y + 4);

    // Question
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayDark);
    doc.text(questionLines, margin + 4, y + 9);

    // Explication si faux
    if (explanationLines.length > 0) {
      doc.setTextColor(...grayLight);
      doc.setFont('helvetica', 'italic');
      doc.text(explanationLines, margin + 4, y + 9 + questionLines.length * 4 + 1);
    }

    y += blockHeight;
  });

  // ===== Pied de page sur toutes les pages =====
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayLight);
    doc.text(
      `${formation.appTitle} — Document généré le ${new Date().toLocaleDateString('fr-FR')}`,
      margin,
      pageHeight - 8,
    );
    doc.text(`Page ${p} / ${pageCount}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
  }

  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');
  const safeName = (profile?.name ?? 'apprenant').replace(/[^a-zA-Z0-9-_]/g, '_');
  const dateSlug = new Date(result.date).toISOString().slice(0, 10);
  const filename = `${formation.shortName}_Resultats_${safeName}_${dateSlug}.pdf`;

  return { blob, filename, dataUri };
}

/**
 * Déclenche le téléchargement du PDF dans le navigateur / WebView Tauri.
 */
export function downloadResultsPdf(opts: ExportOptions): string {
  const { blob, filename } = buildResultsPdf(opts);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

/**
 * Génère le PDF, le télécharge et ouvre le client mail par défaut
 * avec sujet et corps préremplis. (mailto ne supporte pas les pièces jointes,
 * donc on demande à l'utilisateur d'attacher le PDF qui vient d'être téléchargé.)
 */
export function shareResultsByEmail(opts: ExportOptions): void {
  const filename = downloadResultsPdf(opts);
  const { result, profile, formation } = opts;
  const isExam = result.mode === 'exam';
  const note = Math.round((result.score / result.total) * 20 * 10) / 10;
  const moduleName = getModuleName(formation, result.module);

  const subject = `${formation.appTitle} — Résultats ${isExam ? 'Examen' : 'Quiz'} — ${profile?.name ?? ''}`;

  const lines = [
    'Bonjour,',
    '',
    `Voici mes résultats de la session de révision ${formation.shortName} du ${new Date(result.date).toLocaleDateString('fr-FR')} :`,
    '',
    `• Apprenant : ${profile?.name ?? '—'}`,
    `• Mode : ${isExam ? 'Examen' : 'Quiz chronométré'}`,
    `• ${formation.modulePrefix === 'CCP' ? 'CCP' : 'Module'} : ${moduleName}`,
    isExam
      ? `• Note : ${note}/20 (${result.score}/${result.total} bonnes réponses)`
      : `• Score : ${result.points ?? 0} points (${result.score}/${result.total} bonnes réponses)`,
    '',
    `Le détail complet est dans le fichier "${filename}" qui vient d'être téléchargé.`,
    'Merci de l\'attacher à ce mail avant l\'envoi.',
    '',
    'Cordialement,',
    profile?.name ?? '',
  ];
  const body = lines.join('\r\n');

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // Petit délai pour laisser le téléchargement démarrer avant d'ouvrir le client mail
  setTimeout(() => {
    window.location.href = mailtoUrl;
  }, 300);
}
