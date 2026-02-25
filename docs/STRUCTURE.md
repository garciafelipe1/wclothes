# Estructura del proyecto

Monorepo con **pnpm workspaces**. Apps en `apps/`, paquetes compartidos en `packages/`.

## Árbol principal

```
ecommerce/
├── apps/
│   ├── backend/          # API Medusa 2 (Store + Admin)
│   └── www/              # Storefront Next.js 15
├── packages/
│   ├── database/         # Cliente/helpers de base de datos (compartido)
│   └── utils/            # Utilidades compartidas
├── scripts/              # Scripts de desarrollo (DB, Docker, etc.)
├── docs/                 # Documentación
├── package.json          # Raíz: scripts, devDependencies
├── pnpm-workspace.yaml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

## apps/backend (Medusa)

```
apps/backend/
├── src/
│   ├── api/              # Rutas API custom (GET/POST /store/..., /admin/...)
│   ├── modules/          # Módulos Medusa custom
│   ├── subscribers/      # Event subscribers
│   ├── workflows/        # Workflows custom
│   ├── jobs/             # Jobs (cron, colas)
│   ├── migrations/       # Migraciones (si se usan desde aquí)
│   └── index.ts          # Entry o re-export
├── scripts/              # postinstall, etc.
├── medusa-config.ts
├── mikro-orm.config.ts
├── Dockerfile
└── package.json
```

- **api/** – Handlers para rutas custom (ej. `src/api/store/custom/route.ts`).
- **modules/** – Módulos que extienden o reemplazan módulos de Medusa.
- **subscribers/** – Suscripción a eventos (order.placed, etc.).
- **workflows/** – Definición de workflows custom.
- **jobs/** – Tareas programadas o en cola.

## apps/www (Next.js)

```
apps/www/
├── public/               # Assets estáticos (imágenes, favicon)
├── src/
│   ├── app/              # App Router: layout, páginas, rutas
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── products/
│   │   └── ...
│   ├── components/       # Componentes React
│   │   ├── ui/           # Botones, inputs, cards (reutilizables)
│   │   ├── layout/       # Header, Footer, Nav
│   │   └── home/         # Secciones del home (hero, sticky stack)
│   ├── lib/              # Clientes API, helpers (Medusa SDK, fetch)
│   ├── hooks/            # Custom hooks (useProducts, useCart)
│   ├── types/            # Tipos TS compartidos en el front
│   └── styles/           # (opcional) Estilos adicionales
├── next.config.ts
├── tsconfig.json
└── package.json
```

- **app/** – Rutas y layouts (App Router).
- **components/ui** – Componentes genéricos reutilizables.
- **components/layout** – Encabezado, pie, navegación.
- **components/home** – Componentes específicos del home.
- **lib/** – Cliente Medusa, helpers, constants.
- **hooks/** – Lógica reutilizable (datos, estado).
- **types/** – Interfaces y tipos compartidos.

## packages/

- **packages/utils** – Funciones puras, formateo, validación. Uso: `import { ... } from "@ecommerce/utils"`.
- **packages/database** – Cliente DB compartido o tipos de entidades (si se usan fuera del backend). Uso: `import { ... } from "@ecommerce/database"`.

Cada paquete tiene `src/index.ts` (o punto de entrada definido en `main`) y su propio `package.json` con nombre `@ecommerce/<nombre>`.

## Convenciones

- **Nombres de paquetes:** `@ecommerce/backend`, `@ecommerce/www`, `@ecommerce/utils`, `@ecommerce/database`.
- **Imports en www:** Preferir alias `@/` apuntando a `src/` (ej. `@/components/home/StickyStackSection`).
- **Env:** Variables en `.env` (no commitear). Plantilla en `.env.example` y en `apps/backend/env.template`, `apps/www/env.template`.
- **Scripts desde raíz:** `pnpm dev`, `pnpm dev:backend`, `pnpm dev:www`, `pnpm run postgres:up`, `pnpm run db:reset`, etc.
