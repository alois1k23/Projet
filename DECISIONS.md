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
- **Contexte :** Clair obtient 77,5/100 contre 71,5 pour Nido et 71,0 pour Tribu ; il reste premier dans 93 % des simulations où les notes varient.
- **Proposition :** retenir Clair, copilote du courrier administratif suisse, et absorber Bienvenue, Franchise, Fixe et un module Déménagement comme extensions futures.
- **Point de vigilance assumé :** Nido rapporte plus à court terme dans les scénarios, mais dépend de l'accès aux portails et subit un churn structurel.
- **Statut :** proposée, en attente.

## D-006 · Noms provisoires (2026-10-28)
- Les noms (Clair, Nido, Tribu…) servent à l'analyse uniquement. Aucune vérification de marque ni de domaine n'a été faite. Elle aura lieu en phase 4.
