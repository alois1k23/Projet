import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildLetter, getTemplate, placeAndDate, senderBlock, TEMPLATES, validateFields } from "@/lib/letters/templates";
import { renderLetterPdf, toWinAnsi, wrap } from "@/lib/letters/pdf";

const sender = { name: "Sophie Martin", addressLine: "Rue du Lac 12", postalCode: "1003", city: "Lausanne" };

describe("modèles de lettres", () => {
  it("retrouve un modèle et ignore les identifiants inconnus ou piégés", () => {
    expect(getTemplate("resiliation-assurance")?.id).toBe("resiliation-assurance");
    expect(getTemplate("inconnu")).toBeNull();
    expect(getTemplate("constructor")).toBeNull();
    expect(getTemplate("__proto__")).toBeNull();
  });

  it("signale les champs obligatoires manquants et les valeurs invalides", () => {
    const t = TEMPLATES["resiliation-assurance"];
    const errors = validateFields(t, { recipientName: "Caisse", insuranceType: "inconnu", endDate: "31.12.2026" });
    expect(errors.recipientAddress).toBeDefined();
    expect(errors.policyNumber).toBeDefined();
    expect(errors.insuranceType).toBe("Choix invalide.");
    expect(errors.endDate).toBe("Date invalide.");
  });

  it("rédige une résiliation LAMal en français avec la règle du nouvel assureur", () => {
    const t = TEMPLATES["resiliation-assurance"];
    const values = { recipientName: "Caisse Exemple SA", recipientAddress: "Case postale\n1000 Lausanne", insuranceType: "base", policyNumber: "756.1234", endDate: "2026-12-31" };
    expect(validateFields(t, values)).toEqual({});
    const letter = buildLetter(t, values, "fr");
    expect(letter.recipient).toBe("Caisse Exemple SA\nCase postale\n1000 Lausanne");
    expect(letter.subject).toContain("756.1234");
    expect(letter.body).toContain("31 décembre 2026");
    expect(letter.body).toContain("nouvel assureur");
  });

  it("rédige la même lettre en allemand", () => {
    const letter = buildLetter(TEMPLATES["resiliation-assurance"], { recipientName: "KK", recipientAddress: "8000 Zürich", insuranceType: "base", policyNumber: "1", endDate: "2026-12-31" }, "de");
    expect(letter.subject).toContain("Kündigung");
    expect(letter.body).toContain("31. Dezember 2026");
    expect(letter.body).toContain("Freundliche Grüsse");
  });

  it("utilise « prochaine échéance possible » sans date de fin", () => {
    const letter = buildLetter(TEMPLATES["resiliation-contrat"], { recipientName: "Telco", recipientAddress: "x", contractNumber: "42" }, "fr");
    expect(letter.body).toContain("prochaine échéance possible");
  });

  it("chaque modèle produit une lettre complète dans les deux langues", () => {
    for (const t of Object.values(TEMPLATES)) {
      const values = Object.fromEntries(t.fields.map((f) => [f.key, f.type === "date" ? "2026-11-30" : f.type === "select" ? f.options[0]!.value : "valeur"]));
      expect(validateFields(t, values), t.id).toEqual({});
      for (const lang of ["fr", "de"] as const) {
        const l = buildLetter(t, values, lang);
        expect(l.subject.length).toBeGreaterThan(10);
        expect(l.body).not.toContain("undefined");
      }
    }
  });

  it("compose l'en-tête et la date", () => {
    expect(senderBlock(sender)).toBe("Sophie Martin\nRue du Lac 12\n1003 Lausanne");
    expect(senderBlock({ name: "Marco" })).toBe("Marco");
    const date = new Date("2026-10-28T10:00:00Z");
    expect(placeAndDate(sender, date, "fr")).toBe("Lausanne, le 28 octobre 2026");
    expect(placeAndDate(sender, date, "de")).toBe("Lausanne, 28. Oktober 2026");
  });
});

describe("génération PDF", () => {
  it("produit un PDF A4 valide contenant le texte", async () => {
    const bytes = await renderLetterPdf({
      sender: senderBlock(sender),
      recipient: "Caisse Exemple SA\n1000 Lausanne",
      placeAndDate: "Lausanne, le 28 octobre 2026",
      subject: "Résiliation – n° 756",
      body: "Madame, Monsieur,\n\nJe résilie mon contrat… Grüsse, ½ œ",
      signatureName: "Sophie Martin",
    });
    expect(Buffer.from(bytes.subarray(0, 5)).toString()).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getTitle()).toBe("Résiliation – n° 756");
  });

  it("ajoute des pages pour une lettre longue", async () => {
    const bytes = await renderLetterPdf({ sender: "A", recipient: "B", placeAndDate: "C", subject: "D", body: "Texte. ".repeat(1500), signatureName: "E" });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
  });

  it("remplace les caractères non pris en charge et coupe les lignes", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    expect(toWinAnsi("l’assurance – « ok »… ✓", font)).toBe("l'assurance - « ok »... ?");
    const lines = wrap("mot ".repeat(100), font, 11, 200);
    expect(lines.length).toBeGreaterThan(5);
    for (const line of lines) expect(font.widthOfTextAtSize(line, 11)).toBeLessThanOrEqual(200);
  });
});
