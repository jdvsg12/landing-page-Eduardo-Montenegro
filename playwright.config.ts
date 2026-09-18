import { defineConfig, devices } from "@playwright/test"
import { BASE_URL, E2E_SERVER_ENV, RESEND_MOCK_PORT, RESEND_MOCK_URL } from "./tests/e2e/env"

/**
 * E2E contra un build de producción aislado: PGlite en memoria en lugar de Neon
 * y un Resend falso. Nada de lo que hagan los tests llega a la base ni al correo reales.
 * `E2E_REUSE=1` reutiliza un servidor ya levantado en el puerto 3100.
 */
const reuse = process.env.E2E_REUSE === "1"

export default defineConfig({
  testDir: "tests/e2e",
  // Los tests editan contenido global (hero, FAQ, SEO): en serie para que no se pisen.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: BASE_URL,
    channel: "chrome",
    locale: "es-CO",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" }, grepInvert: /@mobile-only/ },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" }, grep: /@mobile/ },
  ],
  webServer: [
    {
      command: "node tests/e2e/mock-resend.mjs",
      url: `${RESEND_MOCK_URL}/__health`,
      env: { RESEND_MOCK_PORT: String(RESEND_MOCK_PORT) },
      reuseExistingServer: reuse,
    },
    {
      command: "npx next build --turbopack && npx next start -p 3100",
      url: `${BASE_URL}/api/services`,
      env: E2E_SERVER_ENV,
      timeout: 600_000,
      reuseExistingServer: reuse,
    },
  ],
})
