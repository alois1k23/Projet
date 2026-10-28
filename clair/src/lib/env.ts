import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLAIR_ENCRYPTION_KEY: z
    .string()
    .refine((v) => Buffer.from(v, "base64").length === 32, "doit contenir 32 octets encodés en base64"),
  CLAIR_STORAGE_DIR: z.string().default("./storage"),
  ANTHROPIC_API_KEY: z.string().optional(),
  CLAIR_AI_MODEL: z.string().default("claude-opus-5-5"),
  CLAIR_AI_PROVIDER: z.enum(["anthropic", "mock", ""]).optional(),
  CLAIR_APP_URL: z.string().url().default("http://localhost:3000"),
  /** Mode démo : comptes éphémères en un clic et, sans clé API, analyse simulée signalée comme telle. */
  CLAIR_DEMO: z.enum(["1", "0", ""]).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

/** Lit et valide les variables d’environnement au premier accès. */
export function env(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Configuration invalide : ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** URL publique, lue à chaque requête (sans exiger le reste de la configuration, ni la figer à la compilation). */
export function appUrl(): string {
  return (process.env.CLAIR_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}
