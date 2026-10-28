import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export interface PdfLetter {
  sender: string;
  recipient: string;
  placeAndDate: string;
  subject: string;
  body: string;
  signatureName: string;
}

// Format A4 en points. La fenêtre d’enveloppe suisse (C5/6) est à droite.
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN_LEFT = 70;
const MARGIN_RIGHT = 60;
const WINDOW_X = 330;
const BODY_SIZE = 11;
const LINE_HEIGHT = 15.5;

const REPLACEMENTS: Record<string, string> = { "’": "'", "‘": "'", "“": '"', "”": '"', "–": "-", "—": "-", "…": "...", " ": " ", " ": " " };

/** Les polices standard PDF utilisent WinAnsi : on remplace ce qu’elles ne savent pas afficher. */
export function toWinAnsi(text: string, font: PDFFont): string {
  let out = "";
  for (const raw of text.normalize("NFC")) {
    const char = REPLACEMENTS[raw] ?? raw;
    if (char === "\n") {
      out += char;
      continue;
    }
    try {
      font.encodeText(char);
      out += char;
    } catch {
      out += "?";
    }
  }
  return out;
}

export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderLetterPdf(letter: PdfLetter): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(letter.subject);
  doc.setCreator("Clair");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.1, 0.14);
  const textWidth = PAGE.width - MARGIN_LEFT - MARGIN_RIGHT;

  let page = doc.addPage([PAGE.width, PAGE.height]);
  const draw = (text: string, x: number, y: number, font = regular, size = BODY_SIZE) =>
    page.drawText(toWinAnsi(text, font), { x, y, font, size, color: ink });

  // Expéditeur
  let y = PAGE.height - 70;
  for (const line of letter.sender.split("\n")) {
    draw(line, MARGIN_LEFT, y, regular, 10);
    y -= 13;
  }

  // Destinataire (fenêtre à droite)
  y = PAGE.height - 175;
  for (const line of letter.recipient.split("\n")) {
    draw(line, WINDOW_X, y);
    y -= LINE_HEIGHT;
  }

  y = PAGE.height - 290;
  draw(letter.placeAndDate, MARGIN_LEFT, y);
  y -= LINE_HEIGHT * 2.5;

  for (const line of wrap(toWinAnsi(letter.subject, bold), bold, BODY_SIZE, textWidth)) {
    draw(line, MARGIN_LEFT, y, bold);
    y -= LINE_HEIGHT;
  }
  y -= LINE_HEIGHT;

  const bodyLines = [...wrap(toWinAnsi(letter.body, regular), regular, BODY_SIZE, textWidth), "", "", "", letter.signatureName];
  for (const line of bodyLines) {
    if (y < 70) {
      page = doc.addPage([PAGE.width, PAGE.height]);
      y = PAGE.height - 70;
    }
    if (line) draw(line, MARGIN_LEFT, y);
    y -= LINE_HEIGHT;
  }
  return doc.save();
}
