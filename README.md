# Ecommerce (monorepo)

Monorepo con la misma estructura que **Las Flores de la Imprenta**: backend Medusa en `apps/backend`, paquetes compartidos en `packages/`.

## Estructura

Ver **[docs/STRUCTURE.md](docs/STRUCTURE.md)** para el árbol de carpetas y convenciones.

```
ecommerce/
├── apps/
│   ├── backend/          # Backend Medusa (API + Admin)
│   └── www/              # Storefront Next.js 15
├── packages/
│   ├── utils/            # @ecommerce/utils
│   └── database/         # @ecommerce/database
├── docs/                 # Documentación (STRUCTURE.md)
├── scripts/
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

## Requisitos

- **pnpm** (recomendado) o npm
- **Docker** y **Docker Compose** para levantar todo
- O bien: Node.js >= 20 y PostgreSQL

## Instalación

Desde la **raíz del repo**:

```bash
pnpm install
```

Crea el `.env` del backend (para desarrollo local):

```bash
# Windows PowerShell
Copy-Item apps\backend\env.template apps\backend\.env

# Linux/Mac
cp apps/backend/env.template apps/backend/.env
```

Edita `apps/backend/.env` con tu `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`, etc.  
Si tenías un `.env` en la raíz del proyecto, cópialo a `apps/backend/.env`.

## Desarrollo

**Importante:** El backend necesita **PostgreSQL** en marcha. Si no lo tienes instalado como servicio, levanta solo Postgres con Docker:

```bash
pnpm run postgres:up
```

**Primera vez** (crear tablas en la base de datos):

```bash
pnpm --filter @ecommerce/backend run db:setup
```

**Backend + storefront a la vez (desde la raíz):**

```bash
pnpm dev
```

Se abren los dos: backend en **http://localhost:8000** y tienda en **http://localhost:3000**. Admin: **http://localhost:8000/app**.

**Solo backend:**

```bash
pnpm dev:backend
```

**Solo storefront:**

```bash
pnpm dev:www
```

(La tienda necesita el backend en marcha.) Opcional: copia `apps/www/env.template` a `apps/www/.env.local` y ajusta `NEXT_PUBLIC_MEDUSA_BACKEND_URL` si usas otra URL.

**Crear usuario admin:**

```bash
pnpm --filter @ecommerce/backend exec medusa user -e tu@email.com -p tu-password
```

## Docker

Desde la raíz:

```bash
pnpm run docker:up
```

Construye y levanta PostgreSQL + backend (contexto `apps/backend`). El backend escucha en **http://localhost:8000**.

```bash
pnpm run docker:down
pnpm run docker:logs
```

## Scripts (raíz)

| Script         | Descripción                    |
|----------------|--------------------------------|
| `pnpm dev`     | Backend + storefront a la vez (8000 y 3000) |
| `pnpm dev:backend` | Solo backend (Medusa en :8000)     |
| `pnpm dev:www` | Solo storefront (Next.js en :3000) |
| `pnpm run postgres:up` | Solo Postgres en Docker (para desarrollo local) |
| `pnpm run postgres:down` | Para el contenedor Postgres |
| `pnpm run docker:up`   | Levanta Docker (Postgres + backend) |
| `pnpm run docker:down` | Para contenedores          |
| `pnpm run docker:logs` | Logs del backend            |

Migraciones y otros comandos de Medusa se ejecutan dentro de `apps/backend`:

```bash
cd apps/backend
pnpm run migration:up
# o desde raíz:
pnpm --filter @ecommerce/backend run migration:up
```

## Sin Docker (local)

1. PostgreSQL corriendo y base `medusa-db` creada.
2. `.env` en `apps/backend/` con `DATABASE_URL` correcta.
3. Desde la raíz: `pnpm dev`.

Si aparece *MikroORM failed to connect* o **Pg connection failed / KnexTimeoutError**, el backend no puede conectar a PostgreSQL. Comprueba que:

1. **PostgreSQL esté en ejecución** (servicio local o contenedor).
2. **`DATABASE_URL`** en tu `.env` (raíz o `apps/backend/.env`) sea correcta, por ejemplo:  
   `postgresql://postgres:postgres@localhost:5432/medusa-db`

Para levantar solo Postgres con Docker (sin el resto del stack):

```bash
docker run -d --name medusa-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=medusa-db postgres:16
```

Luego ejecuta las migraciones: `pnpm --filter @ecommerce/backend run migration:up`.

## Backend (Medusa v2.13.1)

- Dependencias y overrides en `apps/backend/package.json`.
- Parche postinstall para compatibilidad MikroORM + Medusa en `apps/backend/scripts/patch-medusa-utils.js`.
- Configuración en `apps/backend/medusa-config.ts` (incluye aliases Vite para el admin).
