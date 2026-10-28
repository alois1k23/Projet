import type { AnalysisOutput } from "./schema";

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000).toISOString().slice(0, 10);

/**
 * Réponses fixes utilisées par les tests automatisés (CLAIR_AI_PROVIDER=mock).
 * Le nom de fichier choisit le scénario. L’interface signale ce mode.
 */
export function mockAnalysis(fileName: string, today: Date): AnalysisOutput {
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
