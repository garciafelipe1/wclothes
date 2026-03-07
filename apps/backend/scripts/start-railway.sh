#!/bin/sh
set -e

echo "Running database migrations..."
pnpm exec medusa db:migrate 2>/dev/null || echo "Migrations may have already run"

echo "Starting Medusa on port ${PORT:-8000}..."
exec pnpm exec medusa start -p "${PORT:-8000}" -H "0.0.0.0"
