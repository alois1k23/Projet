# CHANGELOG

## 0.3.0 — 2026-10-28
### Ajouté
- Application Clair (`clair/`) : inscription et sessions sécurisées, ajout de courriers (photo, PDF), analyse par Claude avec sortie structurée validée, mode saisie manuelle, détection des informations incertaines, échéancier et export .ics, 5 modèles de lettres FR/DE avec PDF, courriers d'exemple, quota gratuit, réglages, export JSON et suppression du compte, thème clair/sombre, interface mobile.
- Chiffrement AES-256-GCM des documents, Argon2id, contrôle d'accès par propriétaire, limitation des tentatives.
- Tests : 57 unitaires et d'intégration, 14 parcours Playwright, contrôles axe-core ; test réel de l'API Claude (ignoré sans clé).
- Intégration continue GitHub Actions.
- PRODUCT.md (PRD), DESIGN_SYSTEM.md, décisions D-008 à D-016.

## 0.2.0 — 2026-10-28
### Ajouté
- Étude de marché ciblée sur Clair (MARKET_STUDY.md) : taille du marché, demande, segments, concurrence, prix, distribution, réglementation, SWOT, questionnaire de validation.
- 15 nouvelles sources (S29 à S43).
- Section « Marché de Clair » dans le tableau de bord : TAM/SAM/SOM, prix des alternatives, segments.
### Modifié
- Note de concurrence de Clair abaissée de 8 à 6 (D-007) ; score 77,5 → 75,5 ; documents mis à jour.

## 0.1.0 — 2026-10-28
### Ajouté
- Étude de marché (RESEARCH.md) avec 28 sources datées et leur niveau de fiabilité.
- 15 concepts d'applications notés sur 8 critères pondérés.
- Tableau de bord interactif (`dashboard/`) : classement, sensibilité aux pondérations, matrice opportunité/difficulté, radars, concurrence, scénarios, risques, hypothèses, sources.
- Script de vérification des scores et de robustesse (`npm test`).
- Recommandation argumentée (RECOMMENDATION.md) et documents de pilotage.
