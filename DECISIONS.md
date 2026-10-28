# DECISIONS

Format : contexte → décision → conséquences. Les décisions majeures sont marquées « validation fondateur requise ».

## D-001 · Valider l'opportunité avant de coder (2026-10-28)
- **Contexte :** règle 7 du brief.
- **Décision :** les phases 1 à 3 produisent uniquement de la recherche, de l'analyse et une recommandation. Pas de code produit.
- **Conséquence :** le développement attend la validation explicite du concept.

## D-002 · Notes distinguées entre observées et estimées (2026-10-28)
- **Contexte :** risque de confondre un score subjectif avec une preuve de demande.
- **Décision :** chaque note porte un marqueur (O) ou (E). Les tests de robustesse appliquent plus d'incertitude aux notes estimées (±1,5) qu'aux notes sourcées (±0,5).
- **Conséquence :** le tableau de bord affiche, pour chaque idée, le nombre de critères sourcés.

## D-003 · Source unique de données (2026-10-28)
- **Décision :** toutes les données de l'étude vivent dans `dashboard/data.js`. Le tableau de bord et `scripts/verify-scores.mjs` lisent ce même fichier. Les tableaux de RESEARCH.md en sont générés.
- **Conséquence :** une modification de note se fait à un seul endroit, et `npm test` la revalide.

## D-004 · Tableau de bord en HTML statique + Apache ECharts (2026-10-28)
- **Alternatives :** React + Recharts (étape de build nécessaire), notebook Python (moins partageable).
- **Décision :** HTML statique, ECharts 5.5.0 chargé depuis cdnjs, rendu SVG, thèmes clair et sombre.
- **Raison :** zéro build, ouvrable partout, publiable tel quel, graphiques interactifs suffisants (barres, nuage, radar, courbes).

## D-005 · Recommandation : Clair (2026-10-28) — validation fondateur requise
- **Contexte :** Clair obtient 75,5/100 (77,5 avant la révision D-007) contre 71,5 pour Nido et 71,0 pour Tribu ; il reste premier dans 81 % des simulations où les notes varient.
- **Proposition :** retenir Clair, copilote du courrier administratif suisse, et absorber Bienvenue, Franchise, Fixe et un module Déménagement comme extensions futures.
- **Point de vigilance assumé :** Nido rapporte plus à court terme dans les scénarios, mais dépend de l'accès aux portails et subit un churn structurel.
- **Statut :** validée implicitement le 2026-10-28 : le fondateur a demandé le développement complet de Clair. La validation terrain (3 semaines) n'a pas été faite avant le code ; c'est un risque assumé (voir D-016).

## D-006 · Noms provisoires (2026-10-28)
- Les noms (Clair, Nido, Tribu…) servent à l'analyse uniquement. Aucune vérification de marque ni de domaine n'a été faite. Elle aura lieu en phase 4.

## D-007 · Révision de la note de concurrence de Clair (2026-10-28)
- **Contexte :** l'étude de marché ciblée a trouvé plusieurs apps d'explication de courriers par IA en Allemagne et en Autriche (Postera, xPlainly, Totoy).
- **Décision :** la note « faiblesse des solutions existantes » de Clair passe de 8 à 6. Score : 77,5 → 75,5. Clair reste premier.
- **Conséquence :** le positionnement passe de « une IA qui explique vos lettres » à « le gestionnaire administratif de confiance des ménages suisses ». L'avantage doit venir de la profondeur suisse, de la confiance et de la distribution (MARKET_STUDY.md, section 7).

## D-008 · Pile technique (2026-10-28)
- **Choix :** Next.js 15.5 (App Router, actions serveur) + React 19 + TypeScript strict + Tailwind CSS 4 + Prisma 6 + PostgreSQL 16 + SDK Anthropic.
- **Raisons :** un seul langage et un seul déploiement pour l'interface et le serveur ; actions serveur = pas d'API à maintenir pour les formulaires ; Prisma pour un schéma typé et des migrations versionnées ; PostgreSQL hébergeable en Suisse.
- **Écartés :** Supabase (dépendance à un service tiers pour l'authentification et le stockage de documents sensibles) ; Next.js 16 et Prisma 7, trop récents pour des versions éprouvées ; React Native, voir D-009.
- Toutes les dépendances sont épinglées à des versions publiées depuis au moins deux semaines.

## D-009 · Application web mobile d'abord, pas d'application native (2026-10-28)
- **Raisons :** une seule base de code, pas de validation par les stores pendant la bêta, l'appareil photo est accessible depuis le navigateur (`capture="environment"`), itérations rapides.
- **Conséquence :** pas encore de notifications push ni d'icône sur l'écran d'accueil (PWA en V1, Expo en V2 si nécessaire).

## D-010 · Analyse par Claude avec sortie structurée (2026-10-28)
- **Choix :** modèle `claude-opus-5-5` (configurable via `CLAIR_AI_MODEL`), effort `medium`, sortie structurée validée par un schéma Zod, fallbacks serveur activés (`fallbacks: "default"`).
- **Garde-fous :** les valeurs du modèle ne sont jamais utilisées brutes. Les dates impossibles sont écartées, les montants bornés, et la confiance par champ est affichée : en dessous de 0,8, le badge « À vérifier » apparaît.
- **Coût estimé :** quelques centimes par courrier (hypothèse à mesurer avec `npm run test:live`). Haiku ou Sonnet pourront être évalués par mesure, pas par principe.
- **Mode sans clé :** saisie manuelle, signalée dans l'interface. Aucune analyse simulée n'est jamais présentée comme réelle (le mode `mock` est réservé aux tests et affiche un bandeau).

## D-011 · Authentification maison plutôt qu'un fournisseur externe (2026-10-28)
- Argon2id, sessions en base (hachage SHA-256 du jeton), cookie httpOnly. Pas de données d'identité chez un tiers. Le passage à l'e-ID ou à des liens de connexion par e-mail est prévu en V1.

## D-012 · Documents chiffrés au repos (2026-10-28)
- AES-256-GCM avec une clé applicative ; stockage local derrière une interface `FileStorage`, remplaçable par un stockage objet suisse. Rotation de clé à concevoir avant le lancement public.

## D-013 · Pas de paiement pendant la bêta (2026-10-28) — validation fondateur requise pour changer
- Le quota gratuit (5 analyses par mois) est implémenté ; l'offre Plus est annoncée « bientôt ». Activer Stripe ou les achats intégrés = lancement d'un service payant, donc soumis à votre accord.

## D-014 · Montants au format suisse (2026-10-28)
- Les tests ont montré que `fr-CH` affiche « 1 240,50 ». Les montants en francs s'affichent désormais « CHF 1’240.50 », convention suisse y compris en Romandie.

## D-015 · Pas de `loading.tsx` dans l'espace connecté (2026-10-28)
- Les tests de bout en bout ont révélé qu'avec Next.js 15.5, ce fichier combiné à l'invalidation des pages après une action bloquait les actions suivantes côté client. Il est supprimé, et le commentaire de `src/lib/revalidate.ts` le signale.

## D-016 · Développement lancé avant la validation terrain (2026-10-28)
- À votre demande, le MVP a été développé sans les 3 semaines d'entretiens et de tests prévues. Le risque principal reste non mesuré : la disposition à payer et la précision réelle de l'IA sur de vrais courriers. Recommandation : utiliser le MVP lui-même comme outil de validation (bêta fermée de 20 à 50 personnes).

## D-017 · Priorité à la facilité d’usage pour l’acquisition (2026-10-28)
Demande du fondateur : rendre Clair facile pour attirer plus de monde. Six obstacles levés :
1. **Essai sans compte** : pages publiques `/exemple` avec les courriers fictifs, mêmes composants que l’application. Rien n’est enregistré, aucun coût d’API.
2. **Inscription en deux champs** (e-mail et mot de passe), avec bouton Afficher / Masquer. Le nom et l’adresse ne sont demandés qu’au moment de préparer une première lettre. L’acceptation des conditions devient une mention sous le bouton au lieu d’une case à cocher (à confirmer par le juriste).
3. **Un seul geste pour ajouter un courrier** : l’analyse démarre dès que la photo est prise ou le fichier choisi.
4. **Photos préparées dans le navigateur** : conversion HEIC → JPEG (iPhone) et réduction à 2 400 px. L’envoi sur mobile est plus rapide et l’analyse coûte moins cher.
5. **« Prochaine étape » en tête de chaque courrier**, avec les boutons utiles (C’est fait, Copier l’IBAN, Préparer la lettre).
6. **Installable sur l’écran d’accueil** (manifeste PWA, icônes, raccourci « Ajouter un courrier »).
Vocabulaire : « Échéances » devient « À faire ».

## D-018 · Tout est livré sans compte externe (2026-10-28)
Demande du fondateur : « Tout ! Je veux que ça soit complet ». Les e-mails (SMTP), Google et Apple sont entièrement implémentés mais **désactivés tant que les identifiants ne sont pas fournis** : aucun compte payant ou externe n’a été créé. L’application reste utilisable sans eux (mot de passe, saisie manuelle). Les boutons correspondants n’apparaissent que si la fonction est configurée.

## D-019 · Langue : une seule adresse par page, pas de préfixe /fr /de (2026-10-28)
La langue suit le profil, puis un cookie, puis le navigateur. Avantages : aucune URL à dupliquer, les liens des e-mails et des lettres restent valables. Inconvénient : les moteurs de recherche indexent surtout la version française (le robot n’envoie en général pas d’en-tête de langue). Si le référencement germanophone devient prioritaire, passer à des URL préfixées avec `hreflang`.

## D-020 · Contenus juridiques et guides : prudence et sources (2026-10-28)
Les guides ne contiennent que des faits vérifiés sur des sources officielles (Fedlex, ch.ch, Confédération, PostFinance), avec leur date de vérification et un avertissement « pas un conseil juridique ». Les versions allemandes des pages légales sont des traductions de travail ; la version française fait foi jusqu’à la relecture par un juriste.

## D-021 · Tarifs affichés sans prix (2026-10-28)
Le prix de Clair Plus n’est pas affiché : il dépend du coût réel des analyses, à mesurer pendant la bêta. La page annonce « Bientôt, prix annoncé avant tout paiement » et propose une liste d’attente. Aucun paiement n’est possible (D-013).

## D-022 · Mode démo honnête et éphémère (2026-10-28)
Demande du fondateur : un mode démo avant de configurer les services externes. Choix : de vrais comptes, mais temporaires (24 h), pré-remplis avec les courriers d’exemple, sans e-mail (adresse en `.invalid`, qui ne peut rien recevoir). Sans clé API, l’analyse d’une photo est simulée : c’est affiché en permanence, conformément à la règle « ne jamais présenter une simulation comme réelle ». Le mode est désactivé par défaut ; il faudra décider s’il reste actif sur le site public (coût nul sans clé, mais coût d’API réel avec une clé : la limite de 10 démos par heure et par connexion, et le quota de 5 analyses par compte, s’appliquent).
