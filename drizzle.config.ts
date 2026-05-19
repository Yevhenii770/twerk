import type { Config } from "drizzle-kit"
import "dotenv/config"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local", override: true })

export default {
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
} satisfies Config
