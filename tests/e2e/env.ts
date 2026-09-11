/**
 * Entorno del servidor de pruebas. Pisa `.env.local`: base PGlite en memoria,
 * Neon inalcanzable, Resend falso y credenciales de admin de prueba.
 */
export const E2E_PORT = 3100
export const RESEND_MOCK_PORT = 3199
export const BASE_URL = `http://localhost:${E2E_PORT}`
export const RESEND_MOCK_URL = `http://127.0.0.1:${RESEND_MOCK_PORT}`
export const ADMIN_PASSWORD = "e2e-admin-password"

export const E2E_SERVER_ENV: Record<string, string> = {
  DB_DRIVER: "pglite",
  POSTGRES_URL: "postgres://e2e-must-not-connect@127.0.0.1:1/none",
  DATABASE_URL: "postgres://e2e-must-not-connect@127.0.0.1:1/none",
  NEXT_DIST_DIR: ".next-e2e",
  ADMIN_PASSWORD,
  ADMIN_JWT_SECRET: "e2e-jwt-secret-with-plenty-of-entropy-0123456789",
  RESEND_API_KEY: "re_e2e_fake_key",
  RESEND_BASE_URL: RESEND_MOCK_URL,
  RESEND_FROM_EMAIL: "web@e2e.test",
  RESEND_TO_EMAIL: "inbox@e2e.test",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_e2e_fake_token",
  NEXT_TELEMETRY_DISABLED: "1",
}
