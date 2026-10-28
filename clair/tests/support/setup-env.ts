import os from "node:os";
import path from "node:path";
import { TEST_DATABASE_URL, TEST_ENCRYPTION_KEY } from "./test-env";

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.CLAIR_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
process.env.CLAIR_STORAGE_DIR = path.join(os.tmpdir(), `clair-test-storage-${process.pid}`);
process.env.ANTHROPIC_API_KEY = "";
process.env.CLAIR_AI_PROVIDER = "";
