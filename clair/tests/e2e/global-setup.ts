import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const url = process.env.E2E_DATABASE_URL ?? "postgresql://clair:clair_dev@localhost:5432/clair_e2e";

/** Base et stockage vierges avant chaque campagne de tests. */
export default async function globalSetup() {
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url } });
  const db = new PrismaClient({ datasources: { db: { url } } });
  await db.user.deleteMany();
  await db.$disconnect();
  rmSync(path.join(os.tmpdir(), "clair-e2e-storage"), { recursive: true, force: true });
}
