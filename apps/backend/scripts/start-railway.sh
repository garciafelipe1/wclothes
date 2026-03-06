#!/bin/sh
set -e

echo "Running database migrations..."
npx medusa db:migrate || echo "Migrations may have already run"

echo "Starting Medusa on port ${PORT:-8000}..."
exec npx medusa start -p "${PORT:-8000}" -H "0.0.0.0"
