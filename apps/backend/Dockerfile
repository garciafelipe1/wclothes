# Build context debe ser apps/backend (en Railway: Root Directory = apps/backend).
# Para Railway: si usás este Dockerfile, en Variables poné el start command:
#   sh scripts/start-railway.sh
# (docker-entrypoint.sh está pensado para docker-compose local.)
FROM node:20-alpine

WORKDIR /app

# Admin: por defecto habilitado para que /app funcione en Railway.
# Para deshabilitarlo: en Railway Variables poné DISABLE_MEDUSA_ADMIN=true
RUN apk add --no-cache python3 make g++ postgresql-client

RUN corepack enable

# Dependencias: package.json + scripts (postinstall usa scripts/patch-medusa-utils.js)
COPY package.json ./
COPY scripts/ ./scripts/
RUN pnpm install

# Resto del proyecto y build
COPY . .

# Build del backend (genera dist/)
RUN pnpm run build

# Quitar rutas antiguas si existieran (evita "missing ) after argument list")
RUN rm -rf dist/api_store_backup 2>/dev/null || true

# Comprobar que las rutas API cargan sin error de sintaxis
RUN node scripts/check-api-routes.js

# Fix conocido de Medusa (subscribers.some); con pnpm el archivo puede estar en .pnpm
RUN MEDUSA_UTILS=$(find node_modules -path "*@medusajs/utils*/dist/modules-sdk/medusa-internal-service.js" -type f 2>/dev/null | head -1) && \
    if [ -n "$MEDUSA_UTILS" ]; then sed -i 's/manager\.getEventManager()\.subscribers\.some/Array.from(manager.getEventManager().subscribers).some/g' "$MEDUSA_UTILS"; fi

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

CMD ["/app/docker-entrypoint.sh"]
