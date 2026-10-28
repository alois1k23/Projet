import type { Metadata } from "next";
import { LegalPage } from "../legal-layout";
import { getLocale } from "@/i18n/server";

const TITLE = { fr: "Conditions d’utilisation", de: "Nutzungsbedingungen", en: "Terms of use" };

export async function generateMetadata(): Promise<Metadata> {
  return { title: TITLE[await getLocale()], alternates: { canonical: "/conditions" } };
}

export default async function TermsPage() {
  const locale = await getLocale();
  if (locale === "en") {
    return (
      <LegalPage title={TITLE.en} updated="28 October 2026">
      <h2>The service</h2>
      <p>Clair helps you understand and organise official mail: explaining documents, spotting amounts and deadlines, reminders and letter templates. The service is offered as a beta version, with no guarantee of availability.</p>

      <h2>No legal or tax advice</h2>
      <p>
        Explanations are generated automatically and may contain mistakes. They do not replace the original document or the advice of a professional (lawyer, fiduciary, social services). <strong>Always check amounts and deadlines on the original letter</strong>, especially when Clair flags information as “to check”.
      </p>

      <h2>Letters</h2>
      <p>Letter templates help you write. You remain responsible for their content, for sending them and for meeting deadlines.</p>

      <h2>Your account</h2>
      <p>You are responsible for keeping your password and your email inbox confidential. You can delete your account at any time from Settings.</p>

      <h2>Free plan</h2>
      <p>The free plan includes a limited number of automatic analyses per month. No payment is required during the beta. Any paid plan will be subject to separate terms and your explicit consent.</p>

      <h2>Applicable law</h2>
      <p>Swiss law. Place of jurisdiction and publisher details to be added before the public launch.</p>
    </LegalPage>
    );
  }
  if (locale === "de") {
    return (
      <LegalPage title={TITLE.de} updated="28. Oktober 2026">
      <h2>Der Dienst</h2>
      <p>Clair hilft, Behördenpost zu verstehen und zu organisieren: Erklärung der Dokumente, Erkennen von Beträgen und Fristen, Erinnerungen und Briefvorlagen. Der Dienst wird als Beta-Version angeboten, ohne Verfügbarkeitsgarantie.</p>

      <h2>Keine Rechts- oder Steuerberatung</h2>
      <p>
        Die Erklärungen werden automatisch erstellt und können Fehler enthalten. Sie ersetzen weder das Originaldokument noch den Rat einer Fachperson (Anwältin oder Anwalt, Treuhand, Sozialdienst). <strong>Prüfen Sie Beträge und Fristen immer auf dem Originalbrief</strong>, besonders wenn Clair eine Angabe als «zu prüfen» markiert.
      </p>

      <h2>Schreiben</h2>
      <p>Die Briefvorlagen sind eine Formulierungshilfe. Sie bleiben für Inhalt, Versand und die Einhaltung der Fristen verantwortlich.</p>

      <h2>Ihr Konto</h2>
      <p>Sie sind für die Vertraulichkeit Ihres Passworts und Ihres E-Mail-Postfachs verantwortlich. Sie können Ihr Konto jederzeit unter Einstellungen löschen.</p>

      <h2>Kostenloses Angebot</h2>
      <p>Das kostenlose Angebot umfasst eine begrenzte Anzahl automatischer Analysen pro Monat. Während der Beta wird keine Zahlung verlangt. Jedes kostenpflichtige Angebot unterliegt separaten Bedingungen und einer ausdrücklichen Zustimmung.</p>

      <h2>Anwendbares Recht</h2>
      <p>Schweizer Recht. Gerichtsstand und Angaben zum Herausgeber werden vor dem öffentlichen Start ergänzt.</p>
    </LegalPage>
    );
  }
  return (
    <LegalPage title={TITLE.fr} updated="28 octobre 2026">
      <h2>Le service</h2>
      <p>Clair aide à comprendre et organiser le courrier administratif : explication des documents, repérage des montants et des échéances, rappels et modèles de lettres. Le service est proposé en version bêta, sans garantie de disponibilité.</p>

      <h2>Pas de conseil juridique ou fiscal</h2>
      <p>
        Les explications sont produites automatiquement et peuvent contenir des erreurs. Elles ne remplacent pas le document original ni l’avis d’un professionnel (avocat, fiduciaire, service social). <strong>Vérifiez toujours les montants et les délais sur le courrier original</strong>, en particulier lorsque Clair signale une information « à vérifier ».
      </p>

      <h2>Lettres</h2>
      <p>Les modèles de lettres sont une aide à la rédaction. Vous restez responsable de leur contenu, de leur envoi et du respect des délais.</p>

      <h2>Votre compte</h2>
      <p>Vous êtes responsable de la confidentialité de votre mot de passe et de votre boîte e-mail. Vous pouvez supprimer votre compte à tout moment depuis les réglages.</p>

      <h2>Offre gratuite</h2>
      <p>L’offre gratuite inclut un nombre limité d’analyses automatiques par mois. Aucun paiement n’est demandé pendant la bêta. Toute offre payante fera l’objet de conditions séparées et d’un consentement explicite.</p>

      <h2>Droit applicable</h2>
      <p>Droit suisse. For et coordonnées de l’éditeur à compléter avant le lancement public.</p>
    </LegalPage>
  );
}
