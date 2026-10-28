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

## Lancer la démo (une commande)

Il faut seulement [Docker Desktop](https://www.docker.com/products/docker-desktop/). Dans le dossier `clair/` :

```bash
docker compose -f docker-compose.demo.yml up --build
```

Puis ouvrir http://localhost:3000 et cliquer sur **Essayer la démo, sans inscription** : un compte temporaire s'ouvre avec trois courriers déjà expliqués (facture QR, prime d'assurance-maladie, commandement de payer). Aucune adresse e-mail, aucune clé, aucun service externe. Les comptes de démo sont effacés après 24 heures.

Sans clé API, l'ajout d'une photo affiche un **résultat d'exemple** (le document n'est pas lu), et l'application le dit clairement. Pour une vraie analyse : `ANTHROPIC_API_KEY=... docker compose -f docker-compose.demo.yml up --build`.

Sans Docker : `CLAIR_DEMO=1` dans `.env`, puis `npm run build && npm run demo`.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Compilation et serveur de production |
| `npm run lint` / `npm run typecheck` | ESLint et TypeScript strict |
| `npm test` | Tests unitaires et d'intégration (base `clair_test`) |
| `npm run test:e2e` | Compilation puis parcours Playwright (base `clair_e2e`, analyse simulée) |
| `npm run test:live` | Test réel contre l'API Claude (nécessite une clé, coûte quelques centimes) |
| `npm run demo` | Serveur de production en mode démo (après `npm run build`) |
| `npm run reminders` | Envoie les rappels d'échéance et efface les démos expirées (à planifier chaque jour) |

## Architecture

```
src/
  app/
    (auth)/          connexion, inscription, lien par e-mail, mot de passe oublié
    (app)/           écrans connectés : accueil, courriers, à faire, lettres, réglages
    exemple/, guides/  démonstration sans compte, guides pratiques
    actions/         actions serveur (auth, e-mail, documents, tâches, lettres, compte, langue, liste d'attente)
    api/             fichiers, PDF, agenda .ics, export JSON, connexion Google et Apple
    sitemap.ts, robots.ts, opengraph-image.tsx   référencement
  content/guides.ts  guides FR/DE et leurs sources
  i18n/              dictionnaires fr.ts / de.ts / site.ts, choix de la langue, traduction des erreurs
  components/        système de design et composants partagés
  lib/
    ai/              schéma de sortie, instructions, analyseur Claude, analyseur de test
    auth/            Argon2id, sessions, jetons à usage unique, OpenID Connect
    mail/            SMTP ou fichier local, modèles d'e-mails FR/DE
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

Voir `.env.example`. `CLAIR_AI_PROVIDER=mock` est réservé aux tests automatisés : l'interface affiche alors un bandeau « Mode test ». Les e-mails (`CLAIR_SMTP_URL`), Google (`CLAIR_GOOGLE_*`) et Apple (`CLAIR_APPLE_*`) sont optionnels : sans eux, les boutons correspondants n'apparaissent pas.

## Langues

Tous les textes de l'interface sont dans `src/i18n/fr.ts` et `de.ts` (le type allemand est dérivé du français : une clé manquante est une erreur de compilation, et un test vérifie la parité). Les textes du site public sont dans `src/i18n/site.ts`. Côté serveur : `await getT()` ; côté client : `useT()`. Les actions serveur renvoient des codes d'erreur traduits par `src/i18n/issues.ts`.

## Limites connues

- Aucun e-mail réel n'a été envoyé : le transport SMTP est implémenté mais n'a pas de serveur configuré ; les tests utilisent le transport fichier.
- Google et Apple : testés avec des jetons simulés, jamais contre les vrais fournisseurs (aucun identifiant).
- Le manifeste d'installation est en français uniquement.
- Le stockage des fichiers est local au serveur. Pour un déploiement multi-instance, il faut un stockage objet (S3 compatible, hébergé en Suisse).
- Le limiteur de tentatives est en mémoire (une seule instance).
- Next.js 15.5 : ne pas ajouter de `loading.tsx` dans `(app)` sans relancer les tests de bout en bout (voir TESTING.md).
