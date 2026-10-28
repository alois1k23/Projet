import type { AnalysisOutput } from "@/lib/ai/schema";

type Locale = "fr" | "de";

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
/** Fin novembre de l’année en cours, ou de l’année suivante en décembre. */
const endOfNovember = (t: Date) => `${t.getUTCMonth() === 11 ? t.getUTCFullYear() + 1 : t.getUTCFullYear()}-11-30`;

/** Courriers fictifs pour découvrir l’application sans téléverser de document personnel. */
export const SAMPLES: SampleLetter[] = [
  {
    id: "facture-qr",
    label: { fr: "Une facture avec QR-code", de: "Eine Rechnung mit QR-Code" },
    text: (t) => `Services Industriels du Lac (exemple)
Facture n° 2026-118 204 · Électricité, période juillet–septembre

Montant à payer : CHF 186.45
Payable jusqu’au ${ch(t, 12)}

Compte / Payable à : CH44 3199 9123 0008 8901 2
Référence : 21 00000 00003 13947 14300 09017`,
    analysis: (t, locale = "fr") => {
      const fr = locale === "fr";
      return {
        isAdministrativeDocument: true,
        documentType: "facture",
        title: fr ? "Facture d’électricité juillet–septembre" : "Stromrechnung Juli–September",
        sender: "Services Industriels du Lac (exemple)",
        language: "fr",
        summary: fr
          ? "Votre fournisseur vous facture l’électricité consommée de juillet à septembre. C’est une facture ordinaire à payer avant l’échéance pour éviter des frais de rappel."
          : "Ihr Stromversorger stellt Ihnen den Verbrauch von Juli bis September in Rechnung. Es ist eine gewöhnliche Rechnung, die Sie vor Fristablauf bezahlen sollten, um Mahngebühren zu vermeiden.",
        amount: 186.45,
        currency: "CHF",
        dueDate: iso(t, 12),
        urgency: "normale",
        actions: [{ kind: "PAY", title: fr ? "Payer la facture d’électricité" : "Stromrechnung bezahlen", dueDate: iso(t, 12), amount: 186.45 }],
        payment: { iban: "CH44 3199 9123 0008 8901 2", reference: "21 00000 00003 13947 14300 09017", creditor: "Services Industriels du Lac (exemple)" },
        references: [{ label: fr ? "N° de facture" : "Rechnungsnummer", value: "2026-118 204" }],
        warnings: [],
        suggestedLetters: ["contestation-facture", "delai-paiement"],
        confidence: { overall: 0.97, dueDate: 0.97, amount: 0.98 },
      };
    },
  },
  {
    id: "prime-lamal",
    label: { fr: "L’annonce de votre prime d’assurance-maladie (en allemand)", de: "Die Prämienmitteilung Ihrer Krankenkasse" },
    text: (t) => `Krankenkasse Beispiel AG (fiktiv)
Ihre Prämie ${t.getUTCFullYear() + 1}

Grundversicherung KVG, Franchise CHF 300
Monatliche Prämie ab 1. Januar: CHF 438.20 (bisher CHF 414.10)

Versichertennummer: 756.1234.5678.97`,
    analysis: (t, locale = "fr") => {
      const fr = locale === "fr";
      const year = t.getUTCFullYear() + 1;
      return {
        isAdministrativeDocument: true,
        documentType: "prime_assurance",
        title: fr ? `Nouvelle prime d’assurance-maladie ${year}` : `Neue Krankenkassenprämie ${year}`,
        sender: fr ? "Krankenkasse Beispiel AG (fictive)" : "Krankenkasse Beispiel AG (fiktiv)",
        language: "de",
        summary: fr
          ? `Votre caisse-maladie annonce votre prime d’assurance de base pour ${year} : CHF 438.20 par mois au lieu de CHF 414.10, soit CHF 289.20 de plus par an. Vous n’avez rien à faire si vous restez. Pour changer de caisse, votre résiliation doit lui parvenir au plus tard le dernier jour ouvrable de novembre.`
          : `Ihre Krankenkasse teilt Ihnen die Prämie der Grundversicherung für ${year} mit: CHF 438.20 pro Monat statt CHF 414.10, also CHF 289.20 mehr pro Jahr. Wenn Sie bleiben, müssen Sie nichts tun. Für einen Wechsel muss Ihre Kündigung spätestens am letzten Werktag im November bei der Kasse eintreffen.`,
        amount: 438.2,
        currency: "CHF",
        dueDate: null,
        urgency: "haute",
        actions: [
          { kind: "CHECK", title: fr ? "Comparer les primes sur priminfo.admin.ch" : "Prämien auf priminfo.admin.ch vergleichen", dueDate: null, amount: null },
          { kind: "CANCEL", title: fr ? "Envoyer la résiliation si vous changez de caisse" : "Kündigung senden, falls Sie die Kasse wechseln", dueDate: endOfNovember(t), amount: null },
        ],
        payment: null,
        references: [{ label: fr ? "N° d’assuré" : "Versichertennummer", value: "756.1234.5678.97" }],
        warnings: [fr ? "Sans résiliation reçue à temps, votre contrat continue l’an prochain au nouveau tarif." : "Ohne rechtzeitig eingetroffene Kündigung läuft Ihr Vertrag nächstes Jahr zum neuen Tarif weiter."],
        suggestedLetters: ["resiliation-assurance"],
        confidence: { overall: 0.95, dueDate: null, amount: 0.97 },
      };
    },
  },
  {
    id: "commandement",
    label: { fr: "Un commandement de payer", de: "Ein Zahlungsbefehl" },
    text: () => `Office des poursuites (exemple)
Commandement de payer – Poursuite n° 26 104 552

Créancier : Telco Exemple SA
Créance : CHF 312.60 plus intérêts à 5 % et frais

Le débiteur est sommé de payer dans les 20 jours.
S’il entend contester la dette, il doit former opposition dans les 10 jours dès la notification.`,
    analysis: (t, locale = "fr") => {
      const fr = locale === "fr";
      return {
        isAdministrativeDocument: true,
        documentType: "poursuite",
        title: fr ? "Commandement de payer – Telco Exemple SA" : "Zahlungsbefehl – Telco Exemple SA",
        sender: fr ? "Office des poursuites (exemple)" : "Betreibungsamt (Beispiel)",
        language: "fr",
        summary: fr
          ? "Un créancier vous réclame CHF 312.60 par voie de poursuite. Si vous devez cette somme, payez-la dans les 20 jours. Si vous la contestez, vous devez former opposition dans les 10 jours, sinon la poursuite continue."
          : "Ein Gläubiger verlangt von Ihnen CHF 312.60 auf dem Betreibungsweg. Wenn Sie den Betrag schulden, bezahlen Sie ihn innert 20 Tagen. Wenn Sie ihn bestreiten, müssen Sie innert 10 Tagen Rechtsvorschlag erheben, sonst geht die Betreibung weiter.",
        amount: 312.6,
        currency: "CHF",
        dueDate: iso(t, 10),
        urgency: "haute",
        actions: [
          { kind: "REPLY", title: fr ? "Former opposition si vous contestez la dette" : "Rechtsvorschlag erheben, falls Sie die Schuld bestreiten", dueDate: iso(t, 10), amount: null },
          { kind: "PAY", title: fr ? "Payer la créance si elle est due" : "Forderung bezahlen, falls sie geschuldet ist", dueDate: iso(t, 20), amount: 312.6 },
        ],
        payment: null,
        references: [{ label: fr ? "N° de poursuite" : "Betreibungsnummer", value: "26 104 552" }],
        warnings: fr
          ? [
              "Le délai d’opposition est de 10 jours seulement. Passé ce délai, la poursuite continue.",
              "Une poursuite reste visible dans l’extrait du registre des poursuites. En cas de doute, demandez conseil (permanence juridique, service social).",
            ]
          : [
              "Die Frist für den Rechtsvorschlag beträgt nur 10 Tage. Danach geht die Betreibung weiter.",
              "Eine Betreibung bleibt im Betreibungsregisterauszug sichtbar. Lassen Sie sich im Zweifel beraten (Rechtsberatung, Sozialdienst).",
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
