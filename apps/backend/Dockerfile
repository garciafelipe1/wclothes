# Build context debe ser apps/backend (en Railway: Root Directory = apps/backend).
# Para Railway: si usás este Dockerfile, en Variables poné el start command:
#   sh scripts/start-railway.sh
# (docker-entrypoint.sh está pensado para docker-compose local.)
FROM node:20-alpine

WORKDIR /app

# Admin: "medusa build" (sin --admin-only) escribe el dashboard en .medusa/server/public/admin; se copia a public/admin para servir en /app.
RUN apk add --no-cache python3 make g++ postgresql-client

RUN corepack enable

# Dependencias: package.json + scripts (postinstall usa scripts/patch-medusa-utils.js)
COPY package.json ./
COPY scripts/ ./scripts/
RUN pnpm install

# Resto del proyecto y build
COPY . .

# Build del backend (admin habilitado). Medusa 2.13 escribe el bundle en .medusa/server/public/admin; .medusa/client son fuentes (entry.jsx sin compilar).
RUN pnpm run build
# Servidor sirve desde ./public/admin/. Priorizar build real (bundles JS/CSS) sobre .medusa/client (solo dev).
RUN mkdir -p public/admin && \
  if [ -d ".medusa/server/public/admin" ] && [ -f ".medusa/server/public/admin/index.html" ]; then \
    cp -r .medusa/server/public/admin/. public/admin/; \
    echo "Admin: copiado desde .medusa/server/public/admin (build)"; \
  else \
    cp -r .medusa/client/. public/admin/; \
    echo "Admin: fallback .medusa/client (revisar que medusa build genere server/public/admin)"; \
  fi
# Sin <base href="/app/"> el navegador pide ./entry.jsx como /entry.jsx; con base pide /app/entry.jsx y assets bajo /app/
RUN grep -q '<base href="/app/">' public/admin/index.html 2>/dev/null || \
  sed -i 's|<head>|<head><base href="/app/">|' public/admin/index.html
RUN test -f public/admin/index.html || (echo "ERROR: public/admin/index.html no existe" && ls -la .medusa/client/ .medusa/server/public/admin 2>/dev/null; exit 1)

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
