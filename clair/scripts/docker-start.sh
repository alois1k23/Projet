#!/bin/sh
# Démarrage du conteneur : clé de chiffrement persistante, migrations, serveur.
set -e
if [ -z "$CLAIR_ENCRYPTION_KEY" ]; then
  KEY_FILE=/data/encryption.key
  if [ ! -f "$KEY_FILE" ]; then
    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" > "$KEY_FILE"
    chmod 600 "$KEY_FILE"
  fi
  CLAIR_ENCRYPTION_KEY=$(cat "$KEY_FILE")
  export CLAIR_ENCRYPTION_KEY
fi
node_modules/.bin/prisma migrate deploy
exec node_modules/.bin/next start -p "${PORT:-3000}"
