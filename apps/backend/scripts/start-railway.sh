#!/bin/sh
set -e

# Usar npx para que resuelva @medusajs/cli desde node_modules (funciona con pnpm y npm)
if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx not found"
  exit 1
fi

echo "Running database migrations..."
npx medusa db:migrate 2>/dev/null || echo "Migrations may have already run"

# Crear usuario admin desde env (si ADMIN_EMAIL y ADMIN_PASSWORD están definidos). Si ya existe, el comando puede fallar y se ignora.
if [ -n "${ADMIN_EMAIL}" ] && [ -n "${ADMIN_PASSWORD}" ]; then
  echo "Creating admin user from ADMIN_EMAIL..."
  npx medusa user -e "${ADMIN_EMAIL}" -p "${ADMIN_PASSWORD}" 2>/dev/null || echo "Admin user may already exist."
fi

echo "Starting Medusa on port ${PORT:-8000}..."
exec npx medusa start -p "${PORT:-8000}" -H "0.0.0.0"
