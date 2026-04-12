// PDF Certificate Generator - BVI Police Certificate of Character
// Generates a professional PDF certificate matching the official BVI government style

interface CertificateData {
  certificateNumber: string;
  dateIssued: string;
  dateExpires: string;
  applicantName: string;
  surname: string;
  givenNames: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  passportNumber: string;
  occupation: string;
  address: string;
  purpose: string;
  hasConvictions: boolean;
  convictions?: string;
  issuedBy?: string;
}

function escapePdf(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[^\x00-\x7F]/g, '');
}

function drawLine(x1: number, y1: number, x2: number, y2: number, width: number = 0.5): string {
  return `${width} w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function drawRect(x: number, y: number, w: number, h: number): string {
  return `${x} ${y} ${w} ${h} re S`;
}

function drawFilledRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number): string {
  return `${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f`;
}

function drawShield(cx: number, cy: number, size: number): string {
  const s = size;
  const cmds: string[] = [];
  // Shield outline
  cmds.push(`${0} ${s * 0.8} ${s} rg`); // fill green
  cmds.push(`${cx - s / 2} ${cy - s / 2} m`);
  cmds.push(`${cx + s / 2} ${cy - s / 2} l`);
  cmds.push(`${cx + s / 2} ${cy + s / 6} l`);
  cmds.push(`Q ${cx + s / 2} ${cy + s / 2} ${cx} ${cy + s / 2}`);
  cmds.push(`Q ${cx - s / 2} ${cy + s / 2} ${cx - s / 2} ${cy + s / 6}`);
  cmds.push(`${cx - s / 2} ${cy - s / 2} l`);
  cmds.push(`f`);
  // Gold border
  cmds.push(`0.8 0.65 0.1 RG 2 w`);
  cmds.push(`${cx - s / 2} ${cy - s / 2} m`);
  cmds.push(`${cx + s / 2} ${cy - s / 2} l`);
  cmds.push(`${cx + s / 2} ${cy + s / 6} l`);
  cmds.push(`Q ${cx + s / 2} ${cy + s / 2} ${cx} ${cy + s / 2}`);
  cmds.push(`Q ${cx - s / 2} ${cy + s / 2} ${cx - s / 2} ${cy + s / 6}`);
  cmds.push(`${cx - s / 2} ${cy - s / 2} l`);
  cmds.push(`S`);
  // VIGILATE text
  cmds.push(`BT /Helvetica 6 Tf 0.82 0.65 0.1 rg ${cx} ${cy + s * 0.12} Td (VIGILATE) Tj ET`);
  return cmds.join('\n');
}

export function generatePoliceCertificatePDF(data: CertificateData): Buffer {
  const W = 595; // A4 width
  const H = 842; // A4 height
  const LM = 50; // left margin
  const RM = 50; // right margin
  const CW = W - LM - RM; // content width

  // Build fonts
  const objects: string[] = [];
  let objNum = 1;

  const newObj = (content: string) => {
    objects.push(`${objNum} 0 obj\n${content}\nendobj`);
    return objNum++;
  };

  // Object 1: Catalog
  const catalogId = newObj(`<< /Type /Catalog /Pages 2 0 R >>`);
  // Object 2: Pages
  const pagesId = newObj(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);

  // Build page content stream
  let content = '';

  // === HEADER SECTION ===
  // Gold top border bar
  content += drawFilledRect(30, H - 30, W - 60, 4, 0.84, 0.69, 0);

  // Government header text
  content += `BT\n`;
  content += `/Helvetica-Bold 9 Tf 0.047 0.106 0.165 rg\n`;
  content += `${W / 2} ${H - 65} Td\n`;
  content += `(${escapePdf('GOVERNMENT OF THE VIRGIN ISLANDS')}) Tj\n`;
  content += `ET\n`;

  // Thin separator line under header
  content += `0.047 0.106 0.165 RG 0.5 w ${LM} ${H - 75} m ${W - RM} ${H - 75} l S\n`;

  // Shield/coat of arms
  content += drawShield(W / 2, H - 115, 50);

  // Department name
  content += `BT\n`;
  content += `/Helvetica-Bold 14 Tf 0.047 0.106 0.165 rg\n`;
  content += `${W / 2} ${H - 165} Td\n`;
  content += `(${escapePdf('ROYAL VIRGIN ISLANDS POLICE FORCE')}) Tj\n`;
  content += `ET\n`;

  // Gold separator line
  content += `0.84 0.69 0 RG 1.5 w ${W / 2 - 120} ${H - 178} m ${W / 2 + 120} ${H - 178} l S\n`;

  // === CERTIFICATE TITLE ===
  content += `BT\n`;
  content += `/Helvetica-Bold 22 Tf 0.047 0.106 0.165 rg\n`;
  content += `${W / 2} ${H - 210} Td\n`;
  content += `(${escapePdf('CERTIFICATE OF CHARACTER')}) Tj\n`;
  content += `ET\n`;

  // Certificate number and date
  content += `BT\n`;
  content += `/Helvetica 8.5 Tf 0.3 0.3 0.3 rg\n`;
  content += `${LM} ${H - 240} Td\n`;
  content += `(${escapePdf(`Certificate No: ${data.certificateNumber}`)}) Tj\n`;
  content += `${W - RM} ${H - 240} Td\n`;
  content += `(${escapePdf(`Date Issued: ${data.dateIssued}`)}) Tj\n`;
  content += `ET\n`;

  // Thin separator
  content += `0.8 0.8 0.8 RG 0.3 w ${LM} ${H - 250} m ${W - RM} ${H - 250} l S\n`;

  // === BODY SECTION ===
  let yPos = H - 280;

  // "This is to certify that..."
  content += `BT\n`;
  content += `/Helvetica 11 Tf 0.1 0.1 0.1 rg\n`;
  content += `${LM} ${yPos} Td\n`;
  content += `(${escapePdf('This is to certify that:')} ) Tj\n`;
  content += `ET\n`;
  yPos -= 25;

  // Applicant name - highlighted
  content += drawFilledRect(LM, yPos - 8, CW, 22, 0.95, 0.95, 0.97);
  content += `BT\n`;
  content += `/Helvetica-Bold 14 Tf 0.047 0.106 0.165 rg\n`;
  content += `${LM + 10} ${yPos - 2} Td\n`;
  content += `(${escapePdf(data.applicantName.toUpperCase())}) Tj\n`;
  content += `ET\n`;
  yPos -= 35;

  // Personal details table
  const details = [
    ['Date of Birth:', data.dateOfBirth],
    ['Place of Birth:', data.placeOfBirth],
    ['Nationality:', data.nationality],
    ['Passport No:', data.passportNumber || 'N/A'],
    ['Occupation:', data.occupation || 'N/A'],
    ['Address:', data.address],
  ];

  content += drawFilledRect(LM, yPos - details.length * 20 - 5, CW, details.length * 20 + 10, 0.97, 0.97, 0.98);

  for (const [label, value] of details) {
    content += `BT\n`;
    content += `/Helvetica-Bold 9.5 Tf 0.3 0.3 0.3 rg\n`;
    content += `${LM + 10} ${yPos} Td\n`;
    content += `(${escapePdf(label)} ) Tj\n`;
    content += `/Helvetica 9.5 Tf 0.1 0.1 0.1 rg\n`;
    content += `(${escapePdf(value)}) Tj\n`;
    content += `ET\n`;
    yPos -= 20;
  }

  yPos -= 15;

  // Purpose
  content += `BT\n`;
  content += `/Helvetica 10 Tf 0.1 0.1 0.1 rg\n`;
  content += `${LM} ${yPos} Td\n`;
  content += `(${escapePdf('Purpose:')}) Tj\n`;
  content += `ET\n`;
  yPos -= 15;
  content += `BT\n`;
  content += `/Helvetica 9.5 Tf 0.3 0.3 0.3 rg\n`;
  content += `${LM + 15} ${yPos} Td\n`;
  content += `(${escapePdf(data.purpose || 'Not specified')}) Tj\n`;
  content += `ET\n`;
  yPos -= 30;

  // Main certification statement
  content += drawLine(LM, yPos + 5, W - RM, yPos + 5, 0.3);
  yPos -= 5;

  if (data.hasConvictions) {
    content += `BT\n`;
    content += `/Helvetica 10.5 Tf 0.1 0.1 0.1 rg\n`;
    content += `${LM} ${yPos} Td\n`;
    content += `(${escapePdf('has been found to have the following conviction(s) within the jurisdiction of the British Virgin Islands:')}) Tj\n`;
    content += `ET\n`;
    yPos -= 20;
    content += drawFilledRect(LM + 10, yPos - 5, CW - 20, 20, 1, 0.93, 0.93);
    content += `BT\n`;
    content += `/Helvetica-Bold 10 Tf 0.6 0.1 0.1 rg\n`;
    content += `${LM + 20} ${yPos} Td\n`;
    content += `(${escapePdf(data.convictions || 'Details not specified')}) Tj\n`;
    content += `ET\n`;
    yPos -= 25;
  } else {
    content += `BT\n`;
    content += `/Helvetica 10.5 Tf 0.1 0.1 0.1 rg\n`;
    content += `${LM} ${yPos} Td\n`;
    content += `(${escapePdf('has no criminal record within the jurisdiction of the British Virgin Islands, based on records available to the Royal Virgin Islands Police Force up to the date of issue of this certificate.')}) Tj\n`;
    content += `ET\n`;
    yPos -= 20;
  }

  yPos -= 15;

  // Disclaimer note
  content += `BT\n`;
  content += `/Helvetica-Oblique 7.5 Tf 0.5 0.5 0.5 rg\n`;
  content += `${LM} ${yPos} Td\n`;
  content += `(This certificate is issued solely for the purpose stated above. It does not constitute a guarantee of the character of the bearer.) Tj\n`;
  content += `ET\n`;
  yPos -= 35;

  // === SIGNATURE SECTION ===
  const sigY = yPos;

  // Commissioner signature block
  content += drawLine(LM + 5, sigY, LM + 180, sigY, 0.5);
  content += `BT\n`;
  content += `/Helvetica 8.5 Tf 0.3 0.3 0.3 rg\n`;
  content += `${LM + 5} ${sigY - 15} Td\n`;
  content += `(${escapePdf(data.issuedBy || 'Commissioner of Police')}) Tj\n`;
  content += `${LM + 5} ${sigY - 27} Td\n`;
  content += `(Royal Virgin Islands Police Force) Tj\n`;
  content += `${LM + 5} ${sigY - 39} Td\n`;
  content += `(${escapePdf(data.dateIssued)}) Tj\n`;
  content += `ET\n`;

  // Official stamp area (right side)
  content += `0.047 0.106 0.165 RG 1 w`;
  content += drawRect(W - RM - 90, sigY - 30, 80, 80);
  content += `0.047 0.106 0.165 rg`;
  content += `BT /Helvetica-Bold 6.5 Tf ${W - RM - 80} ${sigY + 5} Td (OFFICIAL) Tj ET\n`;
  content += `BT /Helvetica 5.5 Tf ${W - RM - 82} ${sigY - 5} Td (RVIPF) Tj ET\n`;
  content += `BT /Helvetica 5 Tf ${W - RM - 80} ${sigY - 15} Td (SEAL) Tj ET\n`;
  content += `0.8 g`;
  content += `BT /Helvetica 5.5 Tf ${W - RM - 85} ${sigY - 25} Td (Road Town, Tortola) Tj ET\n`;

  // === FOOTER ===
  content += `0.84 0.69 0 RG 1.5 w ${LM} ${60} m ${W - RM} ${60} l S\n`;
  content += `BT\n`;
  content += `/Helvetica 7 Tf 0.4 0.4 0.4 rg\n`;
  content += `${W / 2} ${42} Td\n`;
  content += `(Government of the Virgin Islands | Royal Virgin Islands Police Force | Road Town, Tortola) Tj\n`;
  content += `${W / 2} ${30} Td\n`;
  content += `(Certificate No: ${escapePdf(data.certificateNumber)} | Valid Until: ${escapePdf(data.dateExpires)}) Tj\n`;
  content += `ET\n`;

  // Gold bottom border
  content += drawFilledRect(30, 22, W - 60, 4, 0.84, 0.69, 0);

  // Create PDF objects
  const contentObjId = newObj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const pageId = newObj(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] ` +
    `/Contents ${contentObjId} 0 R ` +
    `/Resources << /Font << /Helvetica /F1 /Helvetica-Bold /F2 /Helvetica-Oblique /F3 >> >> >>`
  );

  // Build PDF file
  const header = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  let xrefTable = '';
  const offsets: number[] = [];
  let pdfBody = header;

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdfBody.length);
    pdfBody += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdfBody.length;
  pdfBody += `xref\n0 ${objects.length + 1}\n`;
  pdfBody += `0000000000 65535 f \n`;

  for (const offset of offsets) {
    pdfBody += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdfBody, 'latin1');
}

export function generateGenericCertificatePDF(data: {
  certificateNumber: string;
  dateIssued: string;
  type: string;
  applicantName: string;
  details: Record<string, string>;
  department: string;
  issuedBy: string;
}): Buffer {
  const W = 595;
  const H = 842;
  const LM = 50;
  const RM = 50;
  const CW = W - LM - RM;

  let content = '';

  // Top gold border
  content += drawFilledRect(30, H - 30, W - 60, 4, 0.84, 0.69, 0);

  // Header
  content += `BT /Helvetica-Bold 9 Tf 0.047 0.106 0.165 rg ${W / 2} ${H - 65} Td (${escapePdf('GOVERNMENT OF THE VIRGIN ISLANDS')}) Tj ET\n`;
  content += `0.047 0.106 0.165 RG 0.5 w ${LM} ${H - 75} m ${W - RM} ${H - 75} l S\n`;

  // Shield
  content += drawShield(W / 2, H - 110, 45);

  // Department
  content += `BT /Helvetica-Bold 12 Tf 0.047 0.106 0.165 rg ${W / 2} ${H - 155} Td (${escapePdf(data.department.toUpperCase())}) Tj ET\n`;

  // Gold line
  content += `0.84 0.69 0 RG 1.5 w ${W / 2 - 100} ${H - 168} m ${W / 2 + 100} ${H - 168} l S\n`;

  // Title
  content += `BT /Helvetica-Bold 20 Tf 0.047 0.106 0.165 rg ${W / 2} ${H - 200} Td (${escapePdf(data.type.toUpperCase())}) Tj ET\n`;

  // Certificate number + date
  content += `BT /Helvetica 8.5 Tf 0.3 0.3 0.3 rg ${LM} ${H - 230} Td (${escapePdf(`No: ${data.certificateNumber}`)}) Tj ${W - RM} ${H - 230} Td (${escapePdf(`Issued: ${data.dateIssued}`)}) Tj ET\n`;
  content += `0.8 0.8 0.8 RG 0.3 w ${LM} ${H - 240} m ${W - RM} ${H - 240} l S\n`;

  let yPos = H - 270;

  // Applicant name highlighted
  content += drawFilledRect(LM, yPos - 6, CW, 22, 0.95, 0.95, 0.97);
  content += `BT /Helvetica-Bold 14 Tf 0.047 0.106 0.165 rg ${LM + 10} ${yPos} Td (${escapePdf(data.applicantName.toUpperCase())}) Tj ET\n`;
  yPos -= 30;

  // Details table
  const entries = Object.entries(data.details);
  content += drawFilledRect(LM, yPos - entries.length * 20 - 5, CW, entries.length * 20 + 10, 0.97, 0.97, 0.98);

  for (const [label, value] of entries) {
    content += `BT /Helvetica-Bold 9.5 Tf 0.3 0.3 0.3 rg ${LM + 10} ${yPos} Td (${escapePdf(label)} ) Tj /Helvetica 9.5 Tf 0.1 0.1 0.1 rg (${escapePdf(value)}) Tj ET\n`;
    yPos -= 20;
  }

  yPos -= 20;

  // Signature
  content += drawLine(LM + 5, yPos, LM + 180, yPos, 0.5);
  content += `BT /Helvetica 8.5 Tf 0.3 0.3 0.3 rg ${LM + 5} ${yPos - 15} Td (${escapePdf(data.issuedBy)}) Tj ${LM + 5} ${yPos - 27} Td (${escapePdf(data.department)}) Tj ${LM + 5} ${yPos - 39} Td (${escapePdf(data.dateIssued)}) Tj ET\n`;

  // Official stamp
  content += `0.047 0.106 0.165 RG 1 w ${drawRect(W - RM - 90, yPos - 30, 80, 80)}`;
  content += `BT /Helvetica-Bold 6.5 Tf 0.047 0.106 0.165 rg ${W - RM - 80} ${yPos + 5} Td (OFFICIAL) Tj ET\n`;

  // Footer
  content += `0.84 0.69 0 RG 1.5 w ${LM} ${60} m ${W - RM} ${60} l S\n`;
  content += `BT /Helvetica 7 Tf 0.4 0.4 0.4 rg ${W / 2} ${42} Td (Government of the Virgin Islands) Tj ${W / 2} ${30} Td (Certificate No: ${escapePdf(data.certificateNumber)}) Tj ET\n`;
  content += drawFilledRect(30, 22, W - 60, 4, 0.84, 0.69, 0);

  const objects: string[] = [];
  let objNum = 1;
  const newObj = (c: string) => { objects.push(c); return objNum++; };

  newObj(`<< /Type /Catalog /Pages 2 0 R >>`);
  newObj(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);
  const contentObjId = newObj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  newObj(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] ` +
    `/Contents ${contentObjId} 0 R ` +
    `/Resources << /Font << /Helvetica /F1 /Helvetica-Bold /F2 /Helvetica-Oblique /F3 >> >> >>`
  );

  const header = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  const offsets: number[] = [];
  let pdfBody = header;

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdfBody.length);
    pdfBody += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdfBody.length;
  pdfBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdfBody += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdfBody, 'latin1');
}
