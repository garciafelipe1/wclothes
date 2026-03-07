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

WORKDIR /app/apps/backend

RUN npx medusa build

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
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

ENV NODE_ENV=production
ENV PORT=8000

# Copiar backend completo (dist, config, scripts)
COPY --from=builder_backend /app/apps/backend/dist ./dist
COPY --from=builder_backend /app/apps/backend/package.json ./
COPY --from=builder_backend /app/apps/backend/medusa-config.ts ./
COPY --from=builder_backend /app/apps/backend/mikro-orm.config.ts ./
COPY --from=builder_backend /app/apps/backend/scripts ./scripts/

# node_modules del monorepo (pnpm hoist)
COPY --from=builder_backend /app/node_modules ./node_modules

RUN chmod +x ./scripts/start-railway.sh

EXPOSE 8000
CMD ["sh", "scripts/start-railway.sh"]
