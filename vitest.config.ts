import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    // Nunca contra Neon: la base de los tests es PGlite en memoria.
    env: {
      DB_DRIVER: "pglite",
      POSTGRES_URL: "postgres://unit-tests-must-not-connect@127.0.0.1:1/none",
      ADMIN_JWT_SECRET: "unit-test-secret-with-enough-entropy-1234567890",
    },
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
