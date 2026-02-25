#!/bin/sh
set -e

echo "Esperando a PostgreSQL..."
sleep 15
until PGPASSWORD=postgres psql -h postgres -U postgres -d medusa-db -c 'SELECT 1' > /dev/null 2>&1; do
  echo "Esperando conexión a PostgreSQL..."
  sleep 3
done
echo "PostgreSQL listo!"

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL=$DATABASE_URL" > /app/.env
  [ -n "$JWT_SECRET" ] && echo "JWT_SECRET=$JWT_SECRET" >> /app/.env
  [ -n "$COOKIE_SECRET" ] && echo "COOKIE_SECRET=$COOKIE_SECRET" >> /app/.env
  [ -n "$STORE_CORS" ] && echo "STORE_CORS=$STORE_CORS" >> /app/.env
  [ -n "$ADMIN_CORS" ] && echo "ADMIN_CORS=$ADMIN_CORS" >> /app/.env
  [ -n "$NODE_ENV" ] && echo "NODE_ENV=$NODE_ENV" >> /app/.env
fi

echo "Configurando base de datos..."
npx medusa db:setup --no-interactive --execute-safe-links

echo "Iniciando Medusa..."
exec npm run dev
