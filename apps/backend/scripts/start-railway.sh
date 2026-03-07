#!/bin/sh
set -e

# pnpm deploy no crea symlinks en node_modules; buscar cli.js en .pnpm
MEDUSA_CLI=$(find ./node_modules/.pnpm -path "*@medusajs/cli/cli.js" -type f 2>/dev/null | head -1)
if [ -z "$MEDUSA_CLI" ]; then
  echo "Error: @medusajs/cli not found in node_modules"
  exit 1
fi

echo "Running database migrations..."
node "$MEDUSA_CLI" db:migrate 2>/dev/null || echo "Migrations may have already run"

echo "Starting Medusa on port ${PORT:-8000}..."
exec node "$MEDUSA_CLI" start -p "${PORT:-8000}" -H "0.0.0.0"
