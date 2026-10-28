import type { AnalysisOutput } from "@/lib/ai/schema";

export interface SampleLetter {
  id: string;
  label: string;
  /** Texte du courrier fictif, affiché à la place de l’original. */
  text: (today: Date) => string;
  analysis: (today: Date) => AnalysisOutput;
}

const iso = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000).toISOString().slice(0, 10);
const ch = (d: Date, days: number) => {
  const [y, m, day] = iso(d, days).split("-");
  return `${day}.${m}.${y}`;
};

/** Courriers fictifs pour découvrir l’application sans téléverser de document personnel. */
export const SAMPLES: SampleLetter[] = [
  {
    id: "facture-qr",
    label: "Une facture avec QR-code",
    text: (t) => `Services Industriels du Lac (exemple)
Facture n° 2026-118 204 · Électricité, période juillet–septembre

Montant à payer : CHF 186.45
Payable jusqu’au ${ch(t, 12)}

Compte / Payable à : CH44 3199 9123 0008 8901 2
Référence : 21 00000 00003 13947 14300 09017`,
    analysis: (t) => ({
      isAdministrativeDocument: true,
      documentType: "facture",
      title: "Facture d’électricité juillet–septembre",
      sender: "Services Industriels du Lac (exemple)",
      language: "fr",
      summary: "Votre fournisseur vous facture l’électricité consommée de juillet à septembre. C’est une facture ordinaire à payer avant l’échéance pour éviter des frais de rappel.",
      amount: 186.45,
      currency: "CHF",
      dueDate: iso(t, 12),
      urgency: "normale",
      actions: [{ kind: "PAY", title: "Payer la facture d’électricité", dueDate: iso(t, 12), amount: 186.45 }],
      payment: { iban: "CH44 3199 9123 0008 8901 2", reference: "21 00000 00003 13947 14300 09017", creditor: "Services Industriels du Lac (exemple)" },
      references: [{ label: "N° de facture", value: "2026-118 204" }],
      warnings: [],
      suggestedLetters: ["contestation-facture", "delai-paiement"],
      confidence: { overall: 0.97, dueDate: 0.97, amount: 0.98 },
    }),
  },
  {
    id: "prime-lamal",
    label: "L’annonce de votre prime d’assurance-maladie (en allemand)",
    text: (t) => `Krankenkasse Beispiel AG (fiktiv)
Ihre Prämie ${t.getUTCFullYear() + 1}

Grundversicherung KVG, Franchise CHF 300
Monatliche Prämie ab 1. Januar: CHF 438.20 (bisher CHF 414.10)

Versichertennummer: 756.1234.5678.97`,
    analysis: (t) => ({
      isAdministrativeDocument: true,
      documentType: "prime_assurance",
      title: `Nouvelle prime d’assurance-maladie ${t.getUTCFullYear() + 1}`,
      sender: "Krankenkasse Beispiel AG (fictive)",
      language: "de",
      summary: `Votre caisse-maladie annonce votre prime d’assurance de base pour ${t.getUTCFullYear() + 1} : CHF 438.20 par mois au lieu de CHF 414.10, soit CHF 289.20 de plus par an. Vous n’avez rien à faire si vous restez. Pour changer de caisse, votre résiliation doit lui parvenir au plus tard le dernier jour ouvrable de novembre.`,
      amount: 438.2,
      currency: "CHF",
      dueDate: null,
      urgency: "haute",
      actions: [
        { kind: "CHECK", title: "Comparer les primes sur priminfo.admin.ch", dueDate: null, amount: null },
        { kind: "CANCEL", title: "Envoyer la résiliation si vous changez de caisse", dueDate: `${t.getUTCMonth() === 11 ? t.getUTCFullYear() + 1 : t.getUTCFullYear()}-11-30`, amount: null },
      ],
      payment: null,
      references: [{ label: "N° d’assuré", value: "756.1234.5678.97" }],
      warnings: ["Sans résiliation reçue à temps, votre contrat continue l’an prochain au nouveau tarif."],
      suggestedLetters: ["resiliation-assurance"],
      confidence: { overall: 0.95, dueDate: null, amount: 0.97 },
    }),
  },
  {
    id: "commandement",
    label: "Un commandement de payer",
    text: () => `Office des poursuites (exemple)
Commandement de payer – Poursuite n° 26 104 552

Créancier : Telco Exemple SA
Créance : CHF 312.60 plus intérêts à 5 % et frais

Le débiteur est sommé de payer dans les 20 jours.
S’il entend contester la dette, il doit former opposition dans les 10 jours dès la notification.`,
    analysis: (t) => ({
      isAdministrativeDocument: true,
      documentType: "poursuite",
      title: "Commandement de payer – Telco Exemple SA",
      sender: "Office des poursuites (exemple)",
      language: "fr",
      summary: "Un créancier vous réclame CHF 312.60 par voie de poursuite. Si vous devez cette somme, payez-la dans les 20 jours. Si vous la contestez, vous devez former opposition dans les 10 jours, sinon la poursuite continue.",
      amount: 312.6,
      currency: "CHF",
      dueDate: iso(t, 10),
      urgency: "haute",
      actions: [
        { kind: "REPLY", title: "Former opposition si vous contestez la dette", dueDate: iso(t, 10), amount: null },
        { kind: "PAY", title: "Payer la créance si elle est due", dueDate: iso(t, 20), amount: 312.6 },
      ],
      payment: null,
      references: [{ label: "N° de poursuite", value: "26 104 552" }],
      warnings: [
        "Le délai d’opposition est de 10 jours seulement. Passé ce délai, la poursuite continue.",
        "Une poursuite reste visible dans l’extrait du registre des poursuites. En cas de doute, demandez conseil (permanence juridique, service social).",
      ],
      suggestedLetters: ["delai-paiement"],
      confidence: { overall: 0.96, dueDate: 0.9, amount: 0.97 },
    }),
  },
];

export function getSample(id: string): SampleLetter | null {
  return SAMPLES.find((s) => s.id === id) ?? null;
}
