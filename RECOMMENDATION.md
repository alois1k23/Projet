# RECOMMENDATION — Analyse des trois finalistes et choix proposé (phase 3)

> Statut : **en attente de validation par le fondateur**. Aucun développement ne commence avant cette validation.
> Les chiffres marqués « hypothèse » sont des hypothèses de travail. Aucun n'est un résultat démontré.

## Synthèse

| | Clair | Nido | Tribu |
|---|---|---|---|
| Concept | Copilote du courrier administratif suisse | Copilote de recherche d'appartement | Copilote de la charge mentale familiale |
| Score /100 | **77,5** | 71,5 | 71,0 |
| 1re place si les notes varient | **93 %** | 4 % | 3 % |
| Douleur sourcée | Primes +4,4 % puis +5,0 %, 1 personne sur 3 en difficulté (S3, S4, S28) | Vacance de 0,93 % (S1) | Charge mentale de 71 % (France, S20) |
| Usage | Récurrent, toute l'année | Intense mais temporaire | Quotidien |
| Principal risque | « ChatGPT suffit », confiance | Accès aux annonces, churn | Concurrents financés |
| MRR à 12 mois, scénario réaliste (hypothèse) | CHF 1 416 | CHF 5 960 | CHF 1 380 |

**Recommandation : Clair**, sous réserve des tests H1 à H4 décrits plus bas.

Je dois être transparent sur un point : **Nido génère plus de revenu à court terme dans mes scénarios**, parce que la douleur est extrême et que les gens paient pendant leur recherche. Je ne la recommande pourtant pas en premier. Les raisons sont détaillées en section 2.

---

## 1. Clair — copilote du courrier administratif suisse

**Promesse :** « Photographiez un courrier. Sachez en 10 secondes ce qu'il veut dire, ce que vous devez faire et avant quand. »

### Pourquoi cela pourrait réussir
- **Problème universel et récurrent** : chaque ménage reçoit factures, décomptes de caisse-maladie, avis d'impôt, courriers de la commune, de la régie ou de Serafe. Environ 1,5 milliard de lettres circulent encore par an (S11).
- **Pression financière croissante** : primes à 412 CHF/mois en moyenne en 2027 (S4), une personne sur trois a eu du mal à les payer (S28). Une échéance manquée coûte des frais de rappel, et une résiliation hors délai coûte une année de prime trop chère.
- **Barrière locale** : quatre langues, 26 cantons, QR-facture, délais propres à la LAMal. Les apps « scan + IA » existantes visent les États-Unis (S14).
- **Infrastructure prête** : eBill touche environ la moitié des adultes (S12), bLink ouvre l'accès bancaire (S13), l'e-ID arrive (S27). Clair peut se brancher sur ces briques au lieu de les réinventer.

### Pourquoi les utilisateurs la téléchargeraient
- Moment déclencheur fort : un courrier incompris, en allemand pour un Romand ou en français pour un expatrié.
- Pics saisonniers prévisibles : résiliation LAMal (octobre–novembre), déclaration d'impôt (printemps), arrivée en Suisse.

### Pourquoi ils continueraient à l'utiliser
- Le courrier arrive toutes les semaines. L'app devient **le dossier administratif du ménage** : historique, échéances, documents retrouvables.
- Les rappels créent un retour naturel dans l'app, sans notifications artificielles.

### Pourquoi ils pourraient payer
- Gain chiffrable : un seul rappel payant évité (montant variable selon le créancier, à documenter) ou une franchise mieux choisie rembourse plusieurs mois d'abonnement.
- Plan Famille : le foyer partage un même dossier.
- **À démontrer :** la disposition à payer CHF 5.90/mois (hypothèse H4).

### Pourquoi nous plutôt qu'un autre
| Alternative | Ce qu'elle fait bien | Ce qui manque |
|---|---|---|
| ChatGPT / Gemini | Explique un document | Pas de mémoire du ménage, pas de rappels ni de paiement, pas de connaissance fiable des délais suisses, confidentialité floue |
| ePost (La Poste) | Reçoit le courrier numérique | Ne l'explique pas et n'agit pas ; dépend de l'adhésion des expéditeurs |
| eBill | Paie les factures des émetteurs inscrits | Ne couvre que les factures |
| Apps scan + IA (BriefAI, Papeer) | Résumé + échéance | Conçues pour les États-Unis, pas de QR-facture, pas de multilinguisme suisse |

**Notre différence défendable** tient en trois points : la connaissance du contexte suisse, des **actions** concrètes (rappel, paiement QR, lettre de réponse prête) et un hébergement en Suisse conforme à la nLPD.

### Ce qui pourrait provoquer l'échec
1. Une erreur d'échéance qui détruit la confiance. Parade : champ « à vérifier » quand la confiance est faible, validation en un tap, mesure de précision sur un corpus réel (H3).
2. Le refus de confier des documents sensibles (H2).
3. « ChatGPT me suffit ». La valeur doit être dans l'action et la mémoire, pas dans le résumé.
4. ePost ajoute de l'IA. Notre réponse est la vitesse d'exécution, avec la possibilité de devenir partenaire plutôt que concurrent.
5. Une disposition à payer trop faible (H4).

### Acquisition
| Palier | Leviers |
|---|---|
| **100 premiers** | Réseau personnel ; groupes Facebook d'expatriés et de Français en Suisse romande ; r/askswitzerland et r/geneva ; groupes de frontaliers ; vidéos courtes « je décode mon décompte LAMal ». Lancement calé sur la saison de résiliation LAMal. |
| **1 000** | Pages SEO par type de courrier (« comprendre un avis de taxation vaudois », « rappel Serafe »…) ; parrainage via le plan Famille ; associations d'accueil des nouveaux arrivants ; module gratuit « Bienvenue en Suisse » comme porte d'entrée. |
| **10 000** | Partenariats avec RH et agences de relocation (avantage salarié), régies, néobanques ; optimisation App Store ; ouverture à la Suisse alémanique (l'app parle déjà allemand). |

---

## 2. Nido — copilote de recherche d'appartement

### Pourquoi cela pourrait réussir
Le problème le plus intense de la liste. La vacance est de 0,93 % en 2026, 0,34 % à Genève et 0,20 % à Zoug (S1, S2). Les candidats paient volontiers pour aller plus vite.

### Pourquoi je ne la recommande pas en premier
1. **Accès aux données** : la valeur centrale (alertes unifiées, candidature instantanée) dépend des annonces de Homegate, ImmoScout24, Flatfox ou Comparis. Les agréger sans accord expose à un blocage ou à un litige. Sans cet accès, le produit se réduit à un générateur de dossier, facile à copier.
2. **Churn par construction** : un client satisfait trouve un logement et s'en va. Le MRR doit être reconstitué chaque mois par de nouvelles acquisitions, ce qui rend la croissance chère.
3. **Concurrence des portails** : ils peuvent ajouter la fonction « dossier » à tout moment, et contrôlent l'offre.

### Ce qu'on pourrait en garder
Un module « Déménagement » dans Clair (dossier de candidature, extrait des poursuites, changement d'adresse, résiliations) capte une partie de cette douleur sans dépendre des portails.

### Acquisition (pour mémoire)
100 : groupes de recherche de logement à Genève et Lausanne. 1 000 : associations d'étudiants, services de relocation. 10 000 : uniquement avec des partenariats portails.

---

## 3. Tribu — copilote de la charge mentale familiale

### Pourquoi cela pourrait réussir
Usage quotidien, douleur documentée (S20, S26), et catégorie validée par les investisseurs américains (S17–S19).

### Pourquoi pas en premier
1. **Concurrence financée** : Ohai, PAM et Faye ont levé des fonds et s'étendront probablement à l'Europe.
2. **Adoption à deux** : la valeur suppose que les deux parents l'utilisent, ce qui double la friction.
3. **Notre avantage est plus faible** : la francophonie seule ne fait pas un fossé durable.

### Ce qu'on pourrait en garder
Le partage familial de Clair (« qui s'occupe de ce courrier ? ») traite le volet administratif de la charge mentale, celui où le contexte suisse nous protège.

### Acquisition (pour mémoire)
100 : associations de parents d'élèves. 1 000 : créateurs de contenu parentalité francophones. 10 000 : écoles et crèches partenaires.

---

## 4. Scénarios financiers à 12 mois (hypothèses)

Modèle : inscrits à M12 × conversion payante × prix mensuel. Les conversions encadrent la médiane freemium publiée par RevenueCat (2,1 % à J35, S25).

| Idée | Scénario | Inscrits M12 | Conversion | Payants | MRR M12 | ARR implicite |
|---|---|---:|---:|---:|---:|---:|
| Clair (CHF 5.90) | Prudent | 1 500 | 2 % | 30 | CHF 177 | CHF 2 124 |
| | Réaliste | 6 000 | 4 % | 240 | CHF 1 416 | CHF 16 992 |
| | Optimiste | 25 000 | 7 % | 1 750 | CHF 10 325 | CHF 123 900 |
| Nido (CHF 14.90) | Prudent | 1 000 | 5 % | 50 | CHF 745 | non pertinent (churn) |
| | Réaliste | 5 000 | 8 % | 400 | CHF 5 960 | non pertinent (churn) |
| | Optimiste | 15 000 | 12 % | 1 800 | CHF 26 820 | non pertinent (churn) |
| Tribu (CHF 6.90) | Prudent | 1 000 | 2 % | 20 | CHF 138 | CHF 1 656 |
| | Réaliste | 5 000 | 4 % | 200 | CHF 1 380 | CHF 16 560 |
| | Optimiste | 20 000 | 6 % | 1 200 | CHF 8 280 | CHF 99 360 |

**Lecture honnête.**
- La première année ne permet pas de vivre de l'app dans les scénarios prudent et réaliste. C'est normal pour une app grand public et cela doit être anticipé : coûts très bas, développement par l'équipe fondatrice, puis levée pré-seed ou financement non dilutif (Innosuisse, fondations cantonales) une fois la traction démontrée.
- Économie unitaire de Clair (hypothèse à mesurer) : coût IA de l'ordre de quelques centimes par courrier, commission des stores de 15 % (programmes pour petits éditeurs), hébergement suisse de quelques dizaines à quelques centaines de CHF par mois. Marge brute visée : plus de 70 %.
- Le détail (CAC, rétention, seuil de rentabilité) sera construit en phase 9 dans `BUSINESS_MODEL.md`.

---

## 5. Pourquoi Clair : l'argument en une page

1. **Meilleur équilibre** : premier au score (77,5) avec 6 points d'avance, et premier dans 93 % des simulations où les notes varient.
2. **Fossé local** : multilinguisme, cantons, QR-facture et délais LAMal rendent la copie par un acteur global coûteuse.
3. **Rétention naturelle** : le courrier ne s'arrête jamais, contrairement à une recherche d'appartement.
4. **Plateforme extensible** sans changer de promesse : Bienvenue (installation), Franchise (LAMal), Fixe (contrats et résiliations) et un module Déménagement deviennent des fonctions de Clair. Quatre autres idées de la liste servent alors de canaux d'acquisition.
5. **MVP faisable en 8 à 12 semaines-personne** avec moins de CHF 3 000 de coûts cash (hypothèse).

### Ce que je proposerais pour le MVP (à détailler en phase 5)
Trois fonctions seulement :
1. **Comprendre** : scan ou PDF → résumé en français, expéditeur, montant, échéance, action à faire.
2. **Ne rien oublier** : échéancier du ménage et rappels.
3. **Répondre** : lettres prêtes (résiliation, contestation, demande de délai) à signer.

Le paiement QR, le partage familial et les intégrations eBill et bLink viendront ensuite, selon les retours de la bêta.

### Plan de validation avant de coder le produit complet (≈ 3 semaines)
1. Semaine 1 : 20 entretiens (H1) et collecte d'un corpus de courriers anonymisés.
2. Semaine 2 : prototype d'extraction sur le corpus pour mesurer la précision (H3), et landing page avec liste d'attente.
3. Semaine 3 : test du prototype avec 15 personnes (H2) et prévente « membre fondateur » (H4).

Critère d'arrêt : si H1 ou H3 échouent nettement, on revient à cette analyse avec Nido (version partenariats) et Tribu comme alternatives.

---

## Décisions attendues de votre part

1. **Validez-vous Clair comme concept retenu ?** (sinon : Nido, Tribu ou une autre piste)
2. **Validez-vous la séquence « 3 semaines de validation terrain, puis branding et PRD »** avant le développement complet ?
3. **Marché de départ** : Suisse romande en français d'abord, avec l'allemand en V1 ?
