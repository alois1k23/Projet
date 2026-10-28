import type { LETTER_TEMPLATE_IDS } from "@/lib/ai/schema";

export type TemplateId = (typeof LETTER_TEMPLATE_IDS)[number];
export type LetterLanguage = "fr" | "de";

/** Champ d’un modèle. Libellés et aides sont dans les dictionnaires (`templates.<id>.fields.<key>`). */
export type Field =
  | { key: string; type: "text" | "date" | "textarea"; required: boolean }
  | { key: string; type: "select"; required: boolean; options: string[] };

export interface Sender {
  name: string;
  addressLine?: string | null;
  postalCode?: string | null;
  city?: string | null;
}

export interface LetterDraft {
  recipient: string;
  subject: string;
  body: string;
}

export interface LetterTemplate {
  id: TemplateId;
  fields: Field[];
  build(values: Record<string, string>, lang: LetterLanguage): Omit<LetterDraft, "recipient">;
}

const recipientFields: Field[] = [
  { key: "recipientName", type: "text", required: true },
  { key: "recipientAddress", type: "textarea", required: true },
];

const fmt = (iso: string | undefined, lang: LetterLanguage) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "de" ? "de-CH" : "fr-CH", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
};

const v = (values: Record<string, string>, key: string) => (values[key] ?? "").trim();

export const TEMPLATES: Record<TemplateId, LetterTemplate> = {
  "resiliation-assurance": {
    id: "resiliation-assurance",
    fields: [
      ...recipientFields,
      {
        key: "insuranceType",
        type: "select",
        required: true,
        options: ["base", "complementaire", "autre"],
      },
      { key: "policyNumber", type: "text", required: true },
      { key: "endDate", type: "date", required: true },
    ],
    build(values, lang) {
      const type = v(values, "insuranceType");
      const number = v(values, "policyNumber");
      const end = fmt(v(values, "endDate"), lang);
      if (lang === "de") {
        const label = type === "base" ? "obligatorische Krankenpflegeversicherung (KVG)" : type === "complementaire" ? "Zusatzversicherung (VVG)" : "Versicherung";
        return {
          subject: `Kündigung meiner ${label} – Nr. ${number}`,
          body: [
            "Sehr geehrte Damen und Herren",
            `Hiermit kündige ich meine ${label} mit der Nummer ${number} per ${end}.`,
            type === "base" ? "Die Kündigung der Grundversicherung wird wirksam, sobald mein neuer Versicherer Ihnen meine Aufnahme bestätigt hat." : "",
            "Bitte bestätigen Sie mir den Eingang dieser Kündigung schriftlich.",
            "Freundliche Grüsse",
          ].filter(Boolean).join("\n\n"),
        };
      }
      const label = type === "base" ? "assurance obligatoire des soins (LAMal)" : type === "complementaire" ? "assurance complémentaire (LCA)" : "assurance";
      return {
        subject: `Résiliation de mon ${label} – n° ${number}`,
        body: [
          "Madame, Monsieur,",
          `Par la présente, je résilie mon ${label} n° ${number} pour le ${end}.`,
          type === "base" ? "La résiliation de l’assurance de base prendra effet dès que mon nouvel assureur vous aura confirmé mon affiliation." : "",
          "Je vous remercie de me confirmer par écrit la bonne réception de cette résiliation.",
          "Je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.",
        ].filter(Boolean).join("\n\n"),
      };
    },
  },

  "resiliation-contrat": {
    id: "resiliation-contrat",
    fields: [
      ...recipientFields,
      { key: "contractNumber", type: "text", required: true },
      { key: "endDate", type: "date", required: false },
    ],
    build(values, lang) {
      const number = v(values, "contractNumber");
      const end = v(values, "endDate");
      if (lang === "de") {
        return {
          subject: `Kündigung meines Vertrags – Nr. ${number}`,
          body: [
            "Sehr geehrte Damen und Herren",
            `Hiermit kündige ich meinen Vertrag mit der Nummer ${number} ${end ? `per ${fmt(end, lang)}` : "auf den nächstmöglichen Termin"}.`,
            "Bitte bestätigen Sie mir die Kündigung und das Vertragsende schriftlich.",
            "Freundliche Grüsse",
          ].join("\n\n"),
        };
      }
      return {
        subject: `Résiliation de mon contrat – n° ${number}`,
        body: [
          "Madame, Monsieur,",
          `Par la présente, je résilie mon contrat n° ${number} ${end ? `pour le ${fmt(end, lang)}` : "pour la prochaine échéance possible"}.`,
          "Je vous remercie de me confirmer par écrit la résiliation et la date de fin du contrat.",
          "Je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.",
        ].join("\n\n"),
      };
    },
  },

  "contestation-facture": {
    id: "contestation-facture",
    fields: [
      ...recipientFields,
      { key: "invoiceNumber", type: "text", required: true },
      { key: "invoiceDate", type: "date", required: false },
      { key: "amount", type: "text", required: false },
      { key: "reason", type: "textarea", required: true },
    ],
    build(values, lang) {
      const number = v(values, "invoiceNumber");
      const date = v(values, "invoiceDate");
      const amount = v(values, "amount");
      const reason = v(values, "reason");
      if (lang === "de") {
        return {
          subject: `Beanstandung der Rechnung Nr. ${number}`,
          body: [
            "Sehr geehrte Damen und Herren",
            `Ich beanstande Ihre Rechnung Nr. ${number}${date ? ` vom ${fmt(date, lang)}` : ""}${amount ? ` über CHF ${amount}` : ""}.`,
            `Begründung: ${reason}`,
            "Ich bitte Sie, die Rechnung zu überprüfen und mir eine korrigierte Rechnung zuzustellen. Bis zur Klärung bezahle ich den beanstandeten Betrag nicht.",
            "Freundliche Grüsse",
          ].join("\n\n"),
        };
      }
      return {
        subject: `Contestation de la facture n° ${number}`,
        body: [
          "Madame, Monsieur,",
          `Je conteste votre facture n° ${number}${date ? ` du ${fmt(date, lang)}` : ""}${amount ? ` d’un montant de CHF ${amount}` : ""}.`,
          `Motif : ${reason}`,
          "Je vous remercie de vérifier cette facture et de m’adresser une facture corrigée. Dans l’attente de votre réponse, je suspends le paiement du montant contesté.",
          "Je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.",
        ].join("\n\n"),
      };
    },
  },

  "delai-paiement": {
    id: "delai-paiement",
    fields: [
      ...recipientFields,
      { key: "reference", type: "text", required: true },
      { key: "amount", type: "text", required: true },
      { key: "proposal", type: "textarea", required: true },
    ],
    build(values, lang) {
      const ref = v(values, "reference");
      const amount = v(values, "amount");
      const proposal = v(values, "proposal");
      if (lang === "de") {
        return {
          subject: `Gesuch um Zahlungsaufschub – ${ref}`,
          body: [
            "Sehr geehrte Damen und Herren",
            `Betreffend Ihre Rechnung ${ref} über CHF ${amount}: Ich kann den Betrag derzeit nicht vollständig auf einmal begleichen.`,
            `Ich schlage Ihnen folgende Lösung vor: ${proposal}`,
            "Ich danke Ihnen für Ihr Verständnis und bitte um eine kurze schriftliche Bestätigung.",
            "Freundliche Grüsse",
          ].join("\n\n"),
        };
      }
      return {
        subject: `Demande de délai de paiement – ${ref}`,
        body: [
          "Madame, Monsieur,",
          `Concernant votre facture ${ref} d’un montant de CHF ${amount}, je ne suis pas en mesure de la régler en une seule fois pour le moment.`,
          `Je vous propose la solution suivante : ${proposal}`,
          "Je vous remercie de votre compréhension et vous saurais gré de me confirmer votre accord par écrit.",
          "Je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.",
        ].join("\n\n"),
      };
    },
  },

  "reclamation-taxation": {
    id: "reclamation-taxation",
    fields: [
      ...recipientFields,
      { key: "taxpayerNumber", type: "text", required: true },
      { key: "taxYear", type: "text", required: true },
      { key: "decisionDate", type: "date", required: true },
      { key: "reason", type: "textarea", required: true },
    ],
    build(values, lang) {
      const number = v(values, "taxpayerNumber");
      const year = v(values, "taxYear");
      const date = fmt(v(values, "decisionDate"), lang);
      const reason = v(values, "reason");
      if (lang === "de") {
        return {
          subject: `Einsprache gegen die Veranlagungsverfügung ${year} – Nr. ${number}`,
          body: [
            "Sehr geehrte Damen und Herren",
            `Hiermit erhebe ich Einsprache gegen die Veranlagungsverfügung für das Steuerjahr ${year} vom ${date}.`,
            `Begründung: ${reason}`,
            "Ich beantrage, die Veranlagung entsprechend zu korrigieren. Für Rückfragen und weitere Belege stehe ich gerne zur Verfügung.",
            "Freundliche Grüsse",
          ].join("\n\n"),
        };
      }
      return {
        subject: `Réclamation contre la décision de taxation ${year} – n° ${number}`,
        body: [
          "Madame, Monsieur,",
          `Par la présente, je forme réclamation contre la décision de taxation de l’année fiscale ${year} datée du ${date}.`,
          `Motifs : ${reason}`,
          "Je vous prie de bien vouloir corriger la taxation en conséquence. Je reste à votre disposition pour tout renseignement ou justificatif complémentaire.",
          "Je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.",
        ].join("\n\n"),
      };
    },
  },
};

export function getTemplate(id: string): LetterTemplate | null {
  return Object.hasOwn(TEMPLATES, id) ? TEMPLATES[id as TemplateId] : null;
}

export type FieldError = "required" | "tooLong" | "invalidDate" | "invalidChoice";

/** Vérifie les champs. Retourne, par champ, une clé de traduction (`validation.*`). */
export function validateFields(template: LetterTemplate, values: Record<string, string>): Record<string, FieldError> {
  const errors: Record<string, FieldError> = {};
  for (const field of template.fields) {
    const value = (values[field.key] ?? "").trim();
    if (field.required && !value) errors[field.key] = "required";
    else if (value.length > 2000) errors[field.key] = "tooLong";
    else if (field.type === "date" && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) errors[field.key] = "invalidDate";
    else if (field.type === "select" && value && !field.options.includes(value)) errors[field.key] = "invalidChoice";
  }
  return errors;
}

export function buildLetter(template: LetterTemplate, values: Record<string, string>, lang: LetterLanguage): LetterDraft {
  const recipient = [v(values, "recipientName"), v(values, "recipientAddress")].filter(Boolean).join("\n");
  return { recipient, ...template.build(values, lang) };
}

export function senderBlock(sender: Sender): string {
  return [sender.name, sender.addressLine, [sender.postalCode, sender.city].filter(Boolean).join(" ")].filter((l) => l && l.trim()).join("\n");
}

export function placeAndDate(sender: Sender, date: Date, lang: LetterLanguage): string {
  const formatted = new Intl.DateTimeFormat(lang === "de" ? "de-CH" : "fr-CH", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Zurich" }).format(date);
  if (!sender.city) return formatted;
  return lang === "de" ? `${sender.city}, ${formatted}` : `${sender.city}, le ${formatted}`;
}
