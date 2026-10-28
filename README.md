# Projet — studio startup

Création d'une application du quotidien à fort potentiel, d'abord pour la Suisse romande puis la francophonie.

## Où en sommes-nous ?

**Clair est développé et testé (version 0.5)** : un copilote du courrier administratif suisse (nom provisoire), en français et en allemand. Il explique un courrier (même de plusieurs pages), suit les échéances, envoie des rappels et prépare les réponses. Il comprend aussi un site de présentation avec tarifs, FAQ, liste d'attente et guides pratiques. Code dans [`clair/`](clair/README.md).

**Essayer la démo** : voir la vidéo [`demo/clair-demo.mp4`](demo/clair-demo.mp4), ou la lancer en une commande avec Docker (voir [`clair/README.md`](clair/README.md#lancer-la-démo-une-commande)).

Rien n'est publié ni payant : e-mails, Google et Apple attendent vos identifiants (voir [TASKS.md](TASKS.md)).

Prochaine étape recommandée : bêta fermée avec une vraie clé API pour mesurer la précision sur de vrais courriers (voir [TASKS.md](TASKS.md)).

## Livrables disponibles

| Livrable | Fichier |
|---|---|
| Étude de marché, 15 concepts, sources | [RESEARCH.md](RESEARCH.md) |
| Tableau de bord interactif | [dashboard/index.html](dashboard/index.html) |
| Données de l'analyse (source unique) | [dashboard/data.js](dashboard/data.js) |
| Analyse des 3 finalistes et recommandation | [RECOMMENDATION.md](RECOMMENDATION.md) |
| Étude de marché ciblée sur Clair | [MARKET_STUDY.md](MARKET_STUDY.md) |
| **Application Clair (code)** | [clair/](clair/README.md) |
| Spécification produit (PRD) | [PRODUCT.md](PRODUCT.md) |
| Identité et design system | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| Tests et résultats | [TESTING.md](TESTING.md) |
| Historique des versions | [CHANGELOG.md](CHANGELOG.md) |
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
clair/            Application Next.js (voir clair/README.md)
dashboard/        Tableau de bord d'étude (HTML + ECharts) et données
scripts/          Vérification des scores de l'étude
.github/          Intégration continue
*.md              Documentation vivante du projet
```
