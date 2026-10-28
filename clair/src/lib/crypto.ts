import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const VERSION = 1;

/**
 * Chiffre un contenu avec AES-256-GCM.
 * Format : [version (1 octet)][iv (12)][tag (16)][données chiffrées].
 */
export function encrypt(plain: Buffer, key: Buffer): Buffer {
  assertKey(key);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([Buffer.from([VERSION]), iv, cipher.getAuthTag(), encrypted]);
}

export function decrypt(payload: Buffer, key: Buffer): Buffer {
  assertKey(key);
  if (payload.length < 1 + IV_BYTES + TAG_BYTES || payload[0] !== VERSION) {
    throw new Error("Format de fichier chiffré inconnu");
  }
  const iv = payload.subarray(1, 1 + IV_BYTES);
  const tag = payload.subarray(1 + IV_BYTES, 1 + IV_BYTES + TAG_BYTES);
  const data = payload.subarray(1 + IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

function assertKey(key: Buffer) {
  if (key.length !== 32) throw new Error("La clé de chiffrement doit faire 32 octets");
}
