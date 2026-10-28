import { describe, expect, it } from "vitest";
import { normalizeAnalysis, parseIsoDate, type AnalysisOutput } from "@/lib/ai/schema";
import { daysUntil, groupByUrgency, relativeLabel, shouldRemind, todayInZurich, urgencyOf, zurichHour } from "@/lib/deadlines";
import { formatIban, formatMoney, isValidIban } from "@/lib/format";
import { buildCalendar, escapeText, foldLine } from "@/lib/ics";
import { SAMPLES } from "@/lib/samples";

const base: AnalysisOutput = {
  isAdministrativeDocument: true,
  documentType: "facture",
  title: "  Facture  ",
  sender: "SIL",
  language: "fr",
  summary: "Une facture.",
  amount: 186.456,
  currency: null,
  dueDate: "2026-11-09",
  urgency: "normale",
  actions: [{ kind: "PAY", title: "Payer", dueDate: "2026-11-09", amount: 186.45 }],
  payment: null,
  references: [],
  warnings: ["  ", "Attention"],
  suggestedLetters: ["delai-paiement", "delai-paiement"],
  confidence: { overall: 0.95, dueDate: 0.9, amount: 1.4 },
};

describe("normalisation de l'analyse IA", () => {
  it("nettoie et borne les valeurs", () => {
    const n = normalizeAnalysis(base);
    expect(n.title).toBe("Facture");
    expect(n.amount).toBe(186.46);
    expect(n.currency).toBe("CHF");
    expect(n.confidence.amount).toBe(1);
    expect(n.warnings).toEqual(["Attention"]);
    expect(n.suggestedLetters).toEqual(["delai-paiement"]);
    expect(n.needsReview).toBe(false);
  });

  it("écarte une date impossible et demande une vérification", () => {
    const n = normalizeAnalysis({ ...base, dueDate: "2026-02-31" });
    expect(n.dueDate).toBeNull();
    expect(n.needsReview).toBe(true);
  });

  it("demande une vérification quand la confiance est faible", () => {
    expect(normalizeAnalysis({ ...base, confidence: { overall: 0.95, dueDate: 0.5, amount: 0.9 } }).needsReview).toBe(true);
    expect(normalizeAnalysis({ ...base, confidence: { overall: 0.5, dueDate: 0.9, amount: 0.9 } }).needsReview).toBe(true);
  });

  it("demande une vérification si ce n'est pas un document administratif", () => {
    expect(normalizeAnalysis({ ...base, isAdministrativeDocument: false }).needsReview).toBe(true);
  });

  it("rejette les montants aberrants", () => {
    expect(normalizeAnalysis({ ...base, amount: -5 }).amount).toBeNull();
    expect(normalizeAnalysis({ ...base, amount: Number.NaN }).amount).toBeNull();
    expect(normalizeAnalysis({ ...base, amount: 1e12 }).amount).toBeNull();
  });

  it("limite le nombre d'actions et ignore les actions vides", () => {
    const actions = Array.from({ length: 9 }, (_, i) => ({ kind: "OTHER" as const, title: i === 0 ? " " : `Action ${i}`, dueDate: "pas une date", amount: null }));
    const n = normalizeAnalysis({ ...base, actions });
    expect(n.actions).toHaveLength(6);
    expect(n.actions[0]!.title).toBe("Action 1");
    expect(n.actions[0]!.dueDate).toBeNull();
  });

  it("parse uniquement des dates ISO réelles", () => {
    expect(parseIsoDate("2026-11-30")?.toISOString()).toBe("2026-11-30T00:00:00.000Z");
    expect(parseIsoDate("30.11.2026")).toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
  });

  it("les courriers d'exemple respectent le schéma", () => {
    const today = new Date("2026-10-28T00:00:00Z");
    for (const sample of SAMPLES) {
      const n = normalizeAnalysis(sample.analysis(today));
      expect(n.needsReview, sample.id).toBe(false);
      expect(n.summary.length).toBeGreaterThan(20);
    }
  });
});

describe("échéances", () => {
  const today = new Date("2026-10-28T00:00:00Z");
  const d = (s: string) => new Date(`${s}T00:00:00Z`);

  it("calcule les jours restants et l'urgence", () => {
    expect(daysUntil(d("2026-10-30"), today)).toBe(2);
    expect(urgencyOf(d("2026-10-27"), today)).toBe("overdue");
    expect(urgencyOf(d("2026-10-28"), today)).toBe("today");
    expect(urgencyOf(d("2026-11-04"), today)).toBe("soon");
    expect(urgencyOf(d("2026-11-05"), today)).toBe("later");
    expect(urgencyOf(null, today)).toBe("none");
  });

  it("formule des libellés lisibles", () => {
    expect(relativeLabel(d("2026-10-25"), today)).toBe("En retard de 3 jours");
    expect(relativeLabel(d("2026-10-27"), today)).toBe("En retard d’un jour");
    expect(relativeLabel(d("2026-10-28"), today)).toBe("Aujourd’hui");
    expect(relativeLabel(d("2026-10-29"), today)).toBe("Demain");
    expect(relativeLabel(d("2026-11-07"), today)).toBe("Dans 10 jours");
    expect(relativeLabel(d("2027-01-28"), today)).toBe("Dans 13 semaines");
  });

  it("regroupe et trie par date", () => {
    const items = [{ dueDate: d("2026-12-01") }, { dueDate: null }, { dueDate: d("2026-10-30") }, { dueDate: d("2026-10-01") }, { dueDate: d("2026-10-29") }];
    const g = groupByUrgency(items, today);
    expect(g.overdue).toHaveLength(1);
    expect(g.week.map((i) => i.dueDate?.toISOString().slice(0, 10))).toEqual(["2026-10-29", "2026-10-30"]);
    expect(g.later).toHaveLength(1);
    expect(g.undated).toHaveLength(1);
  });

  it("utilise le fuseau de Zurich pour « aujourd'hui »", () => {
    expect(todayInZurich(new Date("2026-10-28T23:30:00Z")).toISOString().slice(0, 10)).toBe("2026-10-29");
    expect(todayInZurich(new Date("2026-07-01T21:59:00Z")).toISOString().slice(0, 10)).toBe("2026-07-01");
  });

  it("donne l’heure suisse, été comme hiver", () => {
    expect(zurichHour(new Date("2026-10-28T10:56:00Z"))).toBe(11);
    expect(zurichHour(new Date("2026-07-01T16:30:00Z"))).toBe(18);
    expect(zurichHour(new Date("2026-12-31T23:10:00Z"))).toBe(0);
  });

  it("décide quand envoyer un rappel", () => {
    const task = { dueDate: d("2026-10-30"), remindedAt: null, status: "OPEN" };
    expect(shouldRemind(task, today)).toBe(true);
    expect(shouldRemind({ ...task, dueDate: d("2026-11-15") }, today)).toBe(false);
    expect(shouldRemind({ ...task, remindedAt: new Date() }, today)).toBe(false);
    expect(shouldRemind({ ...task, status: "DONE" }, today)).toBe(false);
  });
});

describe("formats suisses", () => {
  it("valide les IBAN par le contrôle modulo 97", () => {
    expect(isValidIban("CH44 3199 9123 0008 8901 2")).toBe(true);
    expect(isValidIban("CH93 0076 2011 6238 5295 7")).toBe(true);
    expect(isValidIban("CH44 3199 9123 0008 8901 3")).toBe(false);
    expect(isValidIban("pas un iban")).toBe(false);
  });

  it("formate les IBAN et les montants", () => {
    expect(formatIban("ch4431999123000889012")).toBe("CH44 3199 9123 0008 8901 2");
    expect(formatMoney(1240.5)).toBe("CHF 1’240.50");
    expect(formatMoney(84.3, "EUR")).toBe("EUR 84.30");
    expect(formatMoney(null)).toBe("—");
  });
});

describe("export agenda iCalendar", () => {
  it("échappe le texte selon RFC 5545", () => {
    expect(escapeText("a;b,c\\d\ne")).toBe("a\\;b\\,c\\\\d\\ne");
  });

  it("plie les lignes longues à 75 octets", () => {
    const folded = foldLine("SUMMARY:" + "é".repeat(80));
    for (const line of folded.split("\r\n")) expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
    expect(folded.split("\r\n").slice(1).every((l) => l.startsWith(" "))).toBe(true);
  });

  it("produit un événement journée entière avec alarme", () => {
    const ics = buildCalendar([{ id: "t1", title: "Payer la facture", dueDate: new Date("2026-11-09T00:00:00Z") }], new Date("2026-10-28T10:00:00Z"));
    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261109");
    expect(ics).toContain("DTEND;VALUE=DATE:20261110");
    expect(ics).toContain("TRIGGER:-P2D");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
