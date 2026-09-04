import { defineConfig } from "vitest/config";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "."), },
  },
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
  },
});
