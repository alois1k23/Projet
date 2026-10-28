# Projet — studio startup

Création d'une application du quotidien à fort potentiel, d'abord pour la Suisse romande puis la francophonie.

## Où en sommes-nous ?

**Phases 1 à 3 terminées : étude de marché, analyse et recommandation.** En attente de la validation du concept par le fondateur avant toute phase de branding ou de développement.

Recommandation actuelle : **Clair**, un copilote du courrier administratif suisse (nom provisoire). Voir [RECOMMENDATION.md](RECOMMENDATION.md).

## Livrables disponibles

| Livrable | Fichier |
|---|---|
| Étude de marché, 15 concepts, sources | [RESEARCH.md](RESEARCH.md) |
| Tableau de bord interactif | [dashboard/index.html](dashboard/index.html) |
| Données de l'analyse (source unique) | [dashboard/data.js](dashboard/data.js) |
| Analyse des 3 finalistes et recommandation | [RECOMMENDATION.md](RECOMMENDATION.md) |
| Étude de marché ciblée sur Clair | [MARKET_STUDY.md](MARKET_STUDY.md) |
| Décisions | [DECISIONS.md](DECISIONS.md) |
| Feuille de route et tâches | [ROADMAP.md](ROADMAP.md) · [TASKS.md](TASKS.md) |

## Ouvrir le tableau de bord en local

```bash
python3 -m http.server 8000 --directory dashboard
```

Puis ouvrir http://localhost:8000. Une connexion Internet est nécessaire pour charger ECharts et les polices.

## Vérifier les calculs

```bash
npm test
```

Ce script vérifie l'intégrité des données (pondérations à 100 %, notes dans les bornes, sources référencées), recalcule le classement et lance les tests de robustesse.

## Structure

```
dashboard/        Tableau de bord (HTML + ECharts) et données
scripts/          Vérification des scores
*.md              Documentation vivante du projet
```
