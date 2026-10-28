# Clair — application

Application web (mobile d'abord) qui explique le courrier administratif, suit les échéances et prépare les réponses.

## Démarrage

Prérequis : Node.js 20+ et PostgreSQL 16.

```bash
npm install
```

```bash
cp .env.example .env
```

Renseignez `DATABASE_URL` et générez la clé de chiffrement :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```bash
npx prisma migrate deploy
```

```bash
npm run dev
```

L'application est servie sur http://localhost:3000.

**Analyse IA** : renseignez `ANTHROPIC_API_KEY` pour activer l'analyse automatique (modèle par défaut : `claude-opus-5-5`). Sans clé, l'application fonctionne en saisie manuelle et l'interface l'indique clairement.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Compilation et serveur de production |
| `npm run lint` / `npm run typecheck` | ESLint et TypeScript strict |
| `npm test` | Tests unitaires et d'intégration (base `clair_test`) |
| `npm run test:e2e` | Compilation puis parcours Playwright (base `clair_e2e`, analyse simulée) |
| `npm run test:live` | Test réel contre l'API Claude (nécessite une clé, coûte quelques centimes) |
| `npm run reminders` | Envoie les rappels d'échéance (à planifier chaque jour) |

## Architecture

```
src/
  app/
    (auth)/          connexion, inscription
    (app)/           écrans connectés : accueil, courriers, échéances, lettres, réglages
    actions/         actions serveur (auth, documents, tâches, lettres, compte)
    api/             fichiers : original déchiffré, PDF, agenda .ics, export JSON
  components/        système de design et composants partagés
  lib/
    ai/              schéma de sortie, instructions, analyseur Claude, analyseur de test
    auth/            Argon2id, sessions
    letters/         modèles FR/DE et génération PDF
    crypto.ts        AES-256-GCM
    storage.ts       stockage chiffré sur disque
    deadlines.ts     calcul des échéances (fuseau Europe/Zurich)
    reminders.ts     rappels
prisma/              schéma et migrations PostgreSQL
tests/               unit, integration, e2e (Playwright), live
```

**Flux d'analyse** : téléversement → vérification du type par signature → chiffrement et stockage → appel à Claude avec sortie structurée (schéma Zod) → normalisation (dates impossibles écartées, montants bornés, confiance) → document « Analysé » ou « À vérifier » → tâches créées.

## Variables d'environnement

Voir `.env.example`. `CLAIR_AI_PROVIDER=mock` est réservé aux tests automatisés : l'interface affiche alors un bandeau « Mode test ».

## Limites connues

- Les e-mails de rappel ne sont pas envoyés : seul le journal est implémenté (`src/lib/reminders.ts`, interface `Notifier`).
- Le stockage des fichiers est local au serveur. Pour un déploiement multi-instance, il faut un stockage objet (S3 compatible, hébergé en Suisse).
- Le limiteur de tentatives est en mémoire (une seule instance).
- Next.js 15.5 : ne pas ajouter de `loading.tsx` dans `(app)` sans relancer les tests de bout en bout (voir TESTING.md).
