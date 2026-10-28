import { z } from "zod";

export const DOCUMENT_TYPES = [
  "facture",
  "rappel",
  "poursuite",
  "prime_assurance",
  "decompte_assurance",
  "impots",
  "bail",
  "commune",
  "salaire",
  "banque",
  "contrat",
  "autre",
] as const;

export const ACTION_KINDS = ["PAY", "REPLY", "CANCEL", "CHECK", "OTHER"] as const;

export const LETTER_TEMPLATE_IDS = [
  "resiliation-assurance",
  "resiliation-contrat",
  "contestation-facture",
  "delai-paiement",
  "reclamation-taxation",
] as const;

/**
 * Schéma envoyé au modèle (sortie structurée). Volontairement simple :
 * les contraintes métier (dates valides, bornes) sont vérifiées ensuite par `normalizeAnalysis`.
 */
export const AnalysisOutputSchema = z.object({
  isAdministrativeDocument: z.boolean().describe("Faux si l’image n’est pas un courrier ou document administratif"),
  documentType: z.enum(DOCUMENT_TYPES),
  title: z.string().describe("Titre court en français, par exemple « Avis de taxation 2025 »"),
  sender: z.string().nullable().describe("Nom de l’expéditeur tel qu’écrit sur le document"),
  language: z.enum(["fr", "de", "it", "en", "autre"]),
  summary: z.string().describe("Explication en français simple, 2 à 4 phrases, sans jargon"),
  amount: z.number().nullable().describe("Montant principal à payer ou à recevoir, sans devise"),
  currency: z.enum(["CHF", "EUR"]).nullable(),
  dueDate: z.string().nullable().describe("Échéance principale au format AAAA-MM-JJ, uniquement si elle figure sur le document"),
  urgency: z.enum(["haute", "normale", "faible"]),
  actions: z.array(
    z.object({
      kind: z.enum(ACTION_KINDS),
      title: z.string().describe("Action concrète à l’infinitif, par exemple « Payer la facture »"),
      dueDate: z.string().nullable().describe("AAAA-MM-JJ"),
      amount: z.number().nullable(),
    }),
  ),
  payment: z
    .object({
      iban: z.string().nullable(),
      reference: z.string().nullable(),
      creditor: z.string().nullable(),
    })
    .nullable(),
  references: z.array(z.object({ label: z.string(), value: z.string() })).describe("Numéros utiles : contrat, contribuable, facture, police"),
  warnings: z.array(z.string()).describe("Points d’attention concrets pour l’utilisateur"),
  suggestedLetters: z.array(z.enum(LETTER_TEMPLATE_IDS)),
  confidence: z.object({
    overall: z.number().describe("Entre 0 et 1"),
    dueDate: z.number().nullable().describe("Entre 0 et 1, nul si aucune échéance"),
    amount: z.number().nullable().describe("Entre 0 et 1, nul si aucun montant"),
  }),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

/** Seuil sous lequel un champ critique est signalé « à vérifier ». */
export const REVIEW_THRESHOLD = 0.8;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !ISO_DATE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  // Rejette les dates impossibles comme 2026-02-31, que Date normalise silencieusement.
  return date.toISOString().slice(0, 10) === value ? date : null;
}

const clamp01 = (n: number | null) => (n === null || Number.isNaN(n) ? null : Math.min(1, Math.max(0, n)));
const cleanAmount = (n: number | null) =>
  n === null || !Number.isFinite(n) || n < 0 || n > 10_000_000 ? null : Math.round(n * 100) / 100;

export interface NormalizedAnalysis extends AnalysisOutput {
  needsReview: boolean;
}

/** Valide et nettoie la sortie du modèle. Ne fait jamais confiance aux valeurs brutes. */
export function normalizeAnalysis(raw: AnalysisOutput): NormalizedAnalysis {
  const dueDate = parseIsoDate(raw.dueDate) ? raw.dueDate : null;
  const amount = cleanAmount(raw.amount);
  const confidence = {
    overall: clamp01(raw.confidence.overall) ?? 0,
    dueDate: dueDate ? clamp01(raw.confidence.dueDate) : null,
    amount: amount !== null ? clamp01(raw.confidence.amount) : null,
  };
  const actions = raw.actions
    .filter((a) => a.title.trim().length > 0)
    .slice(0, 6)
    .map((a) => ({
      kind: a.kind,
      title: a.title.trim().slice(0, 140),
      dueDate: parseIsoDate(a.dueDate) ? a.dueDate : null,
      amount: cleanAmount(a.amount),
    }));
  const needsReview =
    !raw.isAdministrativeDocument ||
    confidence.overall < REVIEW_THRESHOLD ||
    (confidence.dueDate !== null && confidence.dueDate < REVIEW_THRESHOLD) ||
    (confidence.amount !== null && confidence.amount < REVIEW_THRESHOLD) ||
    (raw.dueDate !== null && dueDate === null);

  return {
    ...raw,
    title: raw.title.trim().slice(0, 120) || "Courrier",
    sender: raw.sender?.trim().slice(0, 120) || null,
    summary: raw.summary.trim().slice(0, 1200),
    amount,
    currency: amount !== null ? (raw.currency ?? "CHF") : null,
    dueDate,
    actions,
    references: raw.references.slice(0, 8),
    warnings: raw.warnings.map((w) => w.trim()).filter(Boolean).slice(0, 5),
    suggestedLetters: [...new Set(raw.suggestedLetters)],
    confidence,
    needsReview,
  };
}
