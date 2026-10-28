import type { Metadata } from "next";
import { LegalPage } from "../legal-layout";
import { getLocale } from "@/i18n/server";

const TITLE = { fr: "Politique de confidentialité", de: "Datenschutzerklärung" };

export async function generateMetadata(): Promise<Metadata> {
  return { title: TITLE[await getLocale()], alternates: { canonical: "/confidentialite" } };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  if (locale === "de") {
    return (
      <LegalPage title={TITLE.de} updated="28. Oktober 2026">
      <p>
        Clair verarbeitet persönliche und manchmal sensible Dokumente. Diese Seite erklärt, welche Daten wir verarbeiten, weshalb, wo sie gespeichert werden und wie Sie die Kontrolle behalten. Sie soll dem Bundesgesetz über den Datenschutz (DSG) und, für betroffene Personen in der Europäischen Union, der DSGVO entsprechen.
      </p>

      <h2>Bearbeitete Daten</h2>
      <ul>
        <li><strong>Konto</strong>: E-Mail-Adresse, Name, Passwort (nur als Argon2id-Hash gespeichert), Sprache und, falls Sie sie erfassen, Ihre Postadresse für den Briefkopf. Bei Anmeldung mit Google oder Apple: die Kennung des Kontos beim Anbieter.</li>
        <li><strong>Briefe</strong>: die Dateien, die Sie hinzufügen, und die daraus gewonnenen Angaben (Absender, Betrag, Frist, Zusammenfassung).</li>
        <li><strong>Fristen und Schreiben</strong>, die Sie erstellen.</li>
        <li><strong>Warteliste</strong>: Ihre E-Mail-Adresse, wenn Sie über den Start von Clair Plus informiert werden möchten.</li>
        <li><strong>Technische Daten</strong>: ein unbedingt notwendiges Sitzungs-Cookie und ein Cookie für die gewählte Sprache. Keine Werbe-Cookies und kein Tracking.</li>
      </ul>

      <h2>Zwecke</h2>
      <p>Ausschliesslich die Erbringung des Dienstes: Ihre Briefe erklären, an Fristen erinnern (auch per E-Mail) und Ihre Schreiben vorbereiten. Ihre Daten werden weder verkauft noch zu Werbezwecken verwendet.</p>

      <h2>Sicherheit</h2>
      <ul>
        <li>Dateien werden vor dem Schreiben auf die Festplatte verschlüsselt (AES-256-GCM).</li>
        <li>Verbindungen sind verschlüsselt (HTTPS) und Sitzungen laufen automatisch ab.</li>
        <li>Anmeldelinks per E-Mail sind 15 Minuten gültig und nur einmal verwendbar.</li>
      </ul>

      <h2>Auftragsbearbeiter</h2>
      <p>
        Zur Analyse eines Briefes wird sein Inhalt an <strong>Anthropic PBC</strong> (Modell Claude) in den USA übermittelt. Gemäss seinen kommerziellen Bedingungen verwendet Anthropic diese Daten nicht zum Training seiner Modelle. Diese Übermittlung ausserhalb der Schweiz muss durch geeignete Vertragsklauseln abgesichert werden; dieser Punkt ist vor dem öffentlichen Start abzuschliessen. Wenn Sie keine automatische Analyse wünschen, können Sie die Angaben selbst erfassen.
      </p>
      <p>Für den Versand von E-Mails wird ein E-Mail-Dienstleister eingesetzt, der vor dem öffentlichen Start bestimmt wird. Bei Anmeldung mit Google oder Apple gelten zusätzlich deren Datenschutzbestimmungen.</p>

      <h2>Aufbewahrungsdauer</h2>
      <p>Ihre Daten werden aufbewahrt, solange Ihr Konto besteht. Wenn Sie einen Brief oder Ihr Konto löschen, werden die entsprechenden Daten und Dateien sofort aus der Datenbank und dem Speicher entfernt. Allfällige Sicherungskopien werden gemäss ihrem Rotationszyklus überschrieben.</p>

      <h2>Ihre Rechte</h2>
      <ul>
        <li><strong>Auskunft und Datenübertragbarkeit</strong>: Exportieren Sie alle Ihre Daten unter Einstellungen mit einem Klick.</li>
        <li><strong>Berichtigung</strong>: Korrigieren Sie jede Angabe auf der Seite des Briefes.</li>
        <li><strong>Löschung</strong>: Löschen Sie einen Brief oder Ihr ganzes Konto unter Einstellungen.</li>
      </ul>
      <p>Für Fragen wenden Sie sich an den Verantwortlichen (Kontaktangaben werden vor dem öffentlichen Start ergänzt).</p>
    </LegalPage>
    );
  }
  return (
    <LegalPage title={TITLE.fr} updated="28 octobre 2026">
      <p>
        Clair traite des documents personnels et parfois sensibles. Cette page explique quelles données nous traitons, pourquoi, où elles sont stockées et comment vous gardez le contrôle. Elle vise à respecter la loi fédérale sur la protection des données (nLPD) et, pour les personnes concernées dans l’Union européenne, le RGPD.
      </p>

      <h2>Données traitées</h2>
      <ul>
        <li><strong>Compte</strong> : adresse e-mail, nom, mot de passe (stocké uniquement sous forme de hachage Argon2id), langue et, si vous la saisissez, votre adresse postale pour l’en-tête des lettres. En cas de connexion avec Google ou Apple : l’identifiant du compte chez ce fournisseur.</li>
        <li><strong>Courriers</strong> : les fichiers que vous ajoutez et les informations extraites (expéditeur, montant, échéance, résumé).</li>
        <li><strong>Échéances et lettres</strong> que vous créez.</li>
        <li><strong>Liste d’attente</strong> : votre adresse e-mail, si vous demandez à être prévenu du lancement de Clair Plus.</li>
        <li><strong>Données techniques</strong> : un cookie de session strictement nécessaire et un cookie mémorisant la langue choisie. Aucun cookie publicitaire ni outil de suivi.</li>
      </ul>

      <h2>Finalités</h2>
      <p>Uniquement fournir le service : expliquer vos courriers, rappeler vos échéances (y compris par e-mail) et préparer vos lettres. Vos données ne sont ni vendues, ni utilisées à des fins publicitaires.</p>

      <h2>Sécurité</h2>
      <ul>
        <li>Les fichiers sont chiffrés (AES-256-GCM) avant d’être écrits sur le disque.</li>
        <li>Les connexions sont chiffrées (HTTPS) et les sessions expirent automatiquement.</li>
        <li>Les liens de connexion envoyés par e-mail sont valables 15 minutes et ne servent qu’une fois.</li>
      </ul>

      <h2>Sous-traitants</h2>
      <p>
        Pour analyser un courrier, son contenu est transmis à <strong>Anthropic PBC</strong> (modèle Claude), aux États-Unis. Selon ses conditions commerciales, Anthropic n’utilise pas ces données pour entraîner ses modèles. Ce transfert hors de Suisse doit être encadré par des clauses contractuelles appropriées ; ce point est à finaliser avant le lancement public. Si vous ne souhaitez pas d’analyse automatique, vous pouvez saisir les informations vous-même.
      </p>
      <p>L’envoi des e-mails passe par un prestataire d’e-mail qui sera désigné avant le lancement public. En cas de connexion avec Google ou Apple, leurs propres règles de confidentialité s’appliquent également.</p>

      <h2>Durée de conservation</h2>
      <p>Vos données sont conservées tant que votre compte existe. Lorsque vous supprimez un courrier ou votre compte, les données et fichiers correspondants sont supprimés immédiatement de la base et du stockage. Les sauvegardes éventuelles sont écrasées selon leur cycle de rotation.</p>

      <h2>Vos droits</h2>
      <ul>
        <li><strong>Accès et portabilité</strong> : exportez toutes vos données depuis Réglages, en un clic.</li>
        <li><strong>Rectification</strong> : corrigez chaque information depuis la fiche du courrier.</li>
        <li><strong>Effacement</strong> : supprimez un courrier ou votre compte entier depuis Réglages.</li>
      </ul>
      <p>Pour toute question, contactez le responsable du traitement (coordonnées à compléter avant le lancement public).</p>
    </LegalPage>
  );
}
