#!/usr/bin/env bash
# Compila y levanta el servidor E2E aislado (PGlite + Resend falso) en el puerto 3100.
# Úsalo con `E2E_REUSE=1 npx playwright test` para iterar sin recompilar en cada corrida.
set -euo pipefail
export DB_DRIVER=pglite
export POSTGRES_URL="postgres://e2e-must-not-connect@127.0.0.1:1/none"
export DATABASE_URL="$POSTGRES_URL"
export NEXT_DIST_DIR=.next-e2e
export ADMIN_PASSWORD=e2e-admin-password
export ADMIN_JWT_SECRET=e2e-jwt-secret-with-plenty-of-entropy-0123456789
export RESEND_API_KEY=re_e2e_fake_key
export RESEND_BASE_URL=http://127.0.0.1:3199
export RESEND_FROM_EMAIL=web@e2e.test
export RESEND_TO_EMAIL=inbox@e2e.test
export BLOB_READ_WRITE_TOKEN=vercel_blob_rw_e2e_fake_token
export NEXT_TELEMETRY_DISABLED=1
[ "${SKIP_BUILD:-}" = "1" ] || npx next build --turbopack
exec npx next start -p 3100
