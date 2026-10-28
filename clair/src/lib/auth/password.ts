import { hash, verify } from "@node-rs/argon2";

// Paramètres Argon2id recommandés par l’OWASP (19 MiB, 2 itérations).
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export { PASSWORD_MIN_LENGTH } from "./constants";

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(hashed: string, password: string): Promise<boolean> {
  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
}
