import type { Metadata } from "next";
import { LegalPage } from "../legal-layout";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="28 octobre 2026">
      <p>
        Clair traite des documents personnels et parfois sensibles. Cette page explique quelles données nous traitons, pourquoi, où elles sont stockées et comment vous gardez le contrôle. Elle vise à respecter la loi fédérale sur la protection des données (nLPD) et, pour les personnes concernées dans l’Union européenne, le RGPD.
      </p>

      <h2>Données traitées</h2>
      <ul>
        <li><strong>Compte</strong> : adresse e-mail, nom, mot de passe (stocké uniquement sous forme de hachage Argon2id) et, si vous le saisissez, votre adresse postale pour l’en-tête des lettres.</li>
        <li><strong>Courriers</strong> : les fichiers que vous ajoutez et les informations extraites (expéditeur, montant, échéance, résumé).</li>
        <li><strong>Échéances et lettres</strong> que vous créez.</li>
        <li><strong>Données techniques</strong> : un cookie de session strictement nécessaire. Aucun cookie publicitaire ni outil de suivi.</li>
      </ul>

      <h2>Finalités</h2>
      <p>Uniquement fournir le service : expliquer vos courriers, rappeler vos échéances et préparer vos lettres. Vos données ne sont ni vendues, ni utilisées à des fins publicitaires.</p>

      <h2>Sécurité</h2>
      <ul>
        <li>Les fichiers sont chiffrés (AES-256-GCM) avant d’être écrits sur le disque.</li>
        <li>Les connexions sont chiffrées (HTTPS) et les sessions expirent automatiquement.</li>
      </ul>

      <h2>Sous-traitants</h2>
      <p>
        Pour analyser un courrier, son contenu est transmis à <strong>Anthropic PBC</strong> (modèle Claude), aux États-Unis. Selon ses conditions commerciales, Anthropic n’utilise pas ces données pour entraîner ses modèles. Ce transfert hors de Suisse doit être encadré par des clauses contractuelles appropriées ; ce point est à finaliser avant le lancement public. Si vous ne souhaitez pas d’analyse automatique, vous pouvez saisir les informations vous-même.
      </p>

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
