import type { Locale } from "@/i18n/config";

/**
 * Guides pratiques (pages publiques, référencement). Contenu factuel, vérifié le 28.10.2026
 * sur les sources citées. À revérifier chaque année (primes LAMal, délais).
 */
export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: GuideSection[];
  sources: { label: string; url: string }[];
}

const CHECKED = "2026-10-28";
export const GUIDES_CHECKED_AT = CHECKED;

const fr: Guide[] = [
  {
    slug: "commandement-de-payer",
    title: "Commandement de payer : que faire dans les 10 jours",
    description: "Vous avez reçu un commandement de payer ? Ce qu’il signifie, le délai de 10 jours pour faire opposition et les erreurs à éviter.",
    intro:
      "Un commandement de payer est l’acte par lequel un créancier lance une poursuite contre vous, par l’intermédiaire de l’office des poursuites. Il ne prouve pas que la dette existe : n’importe qui peut en demander un. Mais il fait courir des délais courts.",
    sections: [
      {
        heading: "Les deux délais à connaître",
        list: [
          "10 jours pour faire opposition, à compter du lendemain de la notification (art. 74 LP).",
          "20 jours pour payer, si vous reconnaissez la dette (art. 69 LP).",
        ],
      },
      {
        heading: "Faire opposition",
        paragraphs: [
          "L’opposition est gratuite et n’a pas besoin d’être motivée. Vous pouvez la déclarer directement à la personne qui vous remet le commandement de payer, ou par écrit à l’office des poursuites dans les 10 jours. Gardez une preuve (recommandé ou attestation de l’office).",
          "L’opposition suspend la poursuite. Pour la continuer, le créancier doit obtenir la mainlevée de l’opposition devant un juge, ou agir en justice.",
        ],
      },
      {
        heading: "Si la dette est justifiée",
        paragraphs: [
          "Payez directement à l’office des poursuites ou contactez le créancier pour convenir d’un arrangement. Une poursuite reste en général visible dans l’extrait du registre des poursuites, même après paiement, sauf si le créancier la retire.",
        ],
      },
      {
        heading: "À éviter",
        list: [
          "Ignorer le courrier : sans opposition, le créancier peut demander la continuation de la poursuite (saisie, faillite selon les cas).",
          "Compter le délai à partir de la date imprimée : c’est la notification qui compte.",
          "Rester seul face à plusieurs poursuites : les services sociaux et les services de conseil en dettes de votre canton peuvent vous aider gratuitement.",
        ],
      },
    ],
    sources: [
      { label: "Loi fédérale sur la poursuite pour dettes et la faillite (LP), RS 281.1, art. 69, 74 et 78", url: "https://www.fedlex.admin.ch/eli/cc/11/529_488_529/fr" },
    ],
  },
  {
    slug: "resilier-caisse-maladie",
    title: "Changer de caisse-maladie : délais et lettre de résiliation",
    description: "Résilier l’assurance de base LAMal pour le 1er janvier : la date de réception qui compte, le cas du 30 juin et la lettre à envoyer.",
    intro:
      "Chaque automne, les caisses-maladie annoncent les primes de l’année suivante. Vous pouvez alors changer d’assureur pour l’assurance de base, qui offre les mêmes prestations légales partout.",
    sections: [
      {
        heading: "Pour le 1er janvier",
        paragraphs: [
          "Votre lettre de résiliation doit être reçue par la caisse au plus tard le 30 novembre. C’est la date de réception qui compte, pas celle de l’envoi : envoyez-la en recommandé, suffisamment tôt.",
        ],
      },
      {
        heading: "Pour le 30 juin",
        paragraphs: [
          "Avec une franchise ordinaire et un modèle d’assurance traditionnel, vous pouvez aussi résilier pour la fin juin, moyennant un préavis de trois mois : la caisse doit recevoir la lettre au plus tard le 31 mars.",
        ],
      },
      {
        heading: "Ce que doit contenir la lettre",
        list: [
          "Vos nom, adresse et numéro d’assuré.",
          "La mention « assurance obligatoire des soins (LAMal) » et la date de fin souhaitée.",
          "Votre signature (et celle de chaque adulte concerné).",
        ],
      },
      {
        heading: "Ne pas rester sans assurance",
        paragraphs: [
          "Votre ancienne caisse ne vous libère que lorsque le nouvel assureur lui a confirmé que vous êtes assuré sans interruption (art. 7 LAMal). Concluez la nouvelle assurance avant ou en même temps que la résiliation.",
          "Les assurances complémentaires (LCA) suivent les règles de leur contrat : délais souvent plus longs, et la nouvelle caisse peut refuser de vous assurer. Ne les résiliez qu’après avoir été accepté ailleurs.",
        ],
      },
    ],
    sources: [
      { label: "ch.ch – Assurance-maladie", url: "https://www.ch.ch/fr/assurance-maladie" },
      { label: "Loi fédérale sur l’assurance-maladie (LAMal), RS 832.10, art. 7", url: "https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/fr" },
    ],
  },
  {
    slug: "facture-qr",
    title: "Payer une facture QR sans erreur",
    description: "La facture QR a remplacé les bulletins de versement orange et rouges. Comment la payer, et à quoi servent l’IBAN et la référence.",
    intro:
      "Depuis le 1er octobre 2022, les bulletins de versement orange et rouges ne sont plus acceptés : les factures suisses comportent une section de paiement avec un code QR.",
    sections: [
      {
        heading: "Payer en quelques secondes",
        list: [
          "Dans l’application de votre banque, choisissez « scanner » et visez le code QR : le montant, l’IBAN et la référence se remplissent seuls.",
          "En e-banking sur ordinateur, vous pouvez saisir les informations à la main, ou utiliser un lecteur de code QR.",
          "Au guichet postal, la section de paiement est acceptée telle quelle.",
        ],
      },
      {
        heading: "IBAN et référence",
        paragraphs: [
          "La référence identifie votre paiement chez le créancier. Recopiez-la exactement : sans elle, le paiement peut ne pas être attribué et vous recevoir un rappel. Avec un QR-IBAN, la référence est obligatoire.",
        ],
      },
      {
        heading: "Points de vigilance",
        list: [
          "Vérifiez le nom du bénéficiaire avant de valider, surtout pour une facture inattendue.",
          "Un montant vide signifie que vous le choisissez (par exemple un don ou un acompte).",
          "Payez avant l’échéance indiquée pour éviter des frais de rappel.",
        ],
      },
    ],
    sources: [
      { label: "Confédération (PME) – Remplacement des bulletins de versement le 30.09.2022", url: "https://www.kmu.admin.ch/fr/remplacement-des-bulletins-de-versement-le-30092022-passer-maintenant-a-la-qr-facture-ou-a-ebill" },
      { label: "PostFinance – Fin des bulletins de versement (communiqué)", url: "https://www.postfinance.ch/fr/notre-profil/medias/newsroom/bulletins-de-versement-seront-retires-du-marche-2022.html" },
    ],
  },
];

const de: Guide[] = [
  {
    slug: "commandement-de-payer",
    title: "Zahlungsbefehl: Was in den 10 Tagen zu tun ist",
    description: "Sie haben einen Zahlungsbefehl erhalten? Was er bedeutet, die 10-tägige Frist für den Rechtsvorschlag und welche Fehler Sie vermeiden sollten.",
    intro:
      "Mit dem Zahlungsbefehl leitet ein Gläubiger über das Betreibungsamt eine Betreibung gegen Sie ein. Er beweist nicht, dass die Schuld besteht: Jede Person kann eine Betreibung verlangen. Aber er setzt kurze Fristen in Gang.",
    sections: [
      {
        heading: "Die zwei wichtigen Fristen",
        list: [
          "10 Tage für den Rechtsvorschlag, ab dem Tag nach der Zustellung (Art. 74 SchKG).",
          "20 Tage für die Zahlung, wenn Sie die Schuld anerkennen (Art. 69 SchKG).",
        ],
      },
      {
        heading: "Rechtsvorschlag erheben",
        paragraphs: [
          "Der Rechtsvorschlag ist kostenlos und muss nicht begründet werden. Sie können ihn direkt der Person erklären, die Ihnen den Zahlungsbefehl übergibt, oder innert 10 Tagen schriftlich beim Betreibungsamt. Bewahren Sie einen Nachweis auf (Einschreiben oder Bestätigung des Amtes).",
          "Der Rechtsvorschlag stoppt die Betreibung. Um weiterzumachen, muss der Gläubiger beim Gericht die Rechtsöffnung verlangen oder Klage erheben.",
        ],
      },
      {
        heading: "Wenn die Schuld berechtigt ist",
        paragraphs: [
          "Bezahlen Sie direkt beim Betreibungsamt oder vereinbaren Sie mit dem Gläubiger eine Lösung. Eine Betreibung bleibt in der Regel im Betreibungsregisterauszug sichtbar, auch nach der Zahlung, ausser der Gläubiger zieht sie zurück.",
        ],
      },
      {
        heading: "Zu vermeiden",
        list: [
          "Den Brief ignorieren: Ohne Rechtsvorschlag kann der Gläubiger die Fortsetzung der Betreibung verlangen (Pfändung oder Konkurs, je nach Fall).",
          "Die Frist ab dem aufgedruckten Datum rechnen: Massgebend ist die Zustellung.",
          "Mit mehreren Betreibungen allein bleiben: Sozialdienste und Schuldenberatungsstellen Ihres Kantons helfen kostenlos.",
        ],
      },
    ],
    sources: [
      { label: "Bundesgesetz über Schuldbetreibung und Konkurs (SchKG), SR 281.1, Art. 69, 74 und 78", url: "https://www.fedlex.admin.ch/eli/cc/11/529_488_529/de" },
    ],
  },
  {
    slug: "resilier-caisse-maladie",
    title: "Krankenkasse wechseln: Fristen und Kündigungsschreiben",
    description: "Die Grundversicherung (KVG) auf den 1. Januar kündigen: das massgebende Empfangsdatum, der Fall 30. Juni und das Kündigungsschreiben.",
    intro:
      "Jeden Herbst geben die Krankenkassen die Prämien für das folgende Jahr bekannt. Dann können Sie für die Grundversicherung, die überall dieselben gesetzlichen Leistungen bietet, den Versicherer wechseln.",
    sections: [
      {
        heading: "Auf den 1. Januar",
        paragraphs: [
          "Ihre Kündigung muss spätestens am 30. November bei der Krankenkasse eintreffen. Massgebend ist das Empfangsdatum, nicht das Versanddatum: Senden Sie sie rechtzeitig per Einschreiben.",
        ],
      },
      {
        heading: "Auf den 30. Juni",
        paragraphs: [
          "Mit ordentlicher Franchise und klassischem Versicherungsmodell können Sie auch auf Ende Juni kündigen, mit dreimonatiger Kündigungsfrist: Die Kasse muss den Brief spätestens am 31. März erhalten.",
        ],
      },
      {
        heading: "Was das Schreiben enthalten muss",
        list: [
          "Ihren Namen, Ihre Adresse und Ihre Versichertennummer.",
          "Den Hinweis «obligatorische Krankenpflegeversicherung (KVG)» und das gewünschte Enddatum.",
          "Ihre Unterschrift (und die jeder betroffenen erwachsenen Person).",
        ],
      },
      {
        heading: "Nie ohne Versicherung",
        paragraphs: [
          "Ihre bisherige Kasse entlässt Sie erst, wenn der neue Versicherer ihr mitgeteilt hat, dass Sie ohne Unterbruch versichert sind (Art. 7 KVG). Schliessen Sie die neue Versicherung vor oder gleichzeitig mit der Kündigung ab.",
          "Zusatzversicherungen (VVG) richten sich nach ihrem Vertrag: oft längere Fristen, und die neue Kasse kann die Aufnahme ablehnen. Kündigen Sie sie erst, wenn Sie anderswo aufgenommen wurden.",
        ],
      },
    ],
    sources: [
      { label: "ch.ch – Krankenkasse abschliessen, wechseln oder kündigen", url: "https://www.ch.ch/de/gesundheit/krankenkasse/krankenkasse-abschliessen--wechseln-oder-kundigen/" },
      { label: "Bundesgesetz über die Krankenversicherung (KVG), SR 832.10, Art. 7", url: "https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/de" },
    ],
  },
  {
    slug: "facture-qr",
    title: "QR-Rechnung fehlerfrei bezahlen",
    description: "Die QR-Rechnung hat die orangen und roten Einzahlungsscheine ersetzt. Wie Sie sie bezahlen und wozu IBAN und Referenz dienen.",
    intro:
      "Seit dem 1. Oktober 2022 werden die orangen und roten Einzahlungsscheine nicht mehr angenommen: Schweizer Rechnungen enthalten einen Zahlteil mit QR-Code.",
    sections: [
      {
        heading: "In Sekunden bezahlen",
        list: [
          "Wählen Sie in der App Ihrer Bank «Scannen» und richten Sie die Kamera auf den QR-Code: Betrag, IBAN und Referenz werden automatisch ausgefüllt.",
          "Im E-Banking am Computer können Sie die Angaben von Hand eingeben oder ein QR-Lesegerät verwenden.",
          "Am Postschalter wird der Zahlteil so angenommen.",
        ],
      },
      {
        heading: "IBAN und Referenz",
        paragraphs: [
          "Die Referenz ordnet Ihre Zahlung beim Rechnungssteller zu. Übernehmen Sie sie genau: Ohne sie kann die Zahlung nicht zugeordnet werden und Sie erhalten eine Mahnung. Bei einer QR-IBAN ist die Referenz obligatorisch.",
        ],
      },
      {
        heading: "Worauf Sie achten sollten",
        list: [
          "Prüfen Sie vor dem Bestätigen den Namen des Empfängers, besonders bei einer unerwarteten Rechnung.",
          "Ein leeres Betragsfeld bedeutet, dass Sie den Betrag selbst wählen (zum Beispiel eine Spende oder eine Anzahlung).",
          "Zahlen Sie vor dem angegebenen Fälligkeitsdatum, um Mahngebühren zu vermeiden.",
        ],
      },
    ],
    sources: [
      { label: "Bund (KMU-Portal) – Ablösung der Einzahlungsscheine am 30.09.2022", url: "https://www.kmu.admin.ch/fr/remplacement-des-bulletins-de-versement-le-30092022-passer-maintenant-a-la-qr-facture-ou-a-ebill" },
      { label: "PostFinance – Ende der Einzahlungsscheine (Medienmitteilung)", url: "https://www.postfinance.ch/fr/notre-profil/medias/newsroom/bulletins-de-versement-seront-retires-du-marche-2022.html" },
    ],
  },
];

const en: Guide[] = [
  {
    slug: "commandement-de-payer",
    title: "Payment order: what to do within 10 days",
    description: "Received a payment order (commandement de payer / Zahlungsbefehl)? What it means, the 10-day deadline to object and the mistakes to avoid.",
    intro:
      "A payment order is how a creditor starts debt collection against you, through the debt collection office. It does not prove that the debt exists: anyone can request one. But it starts short deadlines.",
    sections: [
      {
        heading: "The two deadlines to know",
        list: [
          "10 days to file an objection (opposition / Rechtsvorschlag), counted from the day after it is served (art. 74 DEBA).",
          "20 days to pay, if you accept the debt (art. 69 DEBA).",
        ],
      },
      {
        heading: "Filing an objection",
        paragraphs: [
          "The objection is free and you do not need to give a reason. You can declare it directly to the person who hands you the payment order, or in writing to the debt collection office within 10 days. Keep proof (registered mail or confirmation from the office).",
          "The objection stops the debt collection. To continue, the creditor must ask a court to set it aside (mainlevée / Rechtsöffnung) or take legal action.",
        ],
      },
      {
        heading: "If the debt is justified",
        paragraphs: [
          "Pay the debt collection office directly or contact the creditor to agree on an arrangement. Debt collection usually stays visible on your debt collection register extract, even after payment, unless the creditor withdraws it.",
        ],
      },
      {
        heading: "Avoid",
        list: [
          "Ignoring the letter: without an objection, the creditor can ask for the debt collection to continue (seizure or bankruptcy, depending on the case).",
          "Counting the deadline from the printed date: what counts is when it was served.",
          "Facing several debt collections alone: social services and debt advice services in your canton can help for free.",
        ],
      },
    ],
    sources: [
      { label: "Federal Act on Debt Enforcement and Bankruptcy (DEBA), SR 281.1, art. 69, 74 and 78", url: "https://www.fedlex.admin.ch/eli/cc/11/529_488_529/en" },
    ],
  },
  {
    slug: "resilier-caisse-maladie",
    title: "Switching health insurer: deadlines and cancellation letter",
    description: "Cancelling basic health insurance (LAMal / KVG) for 1 January: the date of receipt that counts, the 30 June option and the letter to send.",
    intro:
      "Every autumn, health insurers announce next year’s premiums. You can then switch insurer for basic health insurance, which provides the same legal benefits everywhere.",
    sections: [
      {
        heading: "For 1 January",
        paragraphs: [
          "Your cancellation letter must be received by the insurer by 30 November at the latest. The date of receipt counts, not the date you send it: send it by registered mail, early enough.",
        ],
      },
      {
        heading: "For 30 June",
        paragraphs: [
          "With the ordinary deductible and a traditional insurance model, you can also cancel for the end of June, with three months’ notice: the insurer must receive the letter by 31 March.",
        ],
      },
      {
        heading: "What the letter must contain",
        list: [
          "Your name, address and insured person number.",
          "The words “compulsory health insurance (LAMal / KVG)” and the end date you want.",
          "Your signature (and that of every adult concerned).",
        ],
      },
      {
        heading: "Never be left uninsured",
        paragraphs: [
          "Your old insurer only releases you once the new insurer has confirmed that you are insured without interruption (art. 7 KVG). Take out the new insurance before or at the same time as you cancel.",
          "Supplementary insurance (LCA / VVG) follows its own contract: notice periods are often longer, and a new insurer can refuse you. Only cancel it once you have been accepted elsewhere.",
        ],
      },
    ],
    sources: [
      { label: "ch.ch – Cancelling and changing health insurer", url: "https://www.ch.ch/en/family-and-partnership/maternity-and-paternity/pregnancy-and-birth/changing-and-cancelling-health-insurance/" },
      { label: "Federal Act on Health Insurance (HIA / KVG), SR 832.10, art. 7", url: "https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/en" },
    ],
  },
  {
    slug: "facture-qr",
    title: "Paying a QR bill without mistakes",
    description: "The QR bill replaced the orange and red payment slips. How to pay it, and what the IBAN and the reference are for.",
    intro:
      "Since 1 October 2022, the orange and red payment slips are no longer accepted: Swiss bills have a payment part with a QR code.",
    sections: [
      {
        heading: "Pay in seconds",
        list: [
          "In your bank’s app, choose “scan” and point it at the QR code: the amount, IBAN and reference fill in by themselves.",
          "In e-banking on a computer, you can type the details by hand or use a QR code reader.",
          "At the post office counter, the payment part is accepted as it is.",
        ],
      },
      {
        heading: "IBAN and reference",
        paragraphs: [
          "The reference links your payment to the bill at the creditor’s. Copy it exactly: without it, the payment may not be matched and you may get a reminder. With a QR-IBAN, the reference is mandatory.",
        ],
      },
      {
        heading: "Watch out for",
        list: [
          "Check the payee’s name before confirming, especially for an unexpected bill.",
          "An empty amount means you choose it (for example a donation or a down payment).",
          "Pay before the due date shown to avoid reminder fees.",
        ],
      },
    ],
    sources: [
      { label: "Swiss Confederation (SME portal) – Replacement of payment slips on 30.09.2022 (in French)", url: "https://www.kmu.admin.ch/fr/remplacement-des-bulletins-de-versement-le-30092022-passer-maintenant-a-la-qr-facture-ou-a-ebill" },
      { label: "PostFinance – End of payment slips, press release (in French)", url: "https://www.postfinance.ch/fr/notre-profil/medias/newsroom/bulletins-de-versement-seront-retires-du-marche-2022.html" },
    ],
  },
];

const GUIDES: Record<Locale, Guide[]> = { fr, de, en };

export function listGuides(locale: Locale): Guide[] {
  return GUIDES[locale];
}

export function getGuide(slug: string, locale: Locale): Guide | null {
  return GUIDES[locale].find((g) => g.slug === slug) ?? null;
}

export const GUIDE_SLUGS = fr.map((g) => g.slug);
