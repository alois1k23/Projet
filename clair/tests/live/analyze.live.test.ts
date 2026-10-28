/**
 * Test réel contre l'API Claude. Ignoré sans ANTHROPIC_API_KEY.
 * Usage : ANTHROPIC_API_KEY=... npm run test:live
 * Chaque exécution consomme quelques centimes d'API.
 */
import Anthropic from "@anthropic-ai/sdk";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { AnthropicAnalyzer } from "@/lib/ai/analyzer";

const key = process.env.ANTHROPIC_API_KEY;

async function letterPdf(lines: string[]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  lines.forEach((line, i) => page.drawText(line, { x: 60, y: 780 - i * 18, size: 11, font }));
  return Buffer.from(await doc.save());
}

describe.skipIf(!key)("analyse réelle (API Claude)", () => {
  it("extrait montant, échéance et IBAN d'une facture QR suisse en allemand", async () => {
    const pdf = await letterPdf([
      "Elektrizitätswerk Muster AG",
      "Rechnung Nr. 2026-4471 vom 20.10.2026",
      "Stromverbrauch Juli bis September 2026",
      "Total zu bezahlen: CHF 1'186.45",
      "Zahlbar bis: 19.11.2026",
      "Konto / Zahlbar an: CH44 3199 9123 0008 8901 2",
      "Referenz: 21 00000 00003 13947 14300 09017",
    ]);
    const analyzer = new AnthropicAnalyzer(new Anthropic({ apiKey: key }), process.env.CLAIR_AI_MODEL ?? "claude-opus-5-5");
    const result = await analyzer.analyze({ pages: [{ content: pdf, mimeType: "application/pdf" }], fileName: "facture.pdf", today: new Date("2026-10-28T00:00:00Z") });
    expect(result.amount).toBe(1186.45);
    expect(result.dueDate).toBe("2026-11-19");
    expect(result.payment?.iban?.replace(/\s/g, "")).toBe("CH4431999123000889012");
    expect(result.language).toBe("de");
    expect(result.actions.some((a) => a.kind === "PAY")).toBe(true);
  }, 180_000);
});
