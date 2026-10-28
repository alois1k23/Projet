import { defineConfig } from "vitest/config";
import path from "node:path";

/** Tests réels contre l'API Claude (voir tests/live). */
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "server-only": path.resolve(__dirname, "tests/support/empty.ts") } },
  test: { include: ["tests/live/**/*.test.ts"], environment: "node" },
});
