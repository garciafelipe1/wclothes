# Ecommerce — Monorepo

Monorepo de ecommerce con **backend Medusa 2** (API + Admin) y **storefront Next.js 15**. Gestión de productos, catálogo con filtros, carrito, checkout y órdenes. Tests automatizados y despliegue en Railway.

---

## Contenido del proyecto

| Área | Descripción |
|------|-------------|
| **Backend** | API Medusa 2.13 (Store API + Admin). Rutas custom para catálogo (`/store/custom`), órdenes por email, integración Redis (cache/event bus), Mercado Pago, Resend, S3. |
| **Storefront** | Next.js 15 (App Router), i18n (es/en), catálogo con filtros (precio, categoría, color, talle, ofertas), carrito, checkout multi-paso, historial de órdenes. |
| **Admin** | Dashboard Medusa en `/app`: productos, órdenes, envíos, etc. Usuario admin creado al arrancar en producción (variables `ADMIN_EMAIL` / `ADMIN_PASSWORD`). |
| **Tests** | Jest en backend (validadores, `getLowestPrice`), Vitest en frontend (env, mapeo de productos). CI en GitHub Actions. |
| **Deploy** | Backend y DB en Railway (Dockerfile en `apps/backend`). Frontend desplegable en Vercel/Railway con variables `NEXT_PUBLIC_*`. Documentación en [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md). |

---

## Stack técnico

- **Monorepo:** pnpm workspaces (`apps/*`, `packages/*`).
- **Backend:** [Medusa](https://medusajs.com/) 2.13, Node 20, TypeScript, MikroORM, PostgreSQL.
- **Frontend:** [Next.js](https://nextjs.org/) 15, React 18, next-intl, Tailwind.
- **API storefront ↔ backend:** `@medusajs/js-sdk` + rutas custom (catálogo, órdenes).
- **Tests:** Jest (backend), Vitest (www). Lint y typecheck en CI.

---

## Estructura

```
ecommerce/
├── apps/
│   ├── backend/          # Medusa: API, Admin, migraciones, seed
│   └── www/              # Next.js: storefront (catálogo, carrito, checkout)
├── packages/
│   ├── utils/            # @ecommerce/utils (compartido)
│   └── database/         # @ecommerce/database (compartido)
├── docs/                 # STRUCTURE.md, REFACTORING-PROPOSAL.md
├── scripts/              # DB, Docker, utilidades
├── .github/workflows/    # CI (lint, typecheck, test, build)
├── package.json          # Scripts raíz
├── pnpm-workspace.yaml
└── docker-compose.dev.yml
```

Detalle de carpetas y convenciones: **[docs/STRUCTURE.md](docs/STRUCTURE.md)**.

---

## Requisitos

- **Node.js** ≥ 20  
- **pnpm** (recomendado) — `corepack enable && corepack prepare pnpm@latest --activate`  
- **PostgreSQL** (local o Docker) para el backend  
- **Docker** y **Docker Compose** (opcional) para levantar Postgres o todo el stack

---

## Instalación

Clonar el repo y, desde la **raíz**:

```bash
pnpm install
```

### Variables de entorno (desarrollo)

**Backend** — Copiar plantilla y editar:

```bash
# Windows (PowerShell)
Copy-Item apps\backend\env.template apps\backend\.env

# Linux / macOS
cp apps/backend/env.template apps/backend/.env
```

En `apps/backend/.env` configurar al menos: `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`. Ver `apps/backend/env.template` o `.env.example` para el resto.

**Storefront** — Opcional. Por defecto usa `http://localhost:9001` como backend. Si el backend corre en otro puerto o URL, crear `apps/www/.env` (o `.env.local`) con:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9001
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<tu-publishable-key>
NEXT_PUBLIC_DEFAULT_COUNTRY=ar
```

La publishable key se obtiene del admin de Medusa después del primer seed.

---

## Desarrollo

### 1. Base de datos

El backend necesita **PostgreSQL** en ejecución. Solo Postgres con Docker:

```bash
pnpm run postgres:up
```

**Primera vez** (crear tablas):

```bash
pnpm --filter @ecommerce/backend run db:setup
```

(Opcional) Poblar datos de prueba:

```bash
pnpm --filter @ecommerce/backend run seed
```

### 2. Arrancar backend y storefront

Desde la raíz:

```bash
pnpm dev
```

- **Backend:** http://localhost:9001 (o el `PORT` de tu `.env`)  
- **Storefront:** http://localhost:3000  
- **Admin:** http://localhost:9001/app  

Solo backend:

```bash
pnpm dev:backend
```

Solo storefront:

```bash
pnpm dev:www
```

### 3. Usuario admin (local)

```bash
pnpm --filter @ecommerce/backend exec medusa user -e tu@email.com -p tu-password
```

O usar `pnpm user` (script de raíz si está definido).

---

## Tests

Desde la raíz se ejecutan todos los tests (backend + frontend):

```bash
pnpm test
```

| Comando | Descripción |
|---------|-------------|
| `pnpm test` | Backend (Jest) + www (Vitest) |
| `pnpm --filter @ecommerce/backend test` | Solo backend |
| `pnpm --filter @ecommerce/backend test:watch` | Backend en modo watch |
| `pnpm --filter @ecommerce/www test` | Solo storefront |
| `pnpm --filter @ecommerce/www test:watch` | Storefront en modo watch |

Backend: tests en `apps/backend/src/**/__tests__/*.test.ts` (p. ej. validadores del catálogo, `getLowestPrice`).  
Frontend: tests en `apps/www/src/**/__tests__/*.test.ts` (env, mapeo de productos).

---

## Scripts principales (raíz)

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Backend + storefront a la vez |
| `pnpm dev:backend` | Solo backend Medusa |
| `pnpm dev:www` | Solo storefront Next.js |
| `pnpm test` | Tests backend + www |
| `pnpm run postgres:up` | Levanta solo Postgres (Docker) |
| `pnpm run postgres:down` | Detiene Postgres |
| `pnpm run docker:up` | Levanta stack (Postgres + backend) con Docker Compose |
| `pnpm run docker:down` | Detiene contenedores |
| `pnpm run docker:logs` | Logs del backend |
| `pnpm run db:reset` | Script para resetear DB (Windows: ver `scripts/`) |
| `pnpm user` | Crear usuario admin (backend) |

Migraciones y seed desde backend:

```bash
pnpm --filter @ecommerce/backend run migration:up
pnpm --filter @ecommerce/backend run seed
```

---

## Docker (stack completo)

```bash
pnpm run docker:up
```

Construye y levanta Postgres + backend según `docker-compose.dev.yml`. El backend queda en **http://localhost:8000** (o el puerto configurado).

```bash
pnpm run docker:down
pnpm run docker:logs
```

---

## Despliegue

- **Backend:** Despliegue en Railway con Root Directory `apps/backend`, Dockerfile en esa carpeta, variables `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.
- **Storefront:** Variables `NEXT_PUBLIC_MEDUSA_BACKEND_URL` y `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` en la plataforma (Vercel/Railway). Seed de la base de producción desde local con `DATABASE_PUBLIC_URL`.

Guía paso a paso, variables y troubleshooting: **[DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md)**.

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | Árbol de carpetas, convenciones, tests |
| [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md) | Deploy backend y frontend en Railway |
| [docs/REFACTORING-PROPOSAL.md](docs/REFACTORING-PROPOSAL.md) | Propuesta de refactor (Clean Code, estructura) |

---

## CI (GitHub Actions)

En cada push/PR a `main`:

1. **Install** — Instala dependencias y guarda caché.
2. **Test** — Ejecuta `pnpm test` (backend + www).
3. **Lint** — Lint del frontend.
4. **Type Check** — `tsc --noEmit` en www.
5. **Build Frontend** — `pnpm --filter @ecommerce/www build`.
6. **Build Backend Image** — Construye la imagen Docker del backend (sin push).

El workflow está en `.github/workflows/ci.yml`.

---

## Problemas frecuentes

- **Backend no arranca / "Pg connection failed"**  
  Comprobar que PostgreSQL esté en ejecución y que `DATABASE_URL` en `apps/backend/.env` sea correcta (ej. `postgresql://postgres:postgres@localhost:5432/medusa-db`).

- **Storefront no muestra productos**  
  Verificar que el backend esté levantado y que `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (y opcionalmente `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`) en www apunten al backend correcto.

- **Admin 401 o no carga**  
  Crear usuario con `medusa user` (ver desarrollo). En producción, configurar `ADMIN_EMAIL` y `ADMIN_PASSWORD` en Railway para que el script de arranque cree el usuario.

- **"Filename too long" (Windows)**  
  Suele aparecer en `node_modules` de pnpm/Medusa. No afecta el commit (node_modules está en `.gitignore`). Opcional: activar rutas largas en Windows o `git config core.longpaths true`.

---

## Licencia

Proyecto privado. Uso según acuerdo del equipo.
