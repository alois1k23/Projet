# MARKET_STUDY — Clair, copilote du courrier administratif suisse

> Étude réalisée le 28 octobre 2026. Marché prioritaire : Suisse romande, puis toute la Suisse et la francophonie.
> Références S1 à S43 : voir la section 13 et `dashboard/data.js`.
> Convention : **(O)** = donnée publiée et sourcée ; **(H)** = hypothèse de travail à valider.

## 1. Résumé exécutif

1. **Le besoin est réel et s'aggrave.** Les dépenses contraintes augmentent : prime moyenne LAMal d'environ 412 CHF/mois en 2027, +5,0 % (O, S4). Une personne sur trois a eu du mal à payer ses primes en 2024 (O, S28). On a enregistré un record de 3,3 millions de commandements de payer en 2024 (O, S41). Chaque courrier mal compris ou oublié coûte de l'argent.
2. **Le marché est grand, et le marché de départ réaliste est modeste.**
   - TAM : 4,1 millions de ménages (O, S29), soit environ CHF 200 M/an au prix hypothétique de CHF 49/an.
   - Marché de départ (ménages francophones déjà utilisateurs d'IA) : environ 550 000 ménages, soit environ CHF 27 M/an (H, calcul section 3).
   - Objectif à 3 ans : 5 500 à 16 500 ménages payants, soit CHF 0,27 à 0,81 M de revenu annuel récurrent (H).
3. **La fonction « expliquer un courrier » n'est plus différenciante.** J'ai trouvé au moins cinq apps récentes qui le font en Allemagne, en Autriche et aux États-Unis : Postera, xPlainly, Totoy (O, S34–S36), ainsi que Briefly AI et Bureaucracy Buddy (fiches éditeurs). Postera et xPlainly n'ont pas encore assez d'avis pour afficher une note sur l'App Store, aucune ne cible la Suisse, et seule Totoy a une levée de fonds publique (500 k€). **J'ai donc abaissé la note de Clair de 77,5 à 75,5.** Clair reste premier, mais l'avantage doit venir d'ailleurs.
4. **La confiance est le vrai champ de bataille.** Les Suisses accordent 4,3/10 aux fournisseurs d'IA, contre 7,2 aux banques et 7,0 aux autorités (O, S33). Pourtant 53 à 60 % utilisent déjà l'IA (O, S32, S33). Ils l'utilisent sans s'y fier : une marque suisse de confiance a une place à prendre.
5. **Les modèles qui ont réussi ailleurs s'appuient sur les expéditeurs ou sur l'action.** Doccle en Belgique (2,6 à 3,5 M d'utilisateurs revendiqués) et Digiposte en France (plus de 10 M revendiqués) reçoivent les documents directement des institutions (S38, S39). Volders et Aboalarm, en Allemagne, réalisent environ 10 M€ de chiffre d'affaires sur la seule résiliation de contrats (S40).

**Conclusion :** je maintiens Clair, avec un positionnement précisé. Pas « une IA qui explique vos lettres », mais **« le gestionnaire administratif de confiance des ménages suisses »**. Il se défend par la profondeur suisse, la confiance et la distribution via des partenaires.

---

## 2. Définition du marché

| Élément | Périmètre retenu |
|---|---|
| Besoin | Comprendre, suivre et traiter le courrier administratif d'un ménage : factures, assurances, impôts, commune, bailleur, employeur |
| Produit | App mobile + web : scan ou import → explication → échéance → action (rappel, paiement, réponse) |
| Client payant | Le ménage (abonnement individuel ou famille) |
| Zone | Suisse romande au lancement, Suisse alémanique en V1, francophonie ensuite |
| Hors périmètre | Comptabilité des indépendants et PME (Klara, Bexio), conseil juridique ou fiscal personnalisé |

---

## 3. Taille du marché

### Calcul

| Niveau | Définition | Ménages | Valeur annuelle à CHF 49 (H) | Base |
|---|---|---:|---:|---|
| **TAM** | Tous les ménages privés suisses | 4 100 000 | ≈ CHF 201 M | 4,1 M de ménages en 2025 (O, S29) |
| **SAM** | Ménages déjà utilisateurs d'IA | ≈ 2 460 000 | ≈ CHF 121 M | × 60 % d'utilisateurs d'IA (O, S32) |
| **SAM initial** | Même cible en Suisse romande | ≈ 549 000 | ≈ CHF 27 M | × 22,3 % de francophones (O, S30) |
| **SOM à 3 ans** | Part conquise | 5 500 – 16 500 | CHF 0,27 – 0,81 M | 1 à 3 % du SAM initial (H) |

### Limites de ce calcul
- La part de francophones (22,3 %) est une part de **personnes**. Je l'applique aux ménages, ce qui est une approximation.
- L'usage de l'IA est mesuré chez les 15–75 ans internautes (S32). Il sert ici d'indicateur de maturité numérique, pas de preuve d'intérêt pour Clair.
- Le prix de CHF 49/an est une hypothèse à tester (section 8).
- Le SOM est un objectif d'ordre de grandeur. Il ne découle d'aucune mesure de demande.

### Leviers d'extension (non comptés)
- Suisse alémanique : environ 61 % de la population a l'allemand pour langue principale (O, S30).
- Francophonie (France, Belgique) : en France, 61 % des usagers déclarent avoir rencontré des difficultés dans leurs démarches administratives (O, S42). Ces marchés ont déjà des acteurs installés (Digiposte, Doccle).
- Offres B2B2C (employeurs, relocation) et B2G (communes qui veulent simplifier leurs courriers, comme le fait Totoy) : voir section 10.

---

## 4. Demande : ce que disent les données

| Signal | Donnée | Lecture pour Clair |
|---|---|---|
| Pression sur les coûts fixes | Primes 393,30 CHF/mois en 2026 (+4,4 %), environ 412 en 2027 (+5,0 %) (O, S3, S4) | Chaque automne, des millions de ménages reçoivent leur nouvelle prime et doivent décider avant le 30 novembre |
| Difficulté à payer | 1 personne sur 3 a eu du mal à payer ses primes en 2024 ; coûts fixes = 1er facteur d'incertitude pour 2026 (O, S28) | Les échéances et les rappels comptent vraiment |
| Recouvrement | 3 306 997 commandements de payer en 2024, record (O, S41) | Indicateur d'impayés. Tous ne viennent pas de courriers oubliés : c'est un signal, pas une mesure de notre marché |
| Intention d'agir | 32 % envisageaient de changer de caisse pour 2026 (intention, S5) | Moment fort d'acquisition chaque automne |
| Volume de courrier | ~1,5 milliard de lettres en 2025, –20 % depuis 2021 (O, S11) | Le papier recule mais reste massif. Clair doit aussi traiter PDF et e-mails |
| Numérisation des paiements | eBill : plus de 4 M d'utilisateurs, ≈ moitié des adultes (O, S12) | Les Suisses acceptent de gérer leurs factures numériquement. Clair doit compléter eBill, pas le concurrencer |
| Adoption de l'IA | 60 % utilisent l'IA (O, S32) ; 52,9 % selon Comparis (O, S33) | Le geste « je demande à une IA » est acquis |
| Confiance | IA 4,3/10, banques 7,2, autorités 7,0 (O, S33) | Barrière principale : à traiter dans le produit et la marque |
| Diversité linguistique | 9,13 M d'habitants, environ 26 % d'étrangers (O, S8, S9) ; 165 000 nouveaux résidents permanents étrangers en 2025 (O, S31) | Le courrier dans une langue mal maîtrisée est fréquent |

**Ce qui manque encore :** aucune donnée suisse sur le temps passé ou les frais payés à cause du courrier administratif. C'est l'objet de l'enquête proposée en section 12.

---

## 5. Segments et personas

| Priorité | Segment | Taille | Douleur principale | Pourquoi maintenant |
|---|---|---|---|---|
| 1 | **Actifs romands débordés** (25–45 ans, souvent en couple avec enfants) | ≈ 550 000 ménages (H, section 3) | Volume, manque de temps, peur d'oublier | Hausse des primes, IA déjà adoptée |
| 2 | **Nouveaux arrivants** | ≈ 165 000 par an (O, S31) | Système inconnu, langue, démarches d'installation | Moment déclencheur clair, forte disposition à payer (H) |
| 3 | **Frontaliers** | 411 450 personnes (O, S6) | Courriers de deux pays, règles fiscales spécifiques | Nouvelles règles de télétravail depuis 2026 (O, S7) |
| 4 | **Enfants qui gèrent le courrier d'un parent âgé** | Non chiffré | Gérer à distance, sans tout voir | eBill progresse le plus chez les plus de 80 ans (+20 % en 2025, O, S12) |

### Personas (illustratifs, à valider en entretien)
- **Sophie, 38 ans, Lausanne**, cheffe de projet, deux enfants. Elle reçoit 15 à 20 courriers par mois (H). Elle a payé un rappel de facture l'an dernier et a raté la résiliation de sa caisse. Elle veut ne plus y penser.
- **Marco, 31 ans, arrivé de Milan à Genève.** Il reçoit ses courriers en français, parfois en allemand. Il ne sait pas si une lettre de l'administration fiscale demande une action. Il veut savoir « est-ce grave, et que dois-je faire ? ».
- **Claire, 52 ans, Fribourg.** Elle gère le courrier de sa mère de 81 ans et veut voir les échéances de sa mère à distance.

---

## 6. Paysage concurrentiel

### Carte des alternatives

| Catégorie | Acteurs | Prix | Force | Faiblesse | Menace pour Clair |
|---|---|---|---|---|---|
| Boîtes aux lettres numériques (CH) | ePost / KLARA (La Poste) | Gratuit, options payantes (O, S10) | Marque La Poste, confiance, émetteurs connectés | N'explique pas et n'agit pas ; dépend des expéditeurs | **Élevée si La Poste ajoute de l'IA** |
| Paiement numérique (CH) | eBill (SIX), apps bancaires | Gratuit | Plus de 4 M d'utilisateurs (O, S12) | Factures seulement, pas les autres courriers | Faible : complémentaire, intégration possible |
| Assistants IA généralistes | ChatGPT, Gemini, Swisscom myAI | Gratuit ; myAI Pro 14,90 CHF/mois (O, S37) | Déjà utilisés par plus de la moitié de la population | Pas de mémoire du ménage, pas de rappels, pas de règles suisses fiables | **Élevée** : « ça me suffit » |
| Apps d'explication de courriers (DE/AT/US) | Postera, xPlainly, Totoy, Briefly AI, BriefAI | 25 à 60 €/an (O, S34, S35) | Fonctions très proches des nôtres | Conçues pour d'autres pays, pas de traction visible | Moyenne : une pourrait s'adapter à la Suisse |
| Coffres-forts administratifs (étranger) | Doccle (BE), Digiposte (FR) | Gratuit à freemium | Millions d'utilisateurs, émetteurs connectés (S38, S39) | Hors Suisse | Faible en Suisse, forte en cas d'expansion francophone |
| Services de résiliation | Volders, Aboalarm (DE) | Gratuit à paiement à l'acte (S40) | Preuve que la résiliation se monétise | Hors Suisse | Faible ; modèle à imiter |
| Statu quo | Classeur, tableur, conjoint, fiduciaire | 0 à plusieurs centaines de CHF | Aucun changement d'habitude | Oublis, temps perdu | **Concurrent principal** |

Non vérifié : un profil Crunchbase mentionne « Swisshome AI », un assistant suisse de gestion des documents familiaux soutenu par un concours de startups. Je n'ai trouvé ni site ni produit public. À surveiller.

### Ce que je retiens
1. **Aucun leader** n'existe en Suisse sur « comprendre et traiter son courrier ».
2. **La fonction de base est copiable** en quelques semaines, comme le montrent les apps allemandes.
3. **Les gagnants à l'étranger** ont des expéditeurs connectés (Doccle, Digiposte) ou monétisent une action précise (Volders). Pas le résumé.

---

## 7. Positionnement et différenciation

| Copiable rapidement | Défendable dans la durée |
|---|---|
| Résumé d'un courrier par IA | Base de connaissances suisse : 26 cantons, LAMal, QR-facture, Serafe, régies, poursuites |
| Extraction d'une échéance | Taux d'erreur mesuré et publié sur de vrais courriers suisses |
| Traduction | Marque de confiance : hébergement en Suisse, chiffrement, aucune réutilisation des données |
| Export vers l'agenda | Partenariats de distribution (employeurs, relocation, assureurs, régies) |
| | Historique du ménage : plus on l'utilise, plus il est utile, plus il est difficile d'en partir |

**Énoncé de positionnement (proposition) :**
Pour les ménages en Suisse qui reçoivent trop de courriers administratifs, Clair est le gestionnaire administratif qui explique chaque courrier, rappelle chaque échéance et prépare chaque réponse. Contrairement à ChatGPT ou aux apps étrangères, il connaît les règles suisses, garde vos documents en Suisse et suit vos dossiers dans le temps.

---

## 8. Prix

### Références observées

| Offre | Prix annuel | Source |
|---|---:|---|
| ePost, ChatGPT gratuit, myAI de base | 0 | S10, S37 |
| xPlainly (plan annuel) | 24,99 USD | S35 |
| Postera Pro | 59,99 EUR (ou 6,99 €/mois) | S34 |
| Swisscom myAI Pro | 178,80 CHF (14,90 × 12) | S37 |
| **Clair (hypothèse)** | **49 CHF (ou 5.90/mois)** | — |

### Recommandation
- **Plage à tester : CHF 39 à 69 par an**, avec un plan Famille environ 50 % plus cher (H).
- **Gratuit limité** (par exemple 5 courriers par mois) pour l'acquisition. RevenueCat observe une conversion médiane de 2,1 % en freemium contre 10,7 % avec paywall strict (O, S25). On testera un essai gratuit court avec carte requise.
- **Achats ponctuels** : lettre de résiliation ou de contestation à l'unité (modèle Volders et Aboalarm) pour monétiser les non-abonnés.
- Mesure par la méthode de Van Westendorp dans l'enquête (section 12).

---

## 9. Distribution et calendrier

### Canaux

| Canal | Segment | Coût | Potentiel |
|---|---|---|---|
| Groupes Facebook d'expatriés et de Français en Suisse, r/askswitzerland, r/geneva | Nouveaux arrivants, frontaliers | Temps | 100 premiers utilisateurs |
| Contenu court (« je décode mon décompte LAMal ») | Actifs romands | Temps + production | Notoriété |
| SEO par type de courrier (« comprendre un avis de taxation vaudois ») | Tous | Temps | Acquisition durable |
| Parrainage via le plan Famille | Couples, enfants de parents âgés | Remise | Croissance organique |
| Agences de relocation et RH (avantage salarié) | Nouveaux arrivants | Commercial | 1 000 à 10 000 utilisateurs |
| Partenaires (régies, assureurs, néobanques) | Tous | Long à négocier | 10 000 et plus |

### Calendrier des pics de demande

| Période | Déclencheur |
|---|---|
| Fin septembre – 30 novembre | Nouvelles primes LAMal et délai de résiliation |
| Janvier – mars | Attestations, certificats de salaire, déclaration d'impôt (délais variables selon les cantons) |
| Tout au long de l'année | Arrivées en Suisse, déménagements, rappels |

**Conséquence :** il faut viser un lancement de bêta au plus tard en septembre 2027 pour profiter de la saison LAMal 2027. La saison 2026 se termine dans un mois et arrive trop tôt pour un produit sérieux.

---

## 10. Environnement réglementaire

| Sujet | Situation | Conséquence pour Clair |
|---|---|---|
| Protection des données | Loi fédérale sur la protection des données révisée (nLPD), en vigueur depuis le 1er septembre 2023 (connaissance générale, à vérifier sur fedlex) | Hébergement en Suisse ou dans un pays reconnu adéquat, information transparente, suppression et export des données, analyse d'impact |
| Régulation de l'IA | Le Conseil fédéral ratifiera la convention du Conseil de l'Europe ; avant-projet attendu fin 2026 (O, S43) | Transparence sur l'usage de l'IA dès le départ ; suivre la consultation |
| Conseil juridique | Clair informe, il ne donne pas de conseil personnalisé | Formulations prudentes, renvoi vers un professionnel au-delà d'un seuil, CGU relues par un juriste |
| Paiements | Initier un paiement touche à la réglementation financière | MVP : préparer le paiement et renvoyer vers l'app bancaire ou eBill, sans toucher l'argent |
| Fournisseur d'IA | Même Swisscom myAI s'appuie sur un modèle tiers hébergé chez AWS (O, S37) | Choisir un fournisseur avec traitement en Suisse ou en UE et sans réutilisation des données ; le documenter publiquement |

Ce tableau n'est pas un avis juridique. Une revue par un juriste spécialisé est à prévoir avant le lancement public.

---

## 11. SWOT

| Forces | Faiblesses |
|---|---|
| Besoin fréquent et sourcé | Fonction de base facile à copier |
| Spécificités suisses difficiles à imiter | Pas encore de marque ni de confiance |
| Coût de développement faible | Disposition à payer non mesurée |
| Usage récurrent toute l'année | Dépendance à la précision de l'IA |

| Opportunités | Menaces |
|---|---|
| Aucun leader en Suisse | La Poste ajoute de l'IA à ePost |
| e-ID, eBill et bLink comme briques d'intégration | Assistants généralistes « suffisants » |
| Hausse continue des primes et des coûts fixes | Une app allemande s'adapte à la Suisse |
| B2B2C (employeurs, relocation) et B2G (communes) | Méfiance envers l'IA (4,3/10) |

---

## 12. Valider la demande : plan et questionnaire

### Critères d'arrêt (fixés avant les tests)
- Moins de 25 % des répondants citent le courrier administratif dans leurs trois corvées les plus pénibles (H1).
- Précision d'extraction de l'échéance et du montant inférieure à 90 % sur le corpus (H3).
- Moins de 100 inscrits et moins de 10 préventes après 4 semaines de page d'attente active (H4).

Si l'un de ces seuils n'est pas atteint, on revient à la recommandation avec les alternatives.

### Questionnaire (environ 5 minutes, n ≥ 200, Suisse romande)
1. Combien de courriers administratifs recevez-vous par mois (papier, e-mail, PDF) ?
2. Classez ces corvées de la plus pénible à la moins pénible : courrier administratif, courses, ménage, budget, rendez-vous, impôts.
3. Au cours des 12 derniers mois, avez-vous… payé des frais de rappel ? manqué un délai ? reçu un courrier que vous n'avez pas compris ? reçu un courrier dans une langue que vous maîtrisez mal ?
4. Combien de temps y consacrez-vous par mois ?
5. Qui s'en occupe dans votre foyer ?
6. Avez-vous déjà utilisé ChatGPT ou une autre IA pour comprendre un courrier ? Qu'est-ce qui a manqué ?
7. Seriez-vous prêt·e à photographier vos courriers dans une app hébergée en Suisse ? (oui / sous conditions / non, et pourquoi)
8. Van Westendorp, en CHF par an : à quel prix Clair serait-il trop bon marché pour être sérieux ? une bonne affaire ? cher mais acceptable ? trop cher ?
9. Laissez votre e-mail pour tester la bêta (facultatif).

### Entretiens (20, 30 minutes)
Demander à la personne de montrer ses trois derniers courriers administratifs et de raconter ce qu'elle en a fait. Ne pas présenter Clair avant la fin de l'entretien.

---

## 13. Sources

Les sources S1 à S28 sont détaillées dans RESEARCH.md. Sources ajoutées pour cette étude :

| ID | Donnée | Éditeur | Date | Fiabilité |
|---|---|---|---|---|
| S29 | [4,1 M de ménages privés en 2025](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36197485/master) | OFS | 2025-10 | Élevée |
| S30 | [Langue principale : allemand 61,0 %, français 22,3 %](https://www.fr.ch/deef/ssd/statistiques-par-themes/langues-et-religions) | OFS via État de Fribourg | 2025 | Élevée |
| S31 | [Immigration 2025 : ~165 000 nouveaux résidents permanents étrangers](https://www.admin.ch/fr/newnsb/iiAHV0k5TFjK) | SEM | 2026-01 | Élevée (provisoire) |
| S32 | [Digimonitor 2025 : 60 % utilisent l'IA](https://allnews.ch/node/143055) | IGEM / REMP | 2025 | Moyenne-élevée |
| S33 | [Datenvertrauensstudie 2025 : confiance dans l'IA 4,3/10](https://www.netzwoche.ch/news/2025-10-30/schweizer-bevoelkerung-vertraut-ki-etwas-mehr-und-dem-datenschutz-etwas-weniger) | Comparis | 2025-10 | Moyenne-élevée |
| S34 | [Postera (App Store)](https://apps.apple.com/app/id6768274889) | App Store | consulté 2026-10-28 | Faible (fiche éditeur) |
| S35 | [xPlainly (App Store)](https://apps.apple.com/app/xplainly/id6764679503) | App Store | consulté 2026-10-28 | Faible (fiche éditeur) |
| S36 | [Totoy lève 500 k€](https://finder.techleap.nl/news/feed/totoy-secures-500k-for-document-ai) | Techleap | 2024-10 | Moyenne |
| S37 | [Swisscom myAI](https://www.swisscom.ch/fr/about/news/2025/09/24-myai.html) | Swisscom | 2025-09 | Élevée |
| S38 | [Doccle (App Store)](https://apps.apple.com/be/app/doccle/id970053203) | Doccle | 2025 | Faible à moyenne |
| S39 | [Digiposte](https://www.laposte.fr/particulier/digiposte/tous-mes-documents-partout-et-tout-le-temps) | La Poste (FR) | non daté | Faible à moyenne |
| S40 | [Volders rachète Aboalarm](https://www.appgefahren.de/aboalarm-berliner-startup-volders-kauft-bekannten-kuendigungsservice-329400.html) | appgefahren | non daté | Faible à moyenne |
| S41 | [3,3 M de commandements de payer en 2024](https://econostrum.info/suisse/?p=102870) | Econostrum citant l'OFS | 2025 | Moyenne |
| S42 | [France : 61 % de difficultés dans les démarches](https://www.banquedesterritoires.fr/en-2024-61-des-usagers-sondes-rencontrent-des-difficultes-dans-leurs-demarches-administratives) | Défenseur des droits / Ipsos | 2025-10 | Élevée |
| S43 | [Régulation de l'IA en Suisse](https://www.bj.admin.ch/fr/intelligence-artificielle) | Office fédéral de la justice | 2025-02 | Élevée |

**Non consulté :** prix détaillés d'ePost (page tarifaire illisible), nombre d'utilisateurs récent d'ePost, Google Trends, avis App Store en volume, Crunchbase. Méthodes de remplacement : section 1 de RESEARCH.md.
