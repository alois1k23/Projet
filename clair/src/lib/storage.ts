import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { decrypt, encrypt } from "./crypto";
import { env } from "./env";

/** Stockage des documents. Chaque fichier est chiffré avant d’être écrit. */
export interface FileStorage {
  put(userId: string, content: Buffer): Promise<string>;
  get(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
  removeAllForUser(userId: string): Promise<void>;
}

const SAFE_SEGMENT = /^[a-zA-Z0-9_-]+$/;

export class EncryptedDiskStorage implements FileStorage {
  constructor(
    private readonly root: string,
    private readonly key: Buffer,
  ) {}

  async put(userId: string, content: Buffer): Promise<string> {
    assertSegment(userId);
    const key = `${userId}/${randomUUID()}.bin`;
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, encrypt(content, this.key), { mode: 0o600 });
    return key;
  }

  async get(key: string): Promise<Buffer> {
    return decrypt(await readFile(this.resolve(key)), this.key);
  }

  async remove(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }

  async removeAllForUser(userId: string): Promise<void> {
    assertSegment(userId);
    await rm(path.join(this.root, userId), { recursive: true, force: true });
  }

  private resolve(key: string): string {
    const [userId, file, ...rest] = key.split("/");
    if (!userId || !file || rest.length > 0) throw new Error("Clé de stockage invalide");
    assertSegment(userId);
    assertSegment(file.replace(/\.bin$/, ""));
    return path.join(this.root, userId, file);
  }
}

function assertSegment(value: string) {
  if (!SAFE_SEGMENT.test(value)) throw new Error("Identifiant de stockage invalide");
}

let instance: FileStorage | null = null;

export function storage(): FileStorage {
  if (!instance) {
    const e = env();
    instance = new EncryptedDiskStorage(path.resolve(e.CLAIR_STORAGE_DIR), Buffer.from(e.CLAIR_ENCRYPTION_KEY, "base64"));
  }
  return instance;
}
