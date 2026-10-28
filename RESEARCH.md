# RESEARCH — Étude de marché (phases 1 et 2)

> Date de l'étude : 28 octobre 2026 · Marché : Suisse (romande d'abord) puis francophonie
> Tableau de bord interactif : [`dashboard/index.html`](dashboard/index.html) · Données : [`dashboard/data.js`](dashboard/data.js)

## 1. Méthode

1. **Recherche documentaire** sur des sources publiques datées (OFS, OFSP, SIX, PostCom, Comparis, RevenueCat, presse spécialisée). Chaque donnée est référencée (S1…S43) avec sa date et un niveau de fiabilité.
2. **Génération de 15 concepts** à partir de problèmes fréquents, en privilégiant les spécificités suisses qu'un acteur global copie difficilement (multilinguisme, LAMal, QR-facture, fiscalité cantonale, frontaliers, pénurie de logements).
3. **Notation multicritère** de 0 à 10 sur 8 critères pondérés (grille fournie). Pour chaque note, on distingue :
   - **(O) observé** : la note s'appuie sur une donnée sourcée ;
   - **(E) estimé** : jugement d'expert, à valider.
4. **Tests de robustesse** (`node scripts/verify-scores.mjs`) :
   - pondérations perturbées aléatoirement de ±50 % (5 000 tirages) ;
   - notes perturbées (±1,5 point si estimées, ±0,5 si sourcées).

**Avertissement.** Un score élevé signifie « hypothèse prioritaire à tester », pas « demande prouvée ». Aucune idée n'a encore été confrontée à de vrais utilisateurs.

### Ce qui n'a pas pu être consulté

| Source souhaitée | Statut | Méthode de remplacement proposée |
|---|---|---|
| Google Trends | Non accessible depuis l'environnement | Export manuel Trends (CH, 5 ans) sur « résiliation », « délai LAMal », « facture QR », « appartement Genève » |
| Avis App Store / Google Play | Pas d'extraction systématique | Export des avis 1–2★ d'ePost, Splitwise, Cozi, Homegate via AppFollow ou un script dédié |
| Reddit en direct | Seulement des miroirs indirects | Lecture manuelle de r/askswitzerland, r/Switzerland, r/geneva (requêtes « letter », « Steueramt », « Krankenkasse ») |
| Crunchbase / PitchBook | Payant | Recherche manuelle des levées 2024–2026 sur « household admin », « mail AI » |
| Nombre de ménages suisses | Non revérifié | Tableaux STATPOP de l'OFS |

## 2. Contexte de marché : faits sourcés

| Constat | Chiffre | Source |
|---|---|---|
| Pénurie de logements | Taux de vacance 0,93 % au 1.6.2026, 6e baisse consécutive ; Zoug 0,20 % | S1 |
| Pénurie très forte dans l'arc lémanique | Genève 0,34 %, Zurich 0,48 % (2025) | S2 |
| Pression sur les primes | 393,30 CHF/mois en 2026 (+4,4 %), environ 412 CHF/mois en 2027 (+5,0 %) | S3, S4 |
| Difficulté à payer | 1 personne sur 3 a eu du mal à payer ses primes en 2024 ; hausse des coûts fixes = 1er facteur d'incertitude pour 2026 | S28 |
| Intention de changer de caisse | 32 % envisageaient de résilier pour 2026 (intention, pas comportement) | S5 |
| Population et diversité linguistique | 9 127 100 résidents fin 2025 ; environ 26 % d'étrangers (2022) | S8, S9 |
| Frontaliers | 411 450 fin 2025 dont 239 431 résidant en France | S6 |
| Nouvelle contrainte fiscale | Télétravail des frontaliers : seuil de 40 % et suivi par l'employeur dès 2026 | S7 |
| Courrier papier | ~1,5 milliard de lettres en 2025 (–20 % depuis 2021) | S11 |
| Numérisation des factures | eBill : plus de 4 millions d'utilisateurs (≈ moitié des adultes) | S12 |
| Courrier numérique | ePost revendique plus de 170 000 particuliers (non daté) | S10 |
| Open banking | Multibanking bLink pour particuliers lancé le 25.11.2025 | S13 |
| Identité numérique | e-ID étatique acceptée (50,4 %) ; date de lancement incertaine | S27 |
| Charge mentale | 71 % des femmes actives en France ressentent une charge mentale élevée | S20 |
| Investissements récents « foyer + IA » | Ohai (seed 6 M$ + tour 2025), Faye (2,5 M$), PAM (570 k NZD) | S17–S19 |
| Économie des apps à abonnement | ~30 % des abonnements annuels annulés le 1er mois ; conversion médiane à J35 de 2,1 % en freemium contre 10,7 % avec paywall strict | S24, S25 |

**Lecture stratégique.**
- Les dépenses contraintes (primes, loyers, coûts fixes) augmentent : les problèmes **d'argent subi et d'administratif** sont plus aigus que ceux de productivité « confort ».
- La Suisse se numérise par briques (eBill, ePost, bLink, e-ID) mais **aucune couche ne comprend et n'agit sur l'ensemble du courrier d'un ménage**.
- Les apps « scan + IA » existantes ciblent les États-Unis (S14). Le contexte suisse (QR-facture, quatre langues, 26 cantons) crée une **barrière à l'entrée locale**.
- Les investisseurs financent déjà la charge mentale du foyer aux États-Unis (S17–S19), ce qui valide la catégorie mais signale une concurrence future.

## 3. Grille de notation

| Critère | Pondération |
|---|---:|
| Importance du problème | 20 % |
| Potentiel de marché | 15 % |
| Fréquence d'utilisation | 15 % |
| Faiblesse des solutions existantes | 10 % |
| Potentiel de monétisation | 15 % |
| Faisabilité technique | 10 % |
| Potentiel de croissance | 10 % |
| Capacité de lancement rapide | 5 % |

Score final = Σ (note × pondération) / 10, sur 100.

## 4. Classement

| Rang | Idée | Score /100 | 1er si pondérations ±50 % | Top 3 si pondérations ±50 % | 1er si notes incertaines |
|---:|---|---:|---:|---:|---:|
| 1 | Clair — Copilote du courrier administratif suisse | 75.5 | 100 % | 100 % | 81 % |
| 2 | Nido — Copilote de recherche d'appartement | 71.5 | 0 % | 100 % | 11 % |
| 3 | Tribu — Copilote de la charge mentale familiale | 71.0 | 0 % | 100 % | 8 % |
| 4 | Bascule — Assistant conformité des frontaliers | 64.5 | 0 % | 0 % | 0 % |
| 5 | Relais — Coordination des proches aidants | 64.5 | 0 % | 0 % | 0 % |
| 6 | Grüezi — Coach de langue locale par situations réelles | 64.0 | 0 % | 0 % | 0 % |
| 7 | Partage — Dépenses partagées pour colocations et couples | 62.0 | 0 % | 0 % | 0 % |
| 8 | Franchise — Optimiseur continu de l'assurance-maladie | 60.5 | 0 % | 0 % | 0 % |
| 9 | Révise — Coach de révision IA à partir des cours | 59.5 | 0 % | 0 % | 0 % |
| 10 | Fixe — Contrôle des abonnements et contrats | 59.0 | 0 % | 0 % | 0 % |
| 11 | Panier — Planificateur de repas anti-gaspillage aux prix suisses | 57.5 | 0 % | 0 % | 0 % |
| 12 | Bienvenue — Parcours d'installation en Suisse | 57.0 | 0 % | 0 % | 0 % |
| 13 | Équipe — Organisation de sport entre amis | 54.5 | 0 % | 0 % | 0 % |
| 14 | Ticket — Coffre à tickets et garanties | 44.0 | 0 % | 0 % | 0 % |
| 15 | Trajet — Optimiseur d'abonnements de transport | 43.0 | 0 % | 0 % | 0 % |

**Lecture des tests de robustesse.**
- Le trio de tête reste le même dans 100 % des simulations où les pondérations varient de ±50 %.
- Avec des notes incertaines, Clair reste premier dans 81 % des cas, Nido dans 11 % et Tribu dans 8 %.
- Révision du 28.10.2026 : la note « faiblesse des solutions existantes » de Clair passe de 8 à 6 après la découverte de plusieurs apps d'explication de courriers en Allemagne et en Autriche (voir MARKET_STUDY.md).
- **Limite importante :** ces tests mesurent la stabilité du *modèle* face à mes propres incertitudes, pas la réalité du marché. Si mes notes sont biaisées dans le même sens, la simulation ne le détecte pas. Seuls les tests utilisateurs (section 6) le peuvent.

## 5. Les 15 concepts

(O) = note appuyée sur une source ; (E) = estimation. Les coûts de MVP sont des estimations en semaines-personne pour une équipe fondatrice qui code elle-même.

### 1. Clair — Copilote du courrier administratif suisse (75.5/100)

| | |
|---|---|
| **Problème** | Les ménages reçoivent factures QR, décomptes LAMal, avis d'impôt, courriers de la commune et du bailleur, parfois dans une langue nationale qu'ils ne maîtrisent pas. Échéances manquées, rappels payants, résiliations hors délai. |
| **Public cible** | Ménages en Suisse romande puis toute la Suisse ; cœur de cible : actifs 25–45 ans, nouveaux arrivants et frontaliers. |
| **Solution** | Photographier ou transférer un courrier : l'app résume en français, extrait montant, échéance et action à faire, crée le rappel, prépare le paiement QR et rédige la réponse (contestation, résiliation, demande de délai). |
| **Fonction principale** | Scan → « ce que ça veut dire / ce que je dois faire / avant quand » en 10 secondes. |
| **Fréquence estimée** | Hebdomadaire (plusieurs courriers par mois par ménage) — estimation. |
| **Concurrents** | ePost (boîte aux lettres numérique de La Poste), petites apps d'explication de courriers par IA en Allemagne et en Autriche (Postera, xPlainly, Totoy), ChatGPT/Gemini/Swisscom myAI en usage libre, eBill pour la seule partie factures. |
| **Avantage potentiel** | Connaissance du contexte suisse (QR-facture, délais LAMal, impôts cantonaux, Serafe, régies), multilingue FR/DE/IT/EN, hébergement en Suisse, actions concrètes (rappel, paiement, lettre). La simple explication d'un courrier est déjà copiée par plusieurs apps : l'avantage durable doit venir de la spécialisation suisse, de la confiance et de la distribution. |
| **Difficulté technique** | Moyenne : OCR + LLM multimodal, extraction structurée fiable, chiffrement, rappels. |
| **Coût estimé du MVP** | 8–12 semaines-personne · < CHF 3 000 jusqu'au MVP (API IA, hébergement, comptes stores) |
| **Modèle économique** | Freemium : 5 courriers/mois gratuits ; Plus ~CHF 5.90/mois ou ~CHF 49/an (hypothèse) ; plan Famille partagé. |
| **Risques majeurs** | Erreur d'extraction sur une échéance ; réticence à confier des documents sensibles ; ePost pourrait ajouter de l'IA ; « ChatGPT suffit ». |
| **Notes** | Problème 9 (O) · Marché 8 (O) · Fréquence 7 (E) · Concurrence faible 6 (O) · Monétisation 7 (E) · Faisabilité 7 (E) · Croissance 8 (E) · Lancement 7 (E) |
| **Sources** | S3, S4, S8, S9, S10, S11, S12, S14, S28, S29, S33, S34, S35, S36, S37, S38 |

### 2. Nido — Copilote de recherche d'appartement (71.5/100)

| | |
|---|---|
| **Problème** | Pénurie de logements : 0,93 % de vacance en 2026, 0,20 % à Zoug, 0,34 % à Genève en 2025. Les candidats doivent réagir en minutes, fournir un dossier complet et relancer les régies. |
| **Public cible** | Locataires en recherche active à Genève, Lausanne, Zurich ; étudiants, expatriés, jeunes couples. |
| **Solution** | Alertes unifiées multi-portails, dossier de candidature prêt (extrait des poursuites, fiches de salaire, lettre personnalisée par IA), suivi des visites et relances. |
| **Fonction principale** | Candidature complète envoyée en 2 minutes dès qu'une annonce correspond. |
| **Fréquence estimée** | Quotidienne pendant la recherche (quelques semaines à quelques mois), nulle ensuite. |
| **Concurrents** | Homegate, ImmoScout24, Flatfox, Comparis Immo, RentDossier, groupes Facebook. |
| **Avantage potentiel** | Vitesse et qualité du dossier ; vue unifiée ; spécialisation suisse. |
| **Difficulté technique** | Élevée côté données : l'agrégation d'annonces dépend de l'accès aux portails (CGU, scraping juridiquement risqué). |
| **Coût estimé du MVP** | 10–16 semaines-personne · CHF 3 000–8 000 (données, infra, juridique) |
| **Modèle économique** | Pass recherche ~CHF 14.90/mois (hypothèse), forte disposition à payer mais churn par construction. |
| **Risques majeurs** | Blocage par les portails, dépendance aux CGU, churn structurel, coût d'acquisition à repayer pour chaque client. |
| **Notes** | Problème 10 (O) · Marché 6 (E) · Fréquence 8 (E) · Concurrence faible 6 (E) · Monétisation 7 (E) · Faisabilité 5 (E) · Croissance 6 (E) · Lancement 6 (E) |
| **Sources** | S1, S2 |

### 3. Tribu — Copilote de la charge mentale familiale (71.0/100)

| | |
|---|---|
| **Problème** | Infos d'école, activités, rendez-vous et tâches dispersés entre e-mails, PDF et groupes WhatsApp ; la charge repose souvent sur une seule personne. |
| **Public cible** | Parents actifs francophones (Suisse romande, France, Belgique) avec enfants de 3 à 15 ans. |
| **Solution** | Transférer un e-mail, une capture ou un PDF : l'IA crée l'événement, la tâche, l'assigne et rappelle au bon parent. |
| **Fonction principale** | Capture → événement + tâche assignée, sans saisie manuelle. |
| **Fréquence estimée** | Quotidienne — estimation. |
| **Concurrents** | Ohai.ai, PAM, Faye, Cozi, Google Agenda partagé, FamilyWall. |
| **Avantage potentiel** | Francophonie et systèmes scolaires locaux ; les concurrents financés ciblent d'abord le marché anglophone. |
| **Difficulté technique** | Moyenne : intégrations calendrier, parsing multi-format, synchronisation multi-utilisateur. |
| **Coût estimé du MVP** | 10–14 semaines-personne · < CHF 4 000 |
| **Modèle économique** | Abonnement famille ~CHF 6.90/mois (hypothèse). |
| **Risques majeurs** | Concurrents financés qui s'étendent à l'Europe ; adoption par les deux parents nécessaire ; WhatsApp difficile à intégrer. |
| **Notes** | Problème 8 (O) · Marché 8 (E) · Fréquence 9 (E) · Concurrence faible 5 (O) · Monétisation 6 (E) · Faisabilité 6 (E) · Croissance 7 (E) · Lancement 5 (E) |
| **Sources** | S17, S18, S19, S20, S26 |

### 4. Bascule — Assistant conformité des frontaliers (64.5/100)

| | |
|---|---|
| **Problème** | Le seuil fiscal de 40 % de télétravail et la limite de 10 jours de missions imposent un suivi précis depuis 2026 ; un dépassement change le pays d'imposition. |
| **Public cible** | 411 450 frontaliers (fin 2025), dont 239 431 résidant en France. |
| **Solution** | Journal de jours (bureau, télétravail, mission) en un geste, compteur de seuil, alertes, export pour l'employeur et la déclaration. |
| **Fonction principale** | Compteur « marge restante avant 40 % ». |
| **Fréquence estimée** | Hebdomadaire. |
| **Concurrents** | Tableurs, outils RH des employeurs, sites d'information frontaliers. |
| **Avantage potentiel** | Créneau très précis, règle récente et contraignante ; possible offre B2B aux employeurs. |
| **Difficulté technique** | Faible à moyenne. |
| **Coût estimé du MVP** | 5–8 semaines-personne · < CHF 2 000 |
| **Modèle économique** | B2C ~CHF 3.90/mois ou B2B par salarié (hypothèse). |
| **Risques majeurs** | Marché limité ; les employeurs peuvent internaliser ; règles susceptibles d'évoluer. |
| **Notes** | Problème 7 (O) · Marché 5 (O) · Fréquence 6 (E) · Concurrence faible 8 (E) · Monétisation 6 (E) · Faisabilité 8 (E) · Croissance 5 (E) · Lancement 8 (E) |
| **Sources** | S6, S7 |

### 5. Relais — Coordination des proches aidants (64.5/100)

| | |
|---|---|
| **Problème** | Environ 600 000 personnes en Suisse aident un proche : coordination entre frères et sœurs, médicaments, rendez-vous, démarches et épuisement. |
| **Public cible** | Actifs 40–65 ans qui s'occupent d'un parent âgé. |
| **Solution** | Journal partagé, planning de relais, suivi des traitements, check-lists administratives (allocations, aides cantonales). |
| **Fonction principale** | Planning de relais partagé avec notifications. |
| **Fréquence estimée** | Quotidienne à hebdomadaire. |
| **Concurrents** | Jointly (UK), Caring Village, Lotsa Helping Hands, WhatsApp, offres Pro Senectute / Spitex. |
| **Avantage potentiel** | Intégration des dispositifs cantonaux suisses ; canal B2B2C (employeurs, communes, assureurs). |
| **Difficulté technique** | Moyenne ; données de santé = exigences de protection renforcées. |
| **Coût estimé du MVP** | 10–14 semaines-personne · CHF 3 000–6 000 (sécurité, juridique) |
| **Modèle économique** | Faible disposition à payer en B2C ; plutôt B2B2C (cycle de vente long). |
| **Risques majeurs** | Monétisation lente ; données sensibles ; cycle de vente institutionnel. |
| **Notes** | Problème 9 (O) · Marché 5 (O) · Fréquence 8 (E) · Concurrence faible 7 (E) · Monétisation 4 (E) · Faisabilité 7 (E) · Croissance 4 (E) · Lancement 6 (E) |
| **Sources** | S21 |

### 6. Grüezi — Coach de langue locale par situations réelles (64.0/100)

| | |
|---|---|
| **Problème** | Plus d'un quart des résidents sont étrangers ; le suisse allemand n'est pas couvert par les grandes apps, et les situations concrètes (régie, médecin, école) manquent. |
| **Public cible** | Expatriés et nouveaux arrivants, Romands travaillant en Suisse alémanique. |
| **Solution** | Conversations IA vocales sur des scénarios suisses, dialectes, vocabulaire administratif. |
| **Fonction principale** | Jeu de rôle vocal « appeler la régie ». |
| **Fréquence estimée** | Quotidienne. |
| **Concurrents** | Duolingo, Babbel, apps de dialecte de niche, cours privés. |
| **Avantage potentiel** | Contenu suisse spécifique et dialectes. |
| **Difficulté technique** | Moyenne : voix, qualité des dialectes, peu de données d'entraînement. |
| **Coût estimé du MVP** | 8–12 semaines-personne · CHF 2 000–5 000 (voix) |
| **Modèle économique** | Abonnement ~CHF 9.90/mois (hypothèse). |
| **Risques majeurs** | Qualité IA sur les dialectes ; marché des apps de langue saturé et rétention faible. |
| **Notes** | Problème 6 (E) · Marché 5 (O) · Fréquence 9 (E) · Concurrence faible 7 (E) · Monétisation 6 (E) · Faisabilité 6 (E) · Croissance 6 (E) · Lancement 6 (E) |
| **Sources** | S8, S9 |

### 7. Partage — Dépenses partagées pour colocations et couples (62.0/100)

| | |
|---|---|
| **Problème** | Splitwise a restreint son offre gratuite (environ 3–4 dépenses/jour) et suscite des plaintes ; les colocations ont des frais récurrents. |
| **Public cible** | Colocataires, couples, groupes de voyage. |
| **Solution** | Partage illimité, frais récurrents, remboursement en un clic (lien de paiement). |
| **Fonction principale** | Solde du groupe et remboursement en un clic. |
| **Fréquence estimée** | Hebdomadaire. |
| **Concurrents** | Tricount (gratuit, bunq), Splitwise, Settle Up, Kittysplit. |
| **Avantage potentiel** | Faible : Tricount reste gratuit et bien installé. |
| **Difficulté technique** | Faible. |
| **Coût estimé du MVP** | 4–6 semaines-personne · < CHF 1 500 |
| **Modèle économique** | Difficile : la référence du marché est gratuite. |
| **Risques majeurs** | Aucune différenciation durable ; monétisation faible. |
| **Notes** | Problème 6 (E) · Marché 7 (E) · Fréquence 7 (E) · Concurrence faible 4 (O) · Monétisation 3 (E) · Faisabilité 9 (E) · Croissance 7 (E) · Lancement 9 (E) |
| **Sources** | S15, S16 |

### 8. Franchise — Optimiseur continu de l'assurance-maladie (60.5/100)

| | |
|---|---|
| **Problème** | Prime moyenne de 412 CHF/mois en 2027 (+5,0 %) ; choix de franchise et de modèle mal optimisé ; remboursements oubliés. |
| **Public cible** | Assurés LAMal sensibles au prix. |
| **Solution** | Suivi des dépenses de santé, simulateur de franchise basé sur l'usage réel, rappels de résiliation, suivi des remboursements. |
| **Fonction principale** | « Ta franchise idéale pour l'an prochain » calculée sur tes vraies dépenses. |
| **Fréquence estimée** | Faible : pic annuel en octobre-novembre. |
| **Concurrents** | Priminfo (OFSP, gratuit), Comparis, bonus.ch, courtiers. |
| **Avantage potentiel** | Continuité sur l'année ; mais comparateurs gratuits et très connus. |
| **Difficulté technique** | Moyenne (données de primes publiques, factures santé). |
| **Coût estimé du MVP** | 6–10 semaines-personne · < CHF 3 000 |
| **Modèle économique** | Commissions de courtage (réglementées, conflit d'intérêts) ou abonnement. |
| **Risques majeurs** | Saisonnalité extrême ; comparateurs gratuits ; dépendance aux commissions. |
| **Notes** | Problème 8 (O) · Marché 8 (O) · Fréquence 3 (E) · Concurrence faible 5 (E) · Monétisation 6 (E) · Faisabilité 6 (E) · Croissance 5 (E) · Lancement 6 (E) |
| **Sources** | S3, S4, S5, S28 |

### 9. Révise — Coach de révision IA à partir des cours (59.5/100)

| | |
|---|---|
| **Problème** | Préparer les examens à partir de supports volumineux ; planification et mémorisation. |
| **Public cible** | Étudiants HES et universités (~167 700 en universités en 2022/23). |
| **Solution** | Import de cours → fiches, quiz, répétition espacée, planning d'examens. |
| **Fonction principale** | PDF de cours → quiz adaptatif. |
| **Fréquence estimée** | Quotidienne en période d'examens. |
| **Concurrents** | Quizlet, Anki, Knowt, NotebookLM (gratuit), ChatGPT. |
| **Avantage potentiel** | Faible : les géants offrent la même chose gratuitement. |
| **Difficulté technique** | Moyenne. |
| **Coût estimé du MVP** | 6–10 semaines-personne · < CHF 3 000 |
| **Modèle économique** | Abonnement étudiant ~CHF 4.90/mois (hypothèse), faible pouvoir d'achat. |
| **Risques majeurs** | Concurrence gratuite massive ; saisonnalité. |
| **Notes** | Problème 7 (E) · Marché 6 (O) · Fréquence 8 (E) · Concurrence faible 2 (E) · Monétisation 4 (E) · Faisabilité 7 (E) · Croissance 6 (E) · Lancement 7 (E) |
| **Sources** | S23 |

### 10. Fixe — Contrôle des abonnements et contrats (59.0/100)

| | |
|---|---|
| **Problème** | La hausse des coûts fixes est le premier facteur d'incertitude financière cité par les Suisses ; abonnements et contrats oubliés. |
| **Public cible** | Actifs 25–45 ans multi-abonnés. |
| **Solution** | Détection des abonnements via multibanking bLink, échéances de résiliation, lettres de résiliation générées. |
| **Fonction principale** | Liste des contrats avec date limite de résiliation. |
| **Fréquence estimée** | Mensuelle. |
| **Concurrents** | Multibanking PostFinance et banques, Revolut, Finanzguru (DE), tableurs. |
| **Avantage potentiel** | Résiliation guidée et contexte suisse ; accès bLink à négocier. |
| **Difficulté technique** | Élevée : accès bLink pour un tiers non bancaire, sécurité financière. |
| **Coût estimé du MVP** | 12–18 semaines-personne · CHF 5 000–15 000 (conformité, accès bancaires) |
| **Modèle économique** | Abonnement ~CHF 4.90/mois (hypothèse) ou commissions de changement d'offre. |
| **Risques majeurs** | Accès aux données bancaires ; les banques intègrent la fonction gratuitement. |
| **Notes** | Problème 7 (O) · Marché 7 (E) · Fréquence 5 (E) · Concurrence faible 6 (E) · Monétisation 6 (E) · Faisabilité 4 (O) · Croissance 6 (E) · Lancement 4 (E) |
| **Sources** | S13, S28 |

### 11. Panier — Planificateur de repas anti-gaspillage aux prix suisses (57.5/100)

| | |
|---|---|
| **Problème** | Environ 310 kg de pertes alimentaires par personne et par an toutes étapes confondues ; courses chères ; « on mange quoi ce soir ». |
| **Public cible** | Familles et couples actifs. |
| **Solution** | Menus hebdomadaires selon les promotions Migros/Coop/Lidl/Aldi/Denner, liste de courses, recettes à partir des restes. |
| **Fonction principale** | Menu de la semaine optimisé selon les actions. |
| **Fréquence estimée** | Hebdomadaire. |
| **Concurrents** | Kitchen Stories, Mealime, Profital, apps Migros/Coop, Too Good To Go. |
| **Avantage potentiel** | Prix et promotions suisses ; mais données sans API officielle. |
| **Difficulté technique** | Élevée côté données (prix et promotions). |
| **Coût estimé du MVP** | 10–14 semaines-personne · CHF 2 000–5 000 |
| **Modèle économique** | Abonnement ou affiliation enseignes (hypothèse). |
| **Risques majeurs** | Accès aux données de prix ; les enseignes ont leurs propres apps. |
| **Notes** | Problème 6 (O) · Marché 7 (E) · Fréquence 8 (E) · Concurrence faible 5 (E) · Monétisation 4 (E) · Faisabilité 4 (E) · Croissance 6 (E) · Lancement 4 (E) |
| **Sources** | S22 |

### 12. Bienvenue — Parcours d'installation en Suisse (57.0/100)

| | |
|---|---|
| **Problème** | S'installer implique commune, permis, LAMal sous 3 mois, banque, Serafe, impôt à la source : beaucoup d'erreurs coûteuses. |
| **Public cible** | Nouveaux arrivants (solde migratoire 70 400 en 2025) et services RH/relocation. |
| **Solution** | Check-list personnalisée par canton, délais, modèles de documents. |
| **Fonction principale** | Plan d'installation personnalisé. |
| **Fréquence estimée** | Ponctuelle (3–6 mois). |
| **Concurrents** | Agences de relocation, guides en ligne, sites cantonaux. |
| **Avantage potentiel** | Excellent canal d'acquisition pour un produit récurrent. |
| **Difficulté technique** | Faible. |
| **Coût estimé du MVP** | 4–6 semaines-personne · < CHF 1 500 |
| **Modèle économique** | Paiement unique ou B2B RH. |
| **Risques majeurs** | Usage ponctuel, pas de rétention. |
| **Notes** | Problème 8 (E) · Marché 5 (O) · Fréquence 2 (E) · Concurrence faible 6 (E) · Monétisation 5 (E) · Faisabilité 8 (E) · Croissance 5 (E) · Lancement 8 (E) |
| **Sources** | S8 |

### 13. Équipe — Organisation de sport entre amis (54.5/100)

| | |
|---|---|
| **Problème** | Trouver des joueurs, réserver, partager les frais pour foot à 5, padel, volley. |
| **Public cible** | Sportifs amateurs 20–40 ans. |
| **Solution** | Présences, rappels, partage des frais, remplaçants. |
| **Fonction principale** | « Il manque 1 joueur » → notification au réseau. |
| **Fréquence estimée** | Hebdomadaire. |
| **Concurrents** | Spond (gratuit), Playtomic, Heja, WhatsApp, Doodle. |
| **Avantage potentiel** | Faible. |
| **Difficulté technique** | Faible. |
| **Coût estimé du MVP** | 5–8 semaines-personne · < CHF 1 500 |
| **Modèle économique** | Commissions de réservation (hypothèse). |
| **Risques majeurs** | Marché couvert par des acteurs gratuits. |
| **Notes** | Problème 5 (E) · Marché 6 (E) · Fréquence 7 (E) · Concurrence faible 2 (E) · Monétisation 3 (E) · Faisabilité 8 (E) · Croissance 7 (E) · Lancement 7 (E) |
| **Sources** | aucune source spécifique : notes entièrement estimées |

### 14. Ticket — Coffre à tickets et garanties (44.0/100)

| | |
|---|---|
| **Problème** | Tickets perdus au moment d'une panne ; garanties et délais de retour oubliés. |
| **Public cible** | Grand public. |
| **Solution** | Scan des tickets, rappels de fin de garantie, aide au retour. |
| **Fonction principale** | Rappel avant fin de garantie. |
| **Fréquence estimée** | Faible. |
| **Concurrents** | Tickets numériques Migros/Coop, apps de scan, e-mails. |
| **Avantage potentiel** | Faible. |
| **Difficulté technique** | Faible. |
| **Coût estimé du MVP** | 3–5 semaines-personne · < CHF 1 000 |
| **Modèle économique** | Faible disposition à payer. |
| **Risques majeurs** | Usage rare ; fonction intégrable dans un produit plus large. |
| **Notes** | Problème 4 (E) · Marché 6 (E) · Fréquence 2 (E) · Concurrence faible 5 (E) · Monétisation 2 (E) · Faisabilité 8 (E) · Croissance 4 (E) · Lancement 8 (E) |
| **Sources** | aucune source spécifique : notes entièrement estimées |

### 15. Trajet — Optimiseur d'abonnements de transport (43.0/100)

| | |
|---|---|
| **Problème** | Choisir entre demi-tarif, AG, billets dégriffés et abonnements régionaux sans connaître son usage réel. |
| **Public cible** | Pendulaires et voyageurs réguliers. |
| **Solution** | Historique des trajets → recommandation d'abonnement, alertes de billets dégriffés. |
| **Fonction principale** | « Ton abonnement idéal » d'après tes trajets. |
| **Fréquence estimée** | Faible à mensuelle. |
| **Concurrents** | App CFF, calculateurs en ligne. |
| **Avantage potentiel** | Faible ; dépend des données de l'opérateur. |
| **Difficulté technique** | Moyenne (accès aux historiques). |
| **Coût estimé du MVP** | 5–8 semaines-personne · < CHF 1 500 |
| **Modèle économique** | Faible disposition à payer. |
| **Risques majeurs** | Dépendance aux CFF ; usage rare. |
| **Notes** | Problème 4 (E) · Marché 6 (E) · Fréquence 4 (E) · Concurrence faible 4 (E) · Monétisation 2 (E) · Faisabilité 6 (E) · Croissance 4 (E) · Lancement 6 (E) |
| **Sources** | aucune source spécifique : notes entièrement estimées |

## 6. Hypothèses critiques à valider

Voir aussi la section 07 du tableau de bord.

| # | Hypothèse | Méthode | Seuil de succès |
|---|---|---|---|
| H1 | Le courrier administratif fait partie des 3 corvées les plus pénibles pour au moins 40 % des 25–45 ans en Suisse romande | 20 entretiens + questionnaire (n ≥ 200) | ≥ 40 % le citent dans leur top 3 |
| H2 | Les gens acceptent de photographier leurs courriers dans une app tierce | Prototype testé par 15 personnes | ≥ 10/15 importent au moins 3 courriers |
| H3 | L'IA extrait correctement l'échéance et le montant | Corpus de 100+ courriers anonymisés (FR/DE/IT) | ≥ 97 % de précision par champ |
| H4 | Au moins 4 % des inscrits paient ~CHF 5.90/mois | Landing page + liste d'attente + prévente | ≥ 300 inscrits et ≥ 30 préventes |
| H5 | Usage récurrent d'au moins 3 courriers par mois | Bêta fermée de 50 utilisateurs pendant 6 semaines | Rétention S4 ≥ 35 % |

## 7. Sources

| ID | Donnée | Éditeur | Date | Fiabilité |
|---|---|---|---|---|
| S1 | [Le taux de logements vacants passe sous la barre des 1% en 2026 (0,93 %, 45 493 logements)](https://www.admin.ch/fr/newnsb/kgvqAd91MYZr) | OFS / admin.ch | 2026-09-10 | Élevée |
| S2 | [Le taux de logements vacants est tombé à 1% en 2025 (Genève 0,34 %, Zurich 0,48 %)](https://www.admin.ch/fr/newnsb/4EOYzS4sVwTFlKxWvUEiR) | OFS / admin.ch | 2025-09-09 | Élevée |
| S3 | [Les primes d'assurance-maladie augmentent de 4,4 % en moyenne (393,30 CHF/mois en 2026)](https://www.bag.admin.ch/fr/newnsb/d2okh_kUK_OFhmMDfpyiy) | OFSP | 2025-09-23 | Élevée |
| S4 | [Nouvelle envolée des primes maladie en 2027, de 5,0 % (412 CHF/mois) — dépêche AWP/ATS citant l'OFSP](https://allnews.ch/node/159784) | allnews.ch | 2026-09 | Moyenne (reprise presse) |
| S5 | [Prévision bonus.ch : 32 % des assurés envisagent de résilier leur caisse pour 2026 (17 % en 2025)](https://www.pressetext.com/news/assurance-maladie-un-tiers-de-la-population-suisse-envisage-de-quitter-sa-caisse-en-2026.html) | pressetext / bonus.ch | 2025 | Moyenne (intention, pas comportement) |
| S6 | [Frontaliers : 411 450 fin 2025 dont 239 431 résidents français (record)](https://www.tresor.economie.gouv.fr/Articles/2026/02/20/suisse-veille-economique-et-financiere-du-15-au-21-fevrier) | DG Trésor (France) | 2026-02-20 | Élevée (reprend l'OFS) |
| S7 | [Imposition du télétravail des frontaliers : seuil 40 %, 10 jours de missions, suivi employeur dès 2026](https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres) | État de Genève | 2026 | Élevée |
| S8 | [Population résidante permanente 9 127 100 au 31.12.2025 ; population étrangère +1,9 %](https://www.admin.ch/fr/newnsb/acGCTisDEW60tUk1jSz4Z) | OFS / admin.ch | 2026-08 | Élevée |
| S9 | [Part de la population étrangère : 26,0 % (2022)](https://www.atlas.bfs.admin.ch/core/projects/13/xshared/pdf/27125_132.pdf) | Atlas statistique OFS | 2022 | Élevée (donnée ancienne) |
| S10 | [ePost : boîte aux lettres numérique de La Poste, gratuite, options payantes (scan) ; >170 000 particuliers revendiqués](https://epost.ch/en/about-us) | ePost Service SA | non daté | Moyenne (déclaratif, non daté) |
| S11 | [Marché des lettres : ~1,5 milliard d'envois en 2025, –20 % depuis 2021](https://allnews.ch/node/156009) | PostCom via AWP | 2026 | Moyenne (reprise presse) |
| S12 | [eBill dépasse 4 millions d'utilisateurs (≈ moitié des adultes) ; ~93 M transactions en 2025](https://www.six-group.com/fr/newsroom/media-releases/2026/20260826-ebill-surpasses-four-million-user-mark.html) | SIX | 2026-08-26 | Élevée |
| S13 | [Lancement du multibanking bLink pour les particuliers](https://www.six-group.com/fr/newsroom/media-releases/2025/20251125-multibanking-launch.html) | SIX | 2025-11-25 | Élevée |
| S14 | [Apps « scan de lettres officielles + IA » existantes (BriefAI, Papeer, PaperlessHero…) — ciblent surtout les USA](https://appgoblin.info/apps/6757674090) | App Store / AppGoblin | 2025–2026 | Faible (fiches éditeurs) |
| S15 | [Splitwise : plafond d'environ 3–4 dépenses/jour en gratuit + délai de 10 s, plaintes d'utilisateurs](https://au.trustpilot.com/review/splitwise.com) | Trustpilot / ITVoice | 2025 | Moyenne (avis + presse ; chiffre exact variable) |
| S16 | [bunq rachète Tricount (5,4 M d'utilisateurs à l'époque)](https://www.moneyvox.fr/banque-en-ligne/actualites/88259/neobanque-bunq-s-offre-tricount-et-ses-5,4-millions-utilisateurs) | MoneyVox | 2022-05 | Élevée (donnée ancienne) |
| S17 | [Ohai.ai : seed 6 M$ (2024) + tour stratégique 2025 ; assistant IA de charge mentale familiale](https://pulse2.com/ohai-ai-investment-raised-to-help-parents-reduce-mental-load) | Pulse 2.0 / FemTech Insider | 2025-08 | Moyenne |
| S18 | [Faye : pré-seed 2,5 M$ (Unusual Ventures) pour la gestion de la charge mentale du foyer](https://www.vcaonline.com/news/2025043010/faye-secures-2-5m-to-transform-how-modern-households-manage-the-mental-load/) | VCA Online | 2025-04-30 | Moyenne |
| S19 | [PAM (NZ) lève 570 k NZD : IA qui transforme captures et e-mails d'école en tâches familiales](https://cmotech.asia/story/pam-secures-nzd-570-000-to-launch-family-admin-app-in-the-us) | CMOtech Asia | 2025 | Moyenne |
| S20 | [Baromètre Ifop femmes actives : 71 % ressentent une charge mentale élevée, 41 % se sentent dépassées](https://www.ifop.com/wp-content/uploads/2024/12/CP-VDEF_NewsRSE-Barometre-05122024.pdf) | Ifop | 2024-12-05 | Élevée (France) |
| S21 | [Proches aidants : ~600 000 personnes (OFSP) ; ~1 actif sur 5 soutient un proche adulte](https://www.swissinfo.ch/fre/economie/en-suisse-des-proches-aidants-en-mal-de-reconnaissance/48382534) | swissinfo / Travail.Suisse–BFH | 2019–2024 | Moyenne (estimations, méthodes différentes) |
| S22 | [Gaspillage alimentaire : ~310 kg/pers./an toutes étapes (ZHAW/OFEV, rapport intermédiaire 2025)](https://www.versoix.ch/media/document/2/gaspillage_alimentaire_infographie_foodwaste_2026.pdf) | foodwaste.ch (infographie 2026) | 2026 | Moyenne |
| S23 | [Étudiants : ~167 700 en hautes écoles universitaires (2022/23)](https://dam-api.bfs.admin.ch/hub/api/dam/assets/24905543/master) | OFS | 2023 | Élevée (donnée ancienne) |
| S24 | [State of Subscription Apps 2025 : ~30 % des abonnements annuels annulés le 1er mois ; apps IA 0,63 $/install à J60](https://www.revenuecat.com/state-of-subscription-apps-2025/) | RevenueCat | 2025-03 | Élevée (75 000+ apps) |
| S25 | [Édition 2026 : conversion médiane J35 — paywall strict 10,7 % vs freemium 2,1 %](https://ppc.land/ai-apps-earn-41-more-per-user-but-churn-30-faster-revenuecat-finds/) | RevenueCat via presse | 2026 | Moyenne (reprise secondaire) |
| S26 | [Groupes WhatsApp de parents : surcharge d'informations et pression sociale (qualitatif)](https://wnyc.org/story/nyc-parents-on-school-whatsapp-group-chats-oh-my-god-its-hell) | La Libre / WNYC | 2024–2025 | Faible à moyenne (qualitatif) |
| S27 | [e-ID étatique acceptée à 50,4 % le 28.09.2025 ; lancement annoncé pour fin 2026 (date incertaine)](https://www.mondaq.com/data-protection/1684898/switzerland-says-yes-to-e-id-digital-identity-is-on-its-way) | Mondaq / heise | 2025–2026 | Moyenne (date de lancement à vérifier) |
| S28 | [Comparis : 1 personne sur 3 a eu du mal à payer ses primes en 2024 ; hausse des coûts fixes = 1er facteur d'incertitude 2026](https://res.cloudinary.com/comparis-cms/image/upload/v1766411525/press/fr/2025/12/20251212_MM_Fincancial_Outlook_FR_fsrxmf.pdf) | Comparis (Innofact) | 2024-12 / 2025-12 | Moyenne-élevée (sondage représentatif) |
| S29 | [Scénarios des ménages : 4,1 millions de ménages privés en 2025, 4,5 millions dans dix ans](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36197485/master) | OFS, Actualités OFS | 2025-10 | Élevée |
| S30 | [Langue principale : allemand 61,0 %, français 22,3 % (enquête 2024)](https://www.fr.ch/deef/ssd/statistiques-par-themes/langues-et-religions) | OFS via État de Fribourg | 2025 | Élevée (reprise cantonale) |
| S31 | [Immigration 2025 : ~165 000 nouveaux résidents permanents étrangers, ~83 000 départs](https://www.admin.ch/fr/newnsb/iiAHV0k5TFjK) | SEM / admin.ch | 2026-01-26 | Élevée (provisoire) |
| S32 | [Digimonitor 2025 : 60 % des 15–75 ans utilisent l'IA au moins occasionnellement (79 % des 15–34 ans)](https://allnews.ch/node/143055) | IGEM / REMP via allnews | 2025 | Moyenne-élevée |
| S33 | [Datenvertrauensstudie 2025 : confiance dans les fournisseurs d'IA 4,3/10 contre 7,2 pour les banques et 7,0 pour les autorités ; usage de l'IA 52,9 %](https://www.netzwoche.ch/news/2025-10-30/schweizer-bevoelkerung-vertraut-ki-etwas-mehr-und-dem-datenschutz-etwas-weniger) | Comparis (Innofact, n = 1 049) | 2025-10 | Moyenne-élevée |
| S34 | [Postera : explication de courriers officiels allemands, 16 langues, Pro 6,99 €/mois ou 59,99 €/an](https://apps.apple.com/app/id6768274889) | App Store | consulté 2026-10-28 | Faible (fiche éditeur) |
| S35 | [xPlainly : explication, dossiers, échéances, paiement ; 5 analyses 3,99 $, plan annuel 24,99 $ ; serveurs à Francfort](https://apps.apple.com/app/xplainly/id6764679503) | App Store | consulté 2026-10-28 | Faible (fiche éditeur) |
| S36 | [Totoy (Vienne) lève 500 k€ pour son IA de simplification de documents officiels ; offre grand public et administrations](https://finder.techleap.nl/news/feed/totoy-secures-500k-for-document-ai) | Techleap | 2024-10 | Moyenne |
| S37 | [Swisscom myAI : assistant IA grand public, version de base gratuite, Pro 14,90 CHF/mois dès 2026](https://www.swisscom.ch/fr/about/news/2025/09/24-myai.html) | Swisscom | 2025-09-24 | Élevée |
| S38 | [Doccle (Belgique) : boîte administrative numérique, 2,6 à 3,5 M d'utilisateurs revendiqués](https://apps.apple.com/be/app/doccle/id970053203) | App Store / Doccle | 2025 | Faible à moyenne (déclaratif) |
| S39 | [Digiposte (La Poste France) : coffre-fort numérique, plus de 10 M d'utilisateurs revendiqués](https://www.laposte.fr/particulier/digiposte/tous-mes-documents-partout-et-tout-le-temps) | La Poste | non daté | Faible à moyenne (déclaratif) |
| S40 | [Volders rachète Aboalarm : ~10 M€ de chiffre d'affaires annuel cumulé, 2 M+ utilisateurs revendiqués (résiliation de contrats)](https://www.appgefahren.de/aboalarm-berliner-startup-volders-kauft-bekannten-kuendigungsservice-329400.html) | appgefahren / netzwelt | non daté | Faible à moyenne |
| S41 | [Record de 3 306 997 commandements de payer en 2024 (3 048 529 en 2023)](https://econostrum.info/suisse/?p=102870) | Econostrum citant l'OFS | 2025 | Moyenne (reprise secondaire) |
| S42 | [France : 61 % des usagers ont rencontré des difficultés dans leurs démarches administratives (Défenseur des droits / Ipsos, n = 5 030)](https://www.banquedesterritoires.fr/en-2024-61-des-usagers-sondes-rencontrent-des-difficultes-dans-leurs-demarches-administratives) | Banque des Territoires | 2025-10 | Élevée |
| S43 | [Le Conseil fédéral ratifiera la convention du Conseil de l'Europe sur l'IA ; avant-projet de loi attendu fin 2026](https://www.bj.admin.ch/fr/intelligence-artificielle) | Office fédéral de la justice | 2025-02-12 | Élevée |

Les noms de concurrents cités sans source (Cozi, Homegate, Tricount, Duolingo…) relèvent de la connaissance générale du marché et n'ont pas été revérifiés individuellement en octobre 2026.
