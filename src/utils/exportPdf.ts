import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LKE, Pokja, Indicator } from '../types';

export function exportLkeToPdf(lke: LKE) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper: Print Centered Text
  const centerText = (text: string, y: number, size = 10, isBold = false) => {
    doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // --- HEADER DEPARTEMEN / UNIT KERJA (SIMPLE & TANPA BACKGROUND GELAP) ---
  doc.setTextColor(15, 23, 42);
  centerText('LAPORAN HASIL EVALUASI', 12, 14, true);
  centerText('LEMBAR KERJA EVALUASI (LKE) ZONA INTEGRITAS', 18, 12, true);
  centerText('MENUJU WILAYAH BEBAS DARI KORUPSI (WBK) / WBBM', 24, 11, true);

  doc.setDrawColor(148, 163, 184); // Abu-abu terang (Slate-400)
  doc.setLineWidth(0.5);
  doc.line(15, 28, pageWidth - 15, 28);

  centerText(`UNIT KERJA: ${lke.unit_name.toUpperCase()}`, 34, 10, true);
  centerText(`PERIODE PENILAIAN: ${lke.period} | STATUS: ${lke.status.toUpperCase()}`, 39, 9, false);

  // Reset text color to dark slate
  doc.setTextColor(15, 23, 42);

  // --- METADATA BOX ---
  let yPos = 50;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Dicetak Pada: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 15, yPos);
  doc.text(`ID Evaluasi: ${lke.id}`, 15, yPos + 5);

  yPos += 15;

  // --- SCORE CALCULATIONS ---
  let totalUnitScore = 0;
  let totalTPIScore = 0;
  let totalWeight = 0;
  let totalIndicators = 0;
  let filledIndicators = 0;

  interface PokjaReportItem {
    code: string;
    name: string;
    weight: number;
    unitScore: number;
    tpiScore: number;
    filled: number;
    total: number;
  }

  const pokjaItems: PokjaReportItem[] = [];

  lke.pokjas.forEach((pokja: Pokja) => {
    let pUnitScore = 0;
    let pTPIScore = 0;
    let pFilled = 0;
    const pTotal = pokja.indicators.length;
    const pIndicatorWeightSum = pokja.indicators.reduce((sum, ind) => sum + ind.weight, 0);

    pokja.indicators.forEach((ind: Indicator) => {
      totalIndicators++;
      if (ind.selected_option_id) {
        const opt = ind.options.find(o => o.id === ind.selected_option_id);
        if (opt) {
          pUnitScore += ind.weight * (opt.score_percentage / 100);
          pFilled++;
          filledIndicators++;
        }
      }

      const tpiOptionId = (ind.status === 'reviewed_accepted' || ind.status === 'reviewed_revision_required')
        ? (ind.reviewed_option_id || ind.selected_option_id)
        : ind.selected_option_id;

      if (tpiOptionId) {
        const opt = ind.options.find(o => o.id === tpiOptionId);
        if (opt) {
          pTPIScore += ind.weight * (opt.score_percentage / 100);
        }
      }
    });

    const scaledUnitScore = pIndicatorWeightSum > 0 ? (pUnitScore / pIndicatorWeightSum) * pokja.weight : 0;
    const scaledTPIScore = pIndicatorWeightSum > 0 ? (pTPIScore / pIndicatorWeightSum) * pokja.weight : 0;

    totalUnitScore += scaledUnitScore;
    totalTPIScore += scaledTPIScore;
    totalWeight += pokja.weight;

    pokjaItems.push({
      code: pokja.code,
      name: pokja.name,
      weight: pokja.weight,
      unitScore: scaledUnitScore,
      tpiScore: scaledTPIScore,
      filled: pFilled,
      total: pTotal
    });
  });

  const unitPercentage = totalWeight > 0 ? (totalUnitScore / totalWeight) * 100 : 0;
  const tpiPercentage = totalWeight > 0 ? (totalTPIScore / totalWeight) * 100 : 0;

  // --- SECTION: SUMMARY TABLE ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I. RINGKASAN CAPAIAN NILAI PENILAIAN MANDIRI & EVALUASI TPI', 15, yPos);
  yPos += 5;

  const summaryRows = pokjaItems.map((p) => [
    `Pokja ${p.code}`,
    p.name,
    p.weight.toFixed(2),
    `${p.filled}/${p.total}`,
    p.unitScore.toFixed(2),
    p.tpiScore.toFixed(2),
    `${((p.unitScore / p.weight) * 100 || 0).toFixed(1)}%`,
    `${((p.tpiScore / p.weight) * 100 || 0).toFixed(1)}%`
  ]);

  // Add Totals row to summary
  summaryRows.push([
    'TOTAL LKE',
    'Hasil Kumulatif Seluruh Area Pengungkit',
    totalWeight.toFixed(2),
    `${filledIndicators}/${totalIndicators}`,
    totalUnitScore.toFixed(2),
    totalTPIScore.toFixed(2),
    `${unitPercentage.toFixed(1)}%`,
    `${tpiPercentage.toFixed(1)}%`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Kode', 'Nama Area Pengungkit', 'Bobot', 'Progress', 'Nilai Mandiri', 'Nilai TPI', '% Mandiri', '% TPI']],
    body: summaryRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { halign: 'right', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 20 },
      5: { halign: 'right', fontStyle: 'bold', textColor: [29, 78, 216], cellWidth: 20 },
      6: { halign: 'right', cellWidth: 18 },
      7: { halign: 'right', textColor: [29, 78, 216], cellWidth: 18 }
    },
    styles: { fontSize: 8, cellPadding: 2.5 },
    didParseCell: (data) => {
      // Bold the final summary row
      if (data.row.index === summaryRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
        if (data.column.index === 4) data.cell.styles.textColor = [16, 185, 129];
        if (data.column.index === 5) data.cell.styles.textColor = [29, 78, 216];
      }
    }
  });

  // Check where the summary table ended to position the next section
  yPos = (doc as any).lastAutoTable.finalY + 15;

  // --- FOOTNOTE CAPAIAN ---
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, yPos, pageWidth - 30, 20, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.text('CATATAN CAPAIAN UTAMA:', 18, yPos + 6);
  doc.setFont('Helvetica', 'normal');
  doc.text(`- Unit Kerja memperoleh Nilai Mandiri sebesar ${totalUnitScore.toFixed(2)} Poin (${unitPercentage.toFixed(1)}%)`, 18, yPos + 11);
  doc.text(`- Evaluasi TPI memberikan Nilai Akhir sebesar ${totalTPIScore.toFixed(2)} Poin (${tpiPercentage.toFixed(1)}%)`, 18, yPos + 16);

  yPos += 30;

  // --- SECTION: DETAILS BY POKJA ---
  doc.addPage();
  yPos = 15;

  centerText('II. DETIL JAWABAN INDIKATOR DAN CATATAN REVIU TPI', yPos, 12, true);
  yPos += 10;

  lke.pokjas.forEach((pokja: Pokja) => {
    // Add Pokja Title Banner
    doc.setFillColor(241, 245, 249);
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`POKJA ${pokja.code}: ${pokja.name.toUpperCase()} (BOBOT: ${pokja.weight} POIN)`, 18, yPos + 5.5);
    yPos += 13;

    pokja.indicators.forEach((ind: Indicator) => {
      // Check if we need to wrap to next page to prevent ugly cuts
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 15;
      }

      // Indicator Box Border
      const boxStartY = yPos;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      
      // Question text wrap
      const qText = `${ind.code}. ${ind.question}`;
      const splitQuestion = doc.splitTextToSize(qText, pageWidth - 40);
      doc.text(splitQuestion, 18, yPos);
      yPos += (splitQuestion.length * 4) + 2;

      // Answer Mandiri Unit
      doc.setFont('Helvetica', 'bold');
      doc.text('Jawaban Unit Kerja:', 20, yPos);
      doc.setFont('Helvetica', 'normal');
      
      let answerText = 'Belum diisi';
      let selectedScore = '0%';
      if (ind.selected_option_id) {
        const opt = ind.options.find(o => o.id === ind.selected_option_id);
        if (opt) {
          answerText = opt.label;
          selectedScore = `${opt.score_percentage}%`;
        }
      }
      doc.text(`- Pilihan: ${answerText} (Nilai: ${selectedScore}, Bobot Indikator: ${ind.weight})`, 22, yPos + 4);
      
      const noteText = ind.answer_notes ? ind.answer_notes : 'Tidak ada penjelasan tertulis.';
      const splitNotes = doc.splitTextToSize(`- Catatan Penjelasan: ${noteText}`, pageWidth - 45);
      doc.text(splitNotes, 22, yPos + 8);
      yPos += 8 + (splitNotes.length * 3.5) + 3;

      // Reviu TPI Block
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(29, 78, 216); // Blue color for TPI
      doc.text('Evaluasi & Reviu TPI:', 20, yPos);
      doc.setFont('Helvetica', 'normal');

      let reviewOptionText = 'Mengikuti jawaban Unit Kerja';
      let reviewScorePercent = selectedScore;
      const actualReviewId = ind.reviewed_option_id || ind.selected_option_id;
      if (actualReviewId) {
        const opt = ind.options.find(o => o.id === actualReviewId);
        if (opt) {
          reviewOptionText = opt.label;
          reviewScorePercent = `${opt.score_percentage}%`;
        }
      }

      let decisionStatus = 'Belum Direviu / Sesuai';
      if (ind.status === 'reviewed_accepted') {
        decisionStatus = 'SETUJU (Sesuai) ✓';
      } else if (ind.status === 'reviewed_revision_required') {
        decisionStatus = 'PERLU PERBAIKAN / REVISI ⚠️';
      }

      doc.text(`- Keputusan TPI: ${decisionStatus}`, 22, yPos + 4);
      doc.text(`- Jawaban Evaluasi: ${reviewOptionText} (Nilai: ${reviewScorePercent})`, 22, yPos + 8);
      
      const rNotes = ind.review_notes ? ind.review_notes : 'Tidak ada catatan koreksi khusus.';
      const splitRNotes = doc.splitTextToSize(`- Catatan Koreksi TPI: ${rNotes}`, pageWidth - 45);
      doc.text(splitRNotes, 22, yPos + 12);

      yPos += 12 + (splitRNotes.length * 3.5) + 5;

      // Draw subtle separator line between indicators
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(15, yPos, pageWidth - 15, yPos);
      yPos += 8;

      // Reset text colors
      doc.setTextColor(15, 23, 42);
    });

    yPos += 5; // Spacing between Pokjas
  });

  // --- SIGNATURES ---
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 10;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 10;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TIM PENILAI INTERNAL (TPI)', 25, yPos);
  doc.text('KETUA TIM / PIMPINAN UNIT KERJA', pageWidth - 80, yPos);

  yPos += 20;
  doc.setFont('Helvetica', 'normal');
  doc.text('( ___________________________ )', 25, yPos);
  doc.text('( ___________________________ )', pageWidth - 80, yPos);

  doc.setFontSize(8);
  doc.text('Validator TPI Penilai Mandiri', 25, yPos + 4);
  doc.text('Penanggung Jawab Unit Kerja', pageWidth - 80, yPos + 4);

  // Save the PDF
  const fileName = `Laporan_LKE_${lke.unit_name.replace(/\s+/g, '_')}_${lke.period}.pdf`;
  doc.save(fileName);
}
