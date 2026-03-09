#!/bin/sh
set -e

# Usar npx para que resuelva @medusajs/cli desde node_modules (funciona con pnpm y npm)
if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx not found"
  exit 1
fi

echo "Running database migrations..."
npx medusa db:migrate 2>/dev/null || echo "Migrations may have already run"

echo "Starting Medusa on port ${PORT:-8000}..."
exec npx medusa start -p "${PORT:-8000}" -H "0.0.0.0"
