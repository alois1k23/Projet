# TESTING

## Phase 1 à 3 : vérification de l'analyse

| Contrôle | Commande | Dernier résultat (2026-10-28) |
|---|---|---|
| Intégrité des données (pondérations = 100 %, notes 0–10, sources existantes, 15 idées, sources du marché de Clair) | `npm test` | ✅ OK |
| Robustesse aux pondérations (±50 %, 5 000 tirages) | `npm test` | Top 3 identique dans 100 % des tirages |
| Robustesse aux notes (±1,5 estimées, ±0,5 sourcées) | `npm test` | Clair 1er dans 81 % des tirages (après révision de sa note de concurrence) |
| Rendu du tableau de bord : 1280 px clair et sombre, 390 px mobile | Playwright (Chromium) | Aucune erreur console, aucun défilement horizontal |

La stratégie de tests du produit (unitaires, intégration, parcours critiques, accessibilité) sera définie en phase 6.
