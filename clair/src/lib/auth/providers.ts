/** Méthodes de connexion disponibles selon la configuration du serveur. */
export function signInOptions() {
  const e = process.env;
  return {
    google: Boolean(e.CLAIR_GOOGLE_CLIENT_ID && e.CLAIR_GOOGLE_CLIENT_SECRET),
    apple: Boolean(e.CLAIR_APPLE_CLIENT_ID && e.CLAIR_APPLE_TEAM_ID && e.CLAIR_APPLE_KEY_ID && e.CLAIR_APPLE_PRIVATE_KEY),
  };
}
