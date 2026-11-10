/**
 * DermaScan Clinical Animal Incident Report PDF Generator
 * Creates a clean, professional, print-ready PDF document for reporters and administrators.
 */

import { jsPDF } from 'jspdf';

/**
 * Helper to safely format dates
 */
function formatDate(dateVal) {
  if (!dateVal) return 'Not recorded';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateVal);
  }
}

/**
 * Load an image from a URL or data URL and return image dimensions and base64
 */
function loadImageData(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      resolve({
        element: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        dataUrl: url
      });
    };
    img.onerror = () => {
      console.warn('[PDF] Could not load image for embedding:', url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Generate and download a PDF report for a single case
 * @param {Object} report - Complete report object
 * @returns {Promise<boolean>}
 */
export async function downloadCaseReportPDF(report) {
  if (!report) return false;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2); // 178mm

  let currentY = 16;

  // 1. Header Banner
  doc.setFillColor(15, 118, 110); // Brand Teal #0f766e
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DERMASCAN ANIMAL INCIDENT REPORT', margin + 8, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Official Field Triage & Observational Care Record', margin + 8, currentY + 18);

  // Reference Badge on Right
  const refText = `CASE REF: ${report.id || 'DS-PENDING'}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const refWidth = doc.getTextWidth(refText);
  doc.setFillColor(13, 148, 136); // Lighter teal
  doc.roundedRect(pageWidth - margin - refWidth - 10, currentY + 6, refWidth + 6, 12, 2, 2, 'F');
  doc.text(refText, pageWidth - margin - refWidth - 7, currentY + 14);

  currentY += 32;

  // 2. Incident Overview Grid
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.roundedRect(margin, currentY, contentWidth, 42, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42); // #0f172a
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Incident & Sighting Summary', margin + 6, currentY + 8);

  doc.setFontSize(9);
  const col1X = margin + 6;
  const col2X = margin + (contentWidth / 2) + 2;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Animal Species:', col1X, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(report.animal || report.animalType || 'Not specified'), col1X + 32, currentY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Status:', col2X, currentY + 17);
  const statusUpper = String(report.status || 'Received').replace('_', ' ').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(statusUpper, col2X + 22, currentY + 17);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Observed At:', col1X, currentY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(report.observedAt || report.reportedAt), col1X + 32, currentY + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Reported On:', col2X, currentY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(report.reportedAt || new Date().toISOString()), col2X + 25, currentY + 25);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Location / Area:', col1X, currentY + 33);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const locString = [report.location || report.locationName, report.landmark ? `(Near: ${report.landmark})` : ''].filter(Boolean).join(' ') || 'Location details in notes';
  const locLines = doc.splitTextToSize(locString, contentWidth - 42);
  doc.text(locLines[0] || 'Not specified', col1X + 32, currentY + 33);

  currentY += 48;

  // 3. Clinical Field Observations
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Field Observations & Symptoms Described', margin + 6, currentY + 8);

  const notes = report.observations || report.notes || 'No description provided by reporter.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const wrappedNotes = doc.splitTextToSize(notes, contentWidth - 12);
  doc.text(wrappedNotes.slice(0, 4), margin + 6, currentY + 16);

  currentY += 40;

  // 4. AI Screening Findings (if available)
  if (report.aiDiagnosis) {
    const diag = report.aiDiagnosis;
    doc.setFillColor(240, 253, 250); // Mint background #f0fdfa
    doc.setDrawColor(153, 246, 228); // #99f6e4
    doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

    doc.setTextColor(15, 118, 110);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. DermaScan AI Pre-Screening Findings', margin + 6, currentY + 7);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const condText = `Condition: ${diag.prediction || diag.conditionKey || 'Clinical Evaluation'} (${diag.confidence || 95}% confidence, ${diag.severity || 'Mild'})`;
    doc.setFont('helvetica', 'bold');
    doc.text(condText, margin + 6, currentY + 14);

    if (diag.recommendedProtocol) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const protoLines = doc.splitTextToSize(`Protocol: ${diag.recommendedProtocol}`, contentWidth - 12);
      doc.text(protoLines.slice(0, 2), margin + 6, currentY + 20);
    }

    currentY += 34;
  }

  // 5. Attached Photo Evidence
  if (report.photoUrl) {
    try {
      const imgInfo = await loadImageData(report.photoUrl);
      if (imgInfo) {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);

        // Calculate photo bounding box
        const maxImgWidth = contentWidth;
        const maxImgHeight = 85; // Leave room for footer
        const aspect = imgInfo.width / imgInfo.height;

        let renderW = maxImgWidth;
        let renderH = renderW / aspect;

        if (renderH > maxImgHeight) {
          renderH = maxImgHeight;
          renderW = renderH * aspect;
        }

        const renderX = margin + ((contentWidth - renderW) / 2);

        doc.roundedRect(margin, currentY, contentWidth, renderH + 14, 2, 2, 'FD');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Photographic Evidence Attached', margin + 6, currentY + 7);

        const format = report.photoUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(imgInfo.dataUrl, format, renderX, currentY + 10, renderW, renderH);

        currentY += renderH + 20;
      }
    } catch (imgErr) {
      console.warn('[PDF] Error rendering image into PDF:', imgErr);
    }
  }

  // 6. Google Maps Link (if coordinates or location exists)
  const mapQuery = report.coordinates
    ? `${report.coordinates.lat},${report.coordinates.lng}`
    : report.location || report.locationName;

  if (mapQuery) {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    doc.setTextColor(2, 132, 199);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.textWithLink('→ Open Reported Location on Google Maps', margin + 6, Math.min(currentY, pageHeight - 25), { url: mapUrl });
  }

  // 7. Footer & Medical Disclaimer
  const footerY = pageHeight - 18;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Medical Disclaimer: Photo review and observational reports are not a substitute for an in-person veterinary diagnosis.',
    margin,
    footerY
  );
  doc.text(
    'DermaScan Animal Health Platform • Generated on ' + new Date().toUTCString(),
    margin,
    footerY + 4
  );

  // Trigger browser download
  const safeId = (report.id || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `DermaScan-Report-${safeId}.pdf`;
  doc.save(filename);
  return true;
}
