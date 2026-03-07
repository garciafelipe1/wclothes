# syntax=docker/dockerfile:1.7
# Ecommerce - Dockerfile multi-stage (www + backend) como Las Flores de la Imprenta

####################################
# BASE
####################################
FROM node:20-bullseye AS base
RUN apt-get update && apt-get install -y bash curl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable && corepack prepare pnpm@10.14.0 --activate

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

####################################
# DEPS (instala dependencias del monorepo)
####################################
FROM base AS deps

RUN apt-get update && apt-get install -y python3 make g++ pkg-config \
  && rm -rf /var/lib/apt/lists/*

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm fetch

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --offline

####################################
# BUILDER – NEXT.JS (www)
####################################
FROM base AS builder_www

ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_DEFAULT_COUNTRY

ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_DEFAULT_COUNTRY=$NEXT_PUBLIC_DEFAULT_COUNTRY

COPY --from=deps /app .
RUN pnpm -C apps/www build

####################################
# BUILDER – MEDUSA BACKEND
####################################
FROM base AS builder_backend

COPY --from=deps /app .

WORKDIR /app

RUN pnpm --filter @ecommerce/backend run build

# Medusa genera .medusa/admin/build/ pero lo sirve desde public/admin/
RUN mkdir -p /app/apps/backend/public/admin && \
    cp -r /app/apps/backend/.medusa/admin/build/* /app/apps/backend/public/admin/

# Medusa busca medusa-config (sin extensión) → resuelve a .js
RUN cp /app/apps/backend/medusa-config.ts /app/apps/backend/medusa-config.js

# pnpm deploy crea un bundle autocontenido (sin symlinks al store)
RUN pnpm --filter @ecommerce/backend deploy --prod --legacy ./backend-deploy

####################################
# RUNTIME – NEXT.JS
####################################
FROM node:20-bullseye-slim AS runner_www

ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_DEFAULT_COUNTRY

ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_DEFAULT_COUNTRY=$NEXT_PUBLIC_DEFAULT_COUNTRY

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder_www /app/apps/www/.next/standalone ./
COPY --from=builder_www /app/apps/www/.next/static ./apps/www/.next/static
COPY --from=builder_www /app/apps/www/public ./apps/www/public

USER node
EXPOSE 3000

CMD ["node", "apps/www/server.js"]

####################################
# RUNTIME – MEDUSA BACKEND
####################################
FROM node:20-bullseye-slim AS runner_backend

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Bundle autocontenido de pnpm deploy (node_modules con archivos reales, no symlinks)
COPY --from=builder_backend /app/backend-deploy ./

# Admin UI (Medusa lo sirve desde public/admin; deploy puede no incluirlo)
COPY --from=builder_backend /app/apps/backend/public/admin ./public/admin

# scripts de arranque (deploy puede no incluirlos)
COPY --from=builder_backend /app/apps/backend/scripts ./scripts/

RUN chmod +x ./scripts/start-railway.sh

EXPOSE 8000
CMD ["sh", "scripts/start-railway.sh"]
