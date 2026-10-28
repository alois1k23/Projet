import type { Metadata } from "next";
import { LegalPage } from "../legal-layout";

export const metadata: Metadata = { title: "Conditions d’utilisation" };

export default function TermsPage() {
  return (
    <LegalPage title="Conditions d’utilisation" updated="28 octobre 2026">
      <h2>Le service</h2>
      <p>Clair aide à comprendre et organiser le courrier administratif : explication des documents, repérage des montants et des échéances, rappels et modèles de lettres. Le service est proposé en version bêta, sans garantie de disponibilité.</p>

      <h2>Pas de conseil juridique ou fiscal</h2>
      <p>
        Les explications sont produites automatiquement et peuvent contenir des erreurs. Elles ne remplacent pas le document original ni l’avis d’un professionnel (avocat, fiduciaire, service social). <strong>Vérifiez toujours les montants et les délais sur le courrier original</strong>, en particulier lorsque Clair signale une information « à vérifier ».
      </p>

      <h2>Lettres</h2>
      <p>Les modèles de lettres sont une aide à la rédaction. Vous restez responsable de leur contenu, de leur envoi et du respect des délais.</p>

      <h2>Votre compte</h2>
      <p>Vous êtes responsable de la confidentialité de votre mot de passe. Vous pouvez supprimer votre compte à tout moment depuis les réglages.</p>

      <h2>Offre gratuite</h2>
      <p>L’offre gratuite inclut un nombre limité d’analyses automatiques par mois. Aucun paiement n’est demandé pendant la bêta. Toute offre payante fera l’objet de conditions séparées et d’un consentement explicite.</p>

      <h2>Droit applicable</h2>
      <p>Droit suisse. For et coordonnées de l’éditeur à compléter avant le lancement public.</p>
    </LegalPage>
  );
}
