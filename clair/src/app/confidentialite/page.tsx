import type { Metadata } from "next";
import { LegalPage } from "../legal-layout";
import { getLocale } from "@/i18n/server";

const TITLE = { fr: "Politique de confidentialité", de: "Datenschutzerklärung", en: "Privacy policy" };

export async function generateMetadata(): Promise<Metadata> {
  return { title: TITLE[await getLocale()], alternates: { canonical: "/confidentialite" } };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  if (locale === "en") {
    return (
      <LegalPage title={TITLE.en} updated="28 October 2026">
      <p>
        Clair processes personal and sometimes sensitive documents. This page explains what data we process, why, where it is stored and how you stay in control. It aims to comply with the Swiss Federal Act on Data Protection (FADP) and, for people in the European Union, the GDPR.
      </p>

      <h2>Data processed</h2>
      <ul>
        <li><strong>Account</strong>: email address, name, password (stored only as an Argon2id hash), language and, if you enter it, your postal address for the letter header. If you sign in with Google or Apple: the identifier of your account with that provider.</li>
        <li><strong>Mail</strong>: the files you add and the extracted information (sender, amount, deadline, summary).</li>
        <li><strong>Deadlines and letters</strong> that you create.</li>
        <li><strong>Waiting list</strong>: your email address, if you ask to be notified when Clair Plus launches.</li>
        <li><strong>Technical data</strong>: a strictly necessary session cookie and a cookie that remembers your language. No advertising cookies or tracking tools.</li>
      </ul>

      <h2>Purposes</h2>
      <p>Only to provide the service: explain your mail, remind you of deadlines (including by email) and prepare your letters. Your data is neither sold nor used for advertising.</p>

      <h2>Security</h2>
      <ul>
        <li>Files are encrypted (AES-256-GCM) before they are written to disk.</li>
        <li>Connections are encrypted (HTTPS) and sessions expire automatically.</li>
        <li>Login links sent by email are valid for 15 minutes and work only once.</li>
      </ul>

      <h2>Processors</h2>
      <p>
        To analyse a letter, its content is sent to <strong>Anthropic PBC</strong> (Claude model), in the United States. Under its commercial terms, Anthropic does not use this data to train its models. This transfer outside Switzerland must be covered by appropriate contractual clauses; this will be finalised before the public launch. If you do not want automatic analysis, you can enter the information yourself.
      </p>
      <p>Emails are sent through an email provider that will be chosen before the public launch. If you sign in with Google or Apple, their own privacy rules also apply.</p>

      <h2>Retention</h2>
      <p>Your data is kept as long as your account exists. When you delete a letter or your account, the corresponding data and files are deleted immediately from the database and storage. Any backups are overwritten according to their rotation cycle.</p>

      <h2>Your rights</h2>
      <ul>
        <li><strong>Access and portability</strong>: export all your data from Settings, in one click.</li>
        <li><strong>Rectification</strong>: correct any information from the letter’s page.</li>
        <li><strong>Erasure</strong>: delete a letter or your whole account from Settings.</li>
      </ul>
      <p>For any question, contact the data controller (contact details to be added before the public launch).</p>
    </LegalPage>
    );
  }
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
