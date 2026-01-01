/**
 * Certificate Generation Library for EduX
 * Generates PDF certificates for course completion
 */

// Certificate template configuration
export const CertificateTemplates = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
  PROFESSIONAL: 'professional',
};

/**
 * Generate certificate data
 */
export function generateCertificateData({
  studentName,
  courseName,
  instructorName,
  completionDate,
  certificateId,
  grade = null,
  hoursCompleted = null,
}) {
  return {
    id: certificateId || `EDUX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    studentName,
    courseName,
    instructorName,
    completionDate: completionDate || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    grade,
    hoursCompleted,
    issuedAt: new Date().toISOString(),
    verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://edux.com'}/verify/`,
  };
}

/**
 * Generate PDF certificate (client-side)
 */
export async function generateCertificatePDF(certificateData, template = CertificateTemplates.STANDARD) {
  // Dynamically import jsPDF for client-side only
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient effect (light blue)
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

  // Inner decorative border
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');

  // Header decoration
  doc.setFillColor(59, 130, 246);
  doc.rect(20, 20, pageWidth - 40, 15, 'F');

  // Logo/Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('EduX', pageWidth / 2, 30, { align: 'center' });

  // Certificate Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate of Completion', pageWidth / 2, 55, { align: 'center' });

  // Decorative line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 60, 60, pageWidth / 2 + 60, 60);

  // "This is to certify that"
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that', pageWidth / 2, 75, { align: 'center' });

  // Student Name
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(certificateData.studentName, pageWidth / 2, 90, { align: 'center' });

  // Underline for name
  const nameWidth = doc.getTextWidth(certificateData.studentName);
  doc.setDrawColor(59, 130, 246);
  doc.line(pageWidth / 2 - nameWidth / 2, 93, pageWidth / 2 + nameWidth / 2, 93);

  // "has successfully completed"
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed the course', pageWidth / 2, 105, { align: 'center' });

  // Course Name
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(certificateData.courseName, pageWidth / 2, 118, { align: 'center' });

  // Additional details
  let yPosition = 130;

  if (certificateData.hoursCompleted) {
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Duration: ${certificateData.hoursCompleted} hours`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }

  if (certificateData.grade) {
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(12);
    doc.text(`Grade Achieved: ${certificateData.grade}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }

  // Date
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed on ${certificateData.completionDate}`, pageWidth / 2, yPosition + 5, { align: 'center' });

  // Signature section
  const signatureY = pageHeight - 45;

  // Instructor signature line
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.line(50, signatureY, 120, signatureY);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(certificateData.instructorName, 85, signatureY + 5, { align: 'center' });
  doc.text('Instructor', 85, signatureY + 10, { align: 'center' });

  // Platform signature line
  doc.line(pageWidth - 120, signatureY, pageWidth - 50, signatureY);
  doc.text('EduX Platform', pageWidth - 85, signatureY + 5, { align: 'center' });
  doc.text('Authorized Signature', pageWidth - 85, signatureY + 10, { align: 'center' });

  // Certificate ID and verification
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Certificate ID: ${certificateData.id}`, pageWidth / 2, pageHeight - 18, { align: 'center' });
  doc.text(`Verify at: ${certificateData.verificationUrl}${certificateData.id}`, pageWidth / 2, pageHeight - 14, { align: 'center' });

  return doc;
}

/**
 * Download certificate as PDF
 */
export async function downloadCertificate(certificateData, filename = null) {
  const doc = await generateCertificatePDF(certificateData);
  const fileName = filename || `EduX_Certificate_${certificateData.courseName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  return fileName;
}

/**
 * Get certificate as base64 for preview
 */
export async function getCertificateBase64(certificateData) {
  const doc = await generateCertificatePDF(certificateData);
  return doc.output('datauristring');
}

/**
 * Get certificate as blob for upload/sharing
 */
export async function getCertificateBlob(certificateData) {
  const doc = await generateCertificatePDF(certificateData);
  return doc.output('blob');
}

export default {
  generateCertificateData,
  generateCertificatePDF,
  downloadCertificate,
  getCertificateBase64,
  getCertificateBlob,
  CertificateTemplates,
};
