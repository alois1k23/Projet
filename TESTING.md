# TESTING

## Phase 1 à 3 : vérification de l'analyse

| Contrôle | Commande | Dernier résultat (2026-10-28) |
|---|---|---|
| Intégrité des données (pondérations = 100 %, notes 0–10, sources existantes, 15 idées, sources du marché de Clair) | `npm test` | ✅ OK |
| Robustesse aux pondérations (±50 %, 5 000 tirages) | `npm test` | Top 3 identique dans 100 % des tirages |
| Robustesse aux notes (±1,5 estimées, ±0,5 sourcées) | `npm test` | Clair 1er dans 81 % des tirages (après révision de sa note de concurrence) |
| Rendu du tableau de bord : 1280 px clair et sombre, 390 px mobile | Playwright (Chromium) | Aucune erreur console, aucun défilement horizontal |



## Phase 6 : application Clair

### Stratégie

| Niveau | Outil | Ce qui est vérifié |
|---|---|---|
| Unitaires | Vitest | Chiffrement, stockage (y compris tentatives de sortie du dossier), signatures de fichiers, Argon2id, limiteur, normalisation des réponses IA, échéances et fuseau de Zurich, IBAN, iCalendar, modèles de lettres FR/DE, PDF, analyseur Claude avec un faux client (paramètres envoyés, refus, erreurs réseau) |
| Intégration | Vitest + PostgreSQL `clair_test` | Application d'une analyse et création des tâches, isolation entre utilisateurs, quota, exemples, rappels, suppression en cascade |
| Bout en bout | Playwright + Chromium, build de production | Inscription, connexion, erreurs ; téléversement et analyse ; fichier original servi déchiffré ; tâches ; lettre et PDF ; correction d'une analyse incertaine ; refus d'un fichier invalide ; recherche ; suppression ; accès interdit au courrier d'un autre compte ; échéance manuelle et export .ics ; profil, export JSON, suppression du compte |
| Accessibilité | axe-core (WCAG 2.1 A/AA) | 4 pages publiques et 7 écrans connectés, en thème clair et sombre : aucune violation grave ou critique |
| Responsive | Playwright, Pixel 7 | Navigation du bas, ajout d'un courrier, absence de défilement horizontal |
| Réel | Vitest, `npm run test:live` | Analyse d'une facture QR allemande par l'API Claude |

### Résultats du 28 octobre 2026

| Commande | Résultat |
|---|---|
| `npm run lint` | ✅ 0 erreur, 0 avertissement |
| `npm run typecheck` | ✅ 0 erreur |
| `npm test` | ✅ 60 tests réussis |
| `npm run test:e2e` | ✅ 16 parcours réussis (15 ordinateur, 1 mobile) |
| `npm run build` | ✅ |
| `npm run test:live` | ⏭️ **Non exécuté** : aucune clé API Anthropic n'est disponible dans cet environnement |

### Défauts trouvés par les tests et corrigés
1. Montants affichés « 1 240,50 » au lieu de « 1’240.50 » (D-014).
2. Après une erreur de connexion, React vidait le champ e-mail : les formulaires renvoient désormais les valeurs saisies.
3. Le badge « À vérifier » restait affiché après une correction par l'utilisateur.
4. Actions bloquées après la première action d'une page, à cause de `loading.tsx` (D-015).
5. Contrastes insuffisants : texte secondaire (4,32:1 → 5,16:1), vert de succès, bouton de suppression en mode sombre.
6. Champ caméra sans étiquette accessible sur ordinateur.
7. Salutation « Bonsoir » à midi : l'heure `fr-CH` (« 11 h ») n'était pas lue correctement.

### Facilité d'usage (version 0.4) : ce qui est vérifié automatiquement
- Démonstration sans compte, de la page d'accueil jusqu'à l'inscription en deux champs.
- Analyse lancée dès le choix du fichier, sans bouton intermédiaire.
- Photo lourde (5,8 Mo) convertie en JPEG et allégée dans le navigateur avant l'envoi.
- « Prochaine étape » : « C'est fait » passe à l'action suivante, la lettre s'ouvre depuis la carte.
- Coordonnées demandées dans la lettre, validées, puis retrouvées dans les réglages.
- Bouton Afficher / Masquer le mot de passe.
- Accessibilité des pages de démonstration.

Défaut trouvé et corrigé : après « C'est fait », la case de la même tâche dans la liste restait visuellement décochée.

### Version 0.5 (complète) : résultats du 28 octobre 2026

| Commande | Résultat |
|---|---|
| `npm run lint` / `npm run typecheck` | ✅ 0 erreur |
| `npm test` | ✅ 86 tests réussis (10 fichiers) |
| `npm run test:e2e` | ✅ 26 parcours réussis (25 ordinateur, 1 mobile), build de production |

Nouveaux contrôles :
- Parité des dictionnaires FR/DE (mêmes clés, aucun texte vide, pas de « ß »), choix de la langue selon le navigateur, traduction des codes d'erreur.
- E-mails et rappels dans la langue de l'utilisateur ; échappement HTML.
- Guides présents dans les deux langues avec des sources en https ; exemples traduits.
- Parcours complet en allemand (inscription, exemple, analyse, lettre en allemand par défaut), changement de langue sur le site et persistance dans le profil.
- Site public : sections, FAQ, liste d'attente (adresse invalide puis valide), guides sourcés, `sitemap.xml`, `robots.txt`, image Open Graph.
- Accessibilité (axe) de la page d'accueil, d'un guide et des écrans allemands.
- Revue visuelle : accueil public FR (1280 px), DE (390 px), guide DE en sombre, exemple DE mobile ; aucun défilement horizontal.

Défauts trouvés par les tests et corrigés : test « mot de passe oublié » qui remplissait le champ avant la fin de la navigation ; contrôle d'accessibilité lancé avant l'arrivée du titre de page (diffusé en différé par Next.js).

### Ce qui n'est pas testé
- L'analyse réelle par Claude : aucun courrier n'a été lu par le vrai modèle. C'est le risque n° 1 (hypothèse H3).
- Safari iOS et Firefox (seul Chromium est installé) ; la prise de photo réelle depuis un téléphone ; la conversion HEIC (Chromium ne sait pas décoder ce format) ; l'installation sur l'écran d'accueil.
- Charge et performance sous trafic.
- Envoi réel d'e-mails (SMTP implémenté, aucun serveur configuré) et connexion réelle avec Google ou Apple (aucun identifiant).
- Qualité de l'allemand de l'IA sur de vrais courriers ; relecture des textes allemands par une personne germanophone.
