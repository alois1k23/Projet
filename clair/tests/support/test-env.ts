/** Variables d'environnement communes aux tests d'intégration et de bout en bout. */
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://clair:clair_dev@localhost:5432/clair_test";
export const TEST_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
