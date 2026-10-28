# PRODUCT — Clair (PRD)

> Version 0.3 · 28 octobre 2026 · Statut : MVP développé, en attente de validation terrain
> Nom provisoire : aucune vérification de marque ni de domaine n'a été faite.

## 1. Vision

**Aucun ménage en Suisse ne devrait perdre de l'argent ou un droit parce qu'il n'a pas compris un courrier.**

Clair est le gestionnaire administratif de confiance des ménages suisses : il explique chaque courrier, rappelle chaque échéance et prépare chaque réponse.

## 2. Problèmes résolus

| Problème | Donnée | Réponse de Clair |
|---|---|---|
| Courriers difficiles à comprendre, parfois dans une autre langue nationale | 26 % d'étrangers, 22 % de francophones (OFS) | Explication en français simple, quelle que soit la langue d'origine |
| Échéances oubliées : rappels payants, délais d'opposition ou de résiliation manqués | 3,3 M de commandements de payer en 2024 | Échéancier automatique, rappels, export vers l'agenda |
| Rédiger une réponse prend du temps | — | Lettres pré-remplies, en français ou en allemand, en PDF |

Sources et détails : MARKET_STUDY.md.

## 3. Personas

| Persona | Contexte | Besoin principal |
|---|---|---|
| **Sophie, 38 ans, Lausanne** | Cheffe de projet, deux enfants, 15 à 20 courriers par mois (hypothèse) | Ne plus rien oublier, gagner du temps |
| **Marco, 31 ans, arrivé à Genève** | Ne connaît pas le système, reçoit parfois des courriers en allemand | Savoir si c'est grave et quoi faire |
| **Claire, 52 ans, Fribourg** | Gère le courrier de sa mère de 81 ans | Voir les échéances d'un proche (V1 : partage) |

## 4. Parcours utilisateur clés

1. **Découverte sans compte** : landing → « Voir un exemple, sans compte » → résultat complet d'un courrier fictif → « Essayer avec mon courrier ».
2. **Inscription en deux champs** (e-mail, mot de passe) → accueil en trois étapes avec un seul bouton : « Photographier un courrier ».
3. **Courrier entrant, un seul geste** : bouton « + » → photo ou PDF → l'analyse démarre seule (10 à 30 s, étapes affichées) → fiche du courrier : en bref, **prochaine étape** avec ses boutons, points d'attention, détails copiables, lettres suggérées.
3. **Information incertaine** : badge « À vérifier » → comparaison avec l'original affiché à côté → correction → le badge disparaît.
4. **Échéance** : accueil groupé (en retard / cette semaine / plus tard) → case à cocher → export .ics vers l'agenda.
5. **Répondre** : lettre suggérée → champs pré-remplis → coordonnées demandées seulement la première fois → aperçu en direct → PDF au format d'enveloppe à fenêtre suisse.
6. **Contrôle des données** : export JSON complet, suppression d'un courrier ou du compte entier.

## 5. Périmètre

### MVP (développé, voir TESTING.md)
| Fonction | Statut |
|---|---|
| Démonstration publique sans compte | ✅ Fait et testé |
| Compte : inscription en deux champs, connexion, déconnexion, sessions sécurisées | ✅ |
| Installation sur l'écran d'accueil (PWA) | ✅ Manifeste et icônes ; non testé sur un vrai téléphone |
| Ajout d'un courrier : photo (appareil photo mobile), PDF, glisser-déposer | ✅ |
| Analyse IA (Claude, sortie structurée validée), en français, toutes langues d'origine | ✅ Code testé avec un faux client ; **non testé contre l'API réelle faute de clé** |
| Mode sans IA : saisie manuelle | ✅ |
| Détection des informations incertaines et correction manuelle | ✅ |
| Échéancier, tâches, export .ics | ✅ |
| 5 modèles de lettres FR/DE + PDF | ✅ |
| Courriers d'exemple fictifs | ✅ |
| Quota gratuit (5 analyses par mois) | ✅ |
| Réglages : profil, thème clair/sombre, export, suppression du compte | ✅ |
| Rappels d'échéance | ⚠️ Logique faite et testée ; **envoi d'e-mails non branché** (journal uniquement) |
| Pages confidentialité et conditions | ⚠️ Brouillons à faire relire par un juriste |

### V1 (après la bêta)
- Envoi des rappels par e-mail et notifications push (PWA).
- Partage familial (plan Famille) et gestion du courrier d'un proche.
- Paiement : ouverture de l'app bancaire avec les données QR, puis intégration eBill.
- Interface en allemand.
- Abonnement Clair Plus (Stripe ou paiement via les stores) **après accord explicite**.
- Transfert de courriers par e-mail (adresse personnelle de dépôt).

### V2
- Applications natives (Expo) si la PWA ne suffit pas (caméra, notifications).
- Modules par moment de vie : arrivée en Suisse, déménagement, franchise LAMal, contrats et résiliations.
- Multibanking bLink, e-ID.
- Offre B2B2C : employeurs, agences de relocation.

## 6. Modèle économique (résumé)

Freemium : 5 analyses automatiques par mois gratuites, saisie manuelle et lettres illimitées. Clair Plus à environ CHF 4.90–5.90 par mois ou 39–69 par an (fourchette à tester). Aucun paiement n'est actif pendant la bêta. Détails : BUSINESS_MODEL.md et MARKET_STUDY.md.

## 7. Indicateurs

| Indicateur | Définition | Cible bêta (hypothèse) |
|---|---|---|
| Activation | Inscrits ayant ajouté un vrai courrier dans les 7 jours | ≥ 50 % |
| Précision | Échéance et montant corrects sans correction | ≥ 97 % |
| Taux de correction | Courriers corrigés manuellement | ≤ 10 % |
| Rétention S4 | Actifs en semaine 4 | ≥ 35 % |
| Usage | Courriers par utilisateur actif et par mois | ≥ 3 |
| Conversion | Inscrits payants (après lancement de l'offre) | ≥ 4 % |

Aucun outil d'analytics n'est intégré : à décider avec vous (solution respectueuse de la vie privée, hébergée en Suisse ou dans l'UE).

## 8. Sécurité et confidentialité

- Mots de passe hachés avec Argon2id (paramètres OWASP).
- Sessions : jeton aléatoire de 256 bits, seul son hachage SHA-256 est stocké ; cookie httpOnly, SameSite=Lax, Secure en production ; expiration de 30 jours avec renouvellement.
- Fichiers chiffrés AES-256-GCM avant écriture ; clé en variable d'environnement.
- Type de fichier vérifié par signature binaire, taille limitée à 10 Mo, noms nettoyés.
- Chaque requête vérifie que la ressource appartient à l'utilisateur (testé : un autre compte reçoit « Page introuvable »).
- Limitation des tentatives de connexion et des analyses.
- En-têtes de sécurité (nosniff, DENY frame, Referrer-Policy, Permissions-Policy) et CSP stricte sur les fichiers servis.
- Export complet et suppression immédiate (nLPD, RGPD).
- Sous-traitant IA : Anthropic (États-Unis). Encadrement contractuel du transfert à finaliser avant le lancement public.
