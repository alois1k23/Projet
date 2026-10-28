import type { AnalysisOutput } from "./schema";
import type { Locale } from "@/i18n/config";

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000).toISOString().slice(0, 10);

/**
 * Réponses fixes utilisées par les tests automatisés (CLAIR_AI_PROVIDER=mock).
 * Le nom de fichier choisit le scénario. L’interface signale ce mode.
 */
export function mockAnalysis(fileName: string, today: Date, locale: Locale = "fr"): AnalysisOutput {
  const name = fileName.toLowerCase();
  if (name.includes("flou")) {
    return {
      isAdministrativeDocument: true,
      documentType: "facture",
      title: "Facture d’électricité",
      sender: "Services industriels (test)",
      language: "fr",
      summary: "Facture d’électricité. Le montant est partiellement illisible sur la photo.",
      amount: 84.3,
      currency: "CHF",
      dueDate: addDays(today, 20),
      urgency: "normale",
      actions: [{ kind: "PAY", title: "Payer la facture d’électricité", dueDate: addDays(today, 20), amount: 84.3 }],
      payment: null,
      references: [],
      warnings: ["Vérifiez le montant : la photo est floue."],
      suggestedLetters: [],
      confidence: { overall: 0.6, dueDate: 0.9, amount: 0.5 },
    };
  }
  if (locale === "en") {
    return {
      isAdministrativeDocument: true,
      documentType: "prime_assurance",
      title: "New health insurance premium 2027",
      sender: "Caisse-maladie Exemple SA",
      language: "de",
      summary:
        "Your health insurer announces your premium for 2027: CHF 438.20 per month, CHF 24.10 more than in 2026. If you want to switch basic insurance, your cancellation must reach the insurer before the end of November.",
      amount: 438.2,
      currency: "CHF",
      dueDate: addDays(today, 30),
      urgency: "haute",
      actions: [
        { kind: "CHECK", title: "Compare 2027 premiums", dueDate: addDays(today, 20), amount: null },
        { kind: "CANCEL", title: "Send the cancellation if you switch insurer", dueDate: addDays(today, 30), amount: null },
      ],
      payment: null,
      references: [{ label: "Insured person number", value: "756.1234.5678.97" }],
      warnings: ["If your cancellation does not arrive in time, your contract continues in 2027 at the new rate."],
      suggestedLetters: ["resiliation-assurance"],
      confidence: { overall: 0.95, dueDate: 0.92, amount: 0.97 },
    };
  }
  if (locale === "de") {
    return {
      isAdministrativeDocument: true,
      documentType: "prime_assurance",
      title: "Neue Krankenkassenprämie 2027",
      sender: "Caisse-maladie Exemple SA",
      language: "de",
      summary:
        "Ihre Krankenkasse teilt Ihnen Ihre Prämie für 2027 mit: CHF 438.20 pro Monat, CHF 24.10 mehr als 2026. Wenn Sie die Grundversicherung wechseln möchten, muss Ihre Kündigung vor Ende November bei ihr eintreffen.",
      amount: 438.2,
      currency: "CHF",
      dueDate: addDays(today, 30),
      urgency: "haute",
      actions: [
        { kind: "CHECK", title: "Prämien 2027 vergleichen", dueDate: addDays(today, 20), amount: null },
        { kind: "CANCEL", title: "Kündigung senden, falls Sie die Kasse wechseln", dueDate: addDays(today, 30), amount: null },
      ],
      payment: null,
      references: [{ label: "Versichertennummer", value: "756.1234.5678.97" }],
      warnings: ["Ohne rechtzeitig eingetroffene Kündigung läuft Ihr Vertrag 2027 zum neuen Tarif weiter."],
      suggestedLetters: ["resiliation-assurance"],
      confidence: { overall: 0.95, dueDate: 0.92, amount: 0.97 },
    };
  }
  return {
    isAdministrativeDocument: true,
    documentType: "prime_assurance",
    title: "Nouvelle prime d’assurance-maladie 2027",
    sender: "Caisse-maladie Exemple SA",
    language: "de",
    summary:
      "Votre caisse-maladie annonce votre prime pour 2027 : CHF 438.20 par mois, soit CHF 24.10 de plus qu’en 2026. Si vous voulez changer d’assurance de base, votre résiliation doit lui parvenir avant la fin novembre.",
    amount: 438.2,
    currency: "CHF",
    dueDate: addDays(today, 30),
    urgency: "haute",
    actions: [
      { kind: "CHECK", title: "Comparer les primes 2027", dueDate: addDays(today, 20), amount: null },
      { kind: "CANCEL", title: "Envoyer la résiliation si vous changez de caisse", dueDate: addDays(today, 30), amount: null },
    ],
    payment: null,
    references: [{ label: "N° d’assuré", value: "756.1234.5678.97" }],
    warnings: ["Sans résiliation reçue à temps, votre contrat continue en 2027 au nouveau tarif."],
    suggestedLetters: ["resiliation-assurance"],
    confidence: { overall: 0.95, dueDate: 0.92, amount: 0.97 },
  };
}
