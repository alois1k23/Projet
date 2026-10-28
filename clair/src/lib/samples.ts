import type { AnalysisOutput } from "@/lib/ai/schema";

import type { Locale } from "@/i18n/config";

export interface SampleLetter {
  id: string;
  label: Record<Locale, string>;
  /** Texte du courrier fictif, affiché à la place de l’original (il ne dépend pas de la langue de l’utilisateur). */
  text: (today: Date) => string;
  analysis: (today: Date, locale?: Locale) => AnalysisOutput;
}

const iso = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000).toISOString().slice(0, 10);
const ch = (d: Date, days: number) => {
  const [y, m, day] = iso(d, days).split("-");
  return `${day}.${m}.${y}`;
};
/** Choisit le texte dans la langue demandée. */
const pick = (locale: Locale) => (fr: string, de: string, en: string) => ({ fr, de, en })[locale];
/** Fin novembre de l’année en cours, ou de l’année suivante en décembre. */
const endOfNovember = (t: Date) => `${t.getUTCMonth() === 11 ? t.getUTCFullYear() + 1 : t.getUTCFullYear()}-11-30`;

/** Courriers fictifs pour découvrir l’application sans téléverser de document personnel. */
export const SAMPLES: SampleLetter[] = [
  {
    id: "facture-qr",
    label: { fr: "Une facture avec QR-code", de: "Eine Rechnung mit QR-Code", en: "A bill with a QR code" },
    text: (t) => `Services Industriels du Lac (exemple)
Facture n° 2026-118 204 · Électricité, période juillet–septembre

Montant à payer : CHF 186.45
Payable jusqu’au ${ch(t, 12)}

Compte / Payable à : CH44 3199 9123 0008 8901 2
Référence : 21 00000 00003 13947 14300 09017`,
    analysis: (t, locale = "fr") => {
      const tr = pick(locale);
      return {
        isAdministrativeDocument: true,
        documentType: "facture",
        title: tr("Facture d’électricité juillet–septembre", "Stromrechnung Juli–September", "Electricity bill July–September"),
        sender: "Services Industriels du Lac (exemple)",
        language: "fr",
        summary: tr(
          "Votre fournisseur vous facture l’électricité consommée de juillet à septembre. C’est une facture ordinaire à payer avant l’échéance pour éviter des frais de rappel.",
          "Ihr Stromversorger stellt Ihnen den Verbrauch von Juli bis September in Rechnung. Es ist eine gewöhnliche Rechnung, die Sie vor Fristablauf bezahlen sollten, um Mahngebühren zu vermeiden.",
          "Your utility company is billing you for the electricity used from July to September. It is an ordinary bill to pay before the due date to avoid reminder fees.",
        ),
        amount: 186.45,
        currency: "CHF",
        dueDate: iso(t, 12),
        urgency: "normale",
        actions: [{ kind: "PAY", title: tr("Payer la facture d’électricité", "Stromrechnung bezahlen", "Pay the electricity bill"), dueDate: iso(t, 12), amount: 186.45 }],
        payment: { iban: "CH44 3199 9123 0008 8901 2", reference: "21 00000 00003 13947 14300 09017", creditor: "Services Industriels du Lac (exemple)" },
        references: [{ label: tr("N° de facture", "Rechnungsnummer", "Invoice number"), value: "2026-118 204" }],
        warnings: [],
        suggestedLetters: ["contestation-facture", "delai-paiement"],
        confidence: { overall: 0.97, dueDate: 0.97, amount: 0.98 },
      };
    },
  },
  {
    id: "prime-lamal",
    label: { fr: "L’annonce de votre prime d’assurance-maladie (en allemand)", de: "Die Prämienmitteilung Ihrer Krankenkasse", en: "Your health insurance premium notice (in German)" },
    text: (t) => `Krankenkasse Beispiel AG (fiktiv)
Ihre Prämie ${t.getUTCFullYear() + 1}

Grundversicherung KVG, Franchise CHF 300
Monatliche Prämie ab 1. Januar: CHF 438.20 (bisher CHF 414.10)

Versichertennummer: 756.1234.5678.97`,
    analysis: (t, locale = "fr") => {
      const tr = pick(locale);
      const year = t.getUTCFullYear() + 1;
      return {
        isAdministrativeDocument: true,
        documentType: "prime_assurance",
        title: tr(`Nouvelle prime d’assurance-maladie ${year}`, `Neue Krankenkassenprämie ${year}`, `New health insurance premium ${year}`),
        sender: tr("Krankenkasse Beispiel AG (fictive)", "Krankenkasse Beispiel AG (fiktiv)", "Krankenkasse Beispiel AG (fictitious)"),
        language: "de",
        summary: tr(
          `Votre caisse-maladie annonce votre prime d’assurance de base pour ${year} : CHF 438.20 par mois au lieu de CHF 414.10, soit CHF 289.20 de plus par an. Vous n’avez rien à faire si vous restez. Pour changer de caisse, votre résiliation doit lui parvenir au plus tard le dernier jour ouvrable de novembre.`,
          `Ihre Krankenkasse teilt Ihnen die Prämie der Grundversicherung für ${year} mit: CHF 438.20 pro Monat statt CHF 414.10, also CHF 289.20 mehr pro Jahr. Wenn Sie bleiben, müssen Sie nichts tun. Für einen Wechsel muss Ihre Kündigung spätestens am letzten Werktag im November bei der Kasse eintreffen.`,
          `Your health insurer announces your basic insurance premium for ${year}: CHF 438.20 per month instead of CHF 414.10, which is CHF 289.20 more per year. If you stay, you do not need to do anything. To switch insurer, your cancellation must reach it by the last working day of November.`,
        ),
        amount: 438.2,
        currency: "CHF",
        dueDate: null,
        urgency: "haute",
        actions: [
          { kind: "CHECK", title: tr("Comparer les primes sur priminfo.admin.ch", "Prämien auf priminfo.admin.ch vergleichen", "Compare premiums on priminfo.admin.ch"), dueDate: null, amount: null },
          { kind: "CANCEL", title: tr("Envoyer la résiliation si vous changez de caisse", "Kündigung senden, falls Sie die Kasse wechseln", "Send the cancellation if you switch insurer"), dueDate: endOfNovember(t), amount: null },
        ],
        payment: null,
        references: [{ label: tr("N° d’assuré", "Versichertennummer", "Insured person number"), value: "756.1234.5678.97" }],
        warnings: [tr("Sans résiliation reçue à temps, votre contrat continue l’an prochain au nouveau tarif.", "Ohne rechtzeitig eingetroffene Kündigung läuft Ihr Vertrag nächstes Jahr zum neuen Tarif weiter.", "If your cancellation does not arrive in time, your contract continues next year at the new rate.")],
        suggestedLetters: ["resiliation-assurance"],
        confidence: { overall: 0.95, dueDate: null, amount: 0.97 },
      };
    },
  },
  {
    id: "commandement",
    label: { fr: "Un commandement de payer", de: "Ein Zahlungsbefehl", en: "A payment order (debt collection)" },
    text: () => `Office des poursuites (exemple)
Commandement de payer – Poursuite n° 26 104 552

Créancier : Telco Exemple SA
Créance : CHF 312.60 plus intérêts à 5 % et frais

Le débiteur est sommé de payer dans les 20 jours.
S’il entend contester la dette, il doit former opposition dans les 10 jours dès la notification.`,
    analysis: (t, locale = "fr") => {
      const tr = pick(locale);
      return {
        isAdministrativeDocument: true,
        documentType: "poursuite",
        title: tr("Commandement de payer – Telco Exemple SA", "Zahlungsbefehl – Telco Exemple SA", "Payment order – Telco Exemple SA"),
        sender: tr("Office des poursuites (exemple)", "Betreibungsamt (Beispiel)", "Debt collection office (sample)"),
        language: "fr",
        summary: tr(
          "Un créancier vous réclame CHF 312.60 par voie de poursuite. Si vous devez cette somme, payez-la dans les 20 jours. Si vous la contestez, vous devez former opposition dans les 10 jours, sinon la poursuite continue.",
          "Ein Gläubiger verlangt von Ihnen CHF 312.60 auf dem Betreibungsweg. Wenn Sie den Betrag schulden, bezahlen Sie ihn innert 20 Tagen. Wenn Sie ihn bestreiten, müssen Sie innert 10 Tagen Rechtsvorschlag erheben, sonst geht die Betreibung weiter.",
          "A creditor is claiming CHF 312.60 from you through debt collection. If you owe this amount, pay it within 20 days. If you dispute it, you must file an objection (opposition / Rechtsvorschlag) within 10 days, otherwise the debt collection continues.",
        ),
        amount: 312.6,
        currency: "CHF",
        dueDate: iso(t, 10),
        urgency: "haute",
        actions: [
          { kind: "REPLY", title: tr("Former opposition si vous contestez la dette", "Rechtsvorschlag erheben, falls Sie die Schuld bestreiten", "File an objection if you dispute the debt"), dueDate: iso(t, 10), amount: null },
          { kind: "PAY", title: tr("Payer la créance si elle est due", "Forderung bezahlen, falls sie geschuldet ist", "Pay the claim if you owe it"), dueDate: iso(t, 20), amount: 312.6 },
        ],
        payment: null,
        references: [{ label: tr("N° de poursuite", "Betreibungsnummer", "Debt collection number"), value: "26 104 552" }],
        warnings: [
          tr(
            "Le délai d’opposition est de 10 jours seulement. Passé ce délai, la poursuite continue.",
            "Die Frist für den Rechtsvorschlag beträgt nur 10 Tage. Danach geht die Betreibung weiter.",
            "You only have 10 days to object. After that, the debt collection continues.",
          ),
          tr(
            "Une poursuite reste visible dans l’extrait du registre des poursuites. En cas de doute, demandez conseil (permanence juridique, service social).",
            "Eine Betreibung bleibt im Betreibungsregisterauszug sichtbar. Lassen Sie sich im Zweifel beraten (Rechtsberatung, Sozialdienst).",
            "Debt collection stays visible on your debt collection register extract. If in doubt, get advice (legal advice service, social services).",
          ),
        ],
        suggestedLetters: ["delai-paiement"],
        confidence: { overall: 0.96, dueDate: 0.9, amount: 0.97 },
      };
    },
  },
];

export function getSample(id: string): SampleLetter | null {
  return SAMPLES.find((s) => s.id === id) ?? null;
}
