#!/bin/sh
set -e

# Usar node directamente: pnpm exec no encuentra medusa en el runner Docker
MEDUSA_CLI=$(node -e "console.log(require.resolve('@medusajs/cli/cli.js'))")

echo "Running database migrations..."
node "$MEDUSA_CLI" db:migrate 2>/dev/null || echo "Migrations may have already run"

echo "Starting Medusa on port ${PORT:-8000}..."
exec node "$MEDUSA_CLI" start -p "${PORT:-8000}" -H "0.0.0.0"
