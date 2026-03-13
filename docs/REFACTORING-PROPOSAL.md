# Propuesta de refactorización – Clean Code y arquitectura

Análisis como arquitecto de software senior: problemas detectados, nueva estructura sugerida y ejemplos de código refactorizado, justificados con principios de Clean Code y SOLID.

---

## 1. Problemas encontrados

### 1.1 Duplicación y Single Source of Truth (SRP / DRY)

| Problema | Ubicación | Impacto |
|----------|-----------|--------|
| **URL del backend repetida** | `apps/www`: `medusa.ts`, `order.service.ts`, `catalog/page.tsx`, `next.config.ts` | Cambiar entorno implica tocar 4+ archivos; riesgo de inconsistencias. |
| **Fallback `"http://localhost:9001"`** | Mismo en todos; en producción debería venir solo de env. | Viola DRY y Single Source of Truth. |
| **Lógica de filtros de catálogo** | Backend: `route.ts` (~160 líneas) hace query + filtros + orden + paginación en un solo handler. | Responsabilidad única violada; difícil de testear y reutilizar. |
| **Mapeo producto Medusa → UI** | `mapMedusaProduct` definido dentro de `catalog/page.tsx`; tipos similares en `product.service.ts` y backend. | Duplicación de lógica de mapeo y de tipos entre capas. |

### 1.2 Acoplamiento y dependencias

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| **Servicios atados al cliente concreto** | `product.service.ts`, `cart.service.ts` usan `medusa` (instancia global) directamente. | Dificulta tests con mocks y cambio de implementación (ej. otro cliente HTTP). |
| **Server Actions acopladas a cookies y región** | `add-to-cart.ts` mezcla: validación, obtención de región, cookie, llamada API. | Difícil de testear por unidades; cambios en flujo afectan todo el archivo. |
| **Ruta API backend hace demasiado** | `GET /store/custom` construye filtros, ejecuta query, aplica filtros en memoria (categoría, color, talle, sale, precio), ordena, pagina. | Un cambio en un filtro puede romper otros; no hay separación por responsabilidad. |

### 1.3 Nombres y claridad

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| **Constantes mágicas** | Backend: `"Color"`, `"Colour"`, `"Talle"`, `"Talla"`, `"Size"` en strings dentro del handler. | Deberían estar en `shared/constants` o en el validador; facilita i18n y cambios. |
| **Tipos “Raw” vs “UI”** | `CatalogProductRaw` en service, `CatalogProduct` en components; relación no explícita. | Un solo tipo de dominio bien nombrado (ej. `StoreProduct`) y DTOs claros mejoran legibilidad. |
| **Paquetes sin uso** | `packages/utils` (solo `noop`), `packages/database` (vacío); ninguna app los usa. | Ruido en el monorepo; confusión sobre qué es compartido. |

### 1.4 Estructura y escalabilidad

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| **Actions en una sola capa** | `app/actions/cart/*`, `app/actions/checkout/*` sin agrupar por dominio o por “caso de uso”. | Crece sin criterio; mezcla de “cart” y “checkout” en mismo nivel. |
| **Lib mezcla cliente y config** | `lib/medusa.ts` crea cliente y define `baseUrl`/`publishableKey` en el mismo archivo. | Config (env) y construcción del cliente deberían estar separados para testabilidad. |
| **Backend: validadores separados pero filtros en handler** | Validators definen schema; la lógica de “a qué campo de DB corresponde category/color/talle” está en el route. | Filtros podrían ser funciones puras reutilizables (testables) y el route solo orquestar. |

### 1.5 Testabilidad

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| **Servicios no inyectables** | `productService`, `medusa` son instancias concretas importadas. | Sin inyección de dependencias, tests requieren mocks globales o backends reales. |
| **Handlers sin extracción de lógica** | Toda la lógica de `/store/custom` dentro del handler. | No se puede testear “filtro por precio” o “orden por fecha” sin levantar HTTP. |
| **Región/cookies en acciones** | `getRegionByCountryCode`, `getCartId` llamados dentro de la acción. | Tests de la acción necesitan mockear región y cookies además del API. |

---

## 2. Estructura propuesta del proyecto

Se mantiene el monorepo (pnpm, apps + packages) y se clarifican responsabilidades y lugares únicos para config y tipos.

### 2.1 Raíz

```
ecommerce/
├── apps/
│   ├── backend/
│   └── www/
├── packages/
│   ├── shared-types/     # Tipos compartidos backend ↔ storefront (opcional, ver 2.3)
│   └── utils/            # Solo si hay lógica real compartida; si no, eliminar o dejar mínimo
├── scripts/
├── docs/
├── .github/
├── package.json
├── pnpm-workspace.yaml
└── .env.example         # Unificado: PORT backend, URLs, CORS (una sola fuente)
```

- **Eliminar o repensar** `packages/database` si sigue vacío.
- **Un solo `.env.example`** en raíz (o uno por app pero con comentarios que referencien el otro) para evitar contradicciones (ej. PORT 8000 vs 9001).

### 2.2 apps/backend

```
apps/backend/
├── src/
│   ├── api/
│   │   ├── middlewares.ts
│   │   └── store/
│   │       ├── custom/
│   │       │   ├── route.ts              # Delgado: validar → orquestar → responder
│   │       │   ├── validators.ts
│   │       │   ├── catalog-service.ts    # Toda la lógica: query + filtros + orden + paginación
│   │       │   └── filters/              # (opcional) filter-by-category.ts, filter-by-price.ts
│   │       └── orders/...
│   ├── lib/
│   │   ├── get-lowest-price.ts
│   │   └── constants.ts                  # Nombres de opciones: COLOR_OPTION_TITLES, SIZE_OPTION_TITLES
│   ├── scripts/
│   └── shared/
│       └── constants.ts                  # Reutilizar desde lib o unificar aquí
├── medusa-config.ts
└── ...
```

- **Principio:** el **route** solo valida input, llama a un **CatalogService** (o “catalog use case”) y devuelve JSON. Filtros y orden en servicios/funciones puras.
- **Constantes:** títulos de opciones (Color, Talle, etc.) en un solo lugar para usarlos en validators y en filtros.

### 2.3 apps/www

```
apps/www/
├── src/
│   ├── app/
│   │   ├── (app)/[locale]/[countryCode]/(public)/
│   │   │   ├── page.tsx
│   │   │   ├── catalog/
│   │   │   │   └── page.tsx              # Delgado: searchParams → service → map → UI
│   │   │   ├── checkout/...
│   │   │   └── orders/...
│   │   └── actions/
│   │       ├── cart/                     # add-to-cart, update, remove, get-for-drawer
│   │       └── checkout/                 # update-shipping, complete-cart
│   ├── components/
│   ├── lib/
│   │   ├── env.ts                        # NUEVO: getMedusaBaseUrl(), getPublishableKey()
│   │   ├── medusa.ts                     # Usa env.ts; exporta getMedusaClient(options?)
│   │   ├── data/
│   │   └── ...
│   ├── services/
│   │   ├── product.service.ts             # Opcional: recibir cliente por parámetro para tests
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── mapping/                          # NUEVO (o dentro de lib): Medusa DTO → UI
│   │   └── product-mapping.ts            # mapMedusaProductToCatalog(), tipos DTO
│   ├── types/
│   └── i18n/
├── next.config.ts                        # Usa getMedusaBaseUrl() o process.env una vez
└── ...
```

- **Single source of truth para URL y key:** `lib/env.ts` exporta `getMedusaBaseUrl()` y `getPublishableKey()`. Todo el resto (medusa.ts, order.service, catalog page) usa esas funciones.
- **Mapeo producto:** un único módulo `mapping/product-mapping.ts` con `mapMedusaProductToCatalog(raw)` y tipos claros (DTO desde API vs tipo de catálogo UI). La página de catálogo solo llama al service y al mapper.
- **Actions:** mantener por dominio (cart / checkout); si crecen, se puede introducir una capa “use cases” que reciba región/cartId y llame al API (para testear sin cookies).

---

## 3. Ejemplos de código refactorizado

### 3.1 Single source of truth para URL del backend (www)

**Principio:** DRY, Single Responsibility (config en un solo lugar).

**Antes (repetido en varios archivos):**

```ts
// medusa.ts, order.service.ts, catalog/page.tsx
process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
```

**Después:**

```ts
// apps/www/src/lib/env.ts

const FALLBACK_BACKEND_URL = "http://localhost:9001"

export function getMedusaBaseUrl(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? FALLBACK_BACKEND_URL
}

export function getPublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
}
```

```ts
// apps/www/src/lib/medusa.ts

import Medusa from "@medusajs/js-sdk"
import { getMedusaBaseUrl, getPublishableKey } from "./env"

export function getMedusaClient() {
  return new Medusa({
    baseUrl: getMedusaBaseUrl(),
    publishableKey: getPublishableKey() ?? undefined,
  })
}

export const medusa = getMedusaClient()
```

```ts
// apps/www/src/services/order.service.ts (solo cambiar la línea del backendUrl)

import { getMedusaBaseUrl } from "@/lib/env"

// Donde se use la URL (ej. para redirect o link):
const backendUrl = getMedusaBaseUrl()
```

```ts
// apps/www/src/app/(app)/[locale]/[countryCode]/(public)/catalog/page.tsx

import { getMedusaBaseUrl } from "@/lib/env"

// ...
const backendUrl = getMedusaBaseUrl()
```

- **next.config.ts:** puede seguir usando `process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL` con fallback, o una función que leas desde un `env.ts` que exporte lo mismo (según límites de Next en build). Lo importante es que en el resto del código solo se use `getMedusaBaseUrl()`.

---

### 3.2 Backend: extraer lógica de catálogo a un servicio

**Principio:** SRP, testabilidad. El handler solo orquesta; la lógica de “qué filtrar y cómo ordenar” está en un módulo testeable.

**Antes:** todo en `route.ts` (query + filtros en memoria + orden + paginación).

**Después (esquema):**

```ts
// apps/backend/src/api/store/custom/catalog-service.ts

import type { ProductWithCalculatedPrice } from "../../../lib/get-lowest-price"
import { getLowestPrice } from "../../../lib/get-lowest-price"
import { Query } from "@medusajs/framework/utils"
import { OPTION_TITLES } from "../../../lib/constants"

export type CatalogQueryParams = {
  q?: string
  order?: "price_asc" | "price_desc" | "created_at_asc" | "created_at_desc"
  category?: string
  sale?: boolean
  color?: string
  talle?: string
  min_price?: number
  max_price?: number
  region_id?: string
  currency_code?: string
  page?: number
}

const DEFAULT_LIMIT = 12

export function buildTitleFilter(q: string | undefined): Record<string, unknown> {
  if (!q?.trim()) return {}
  return { title: { $ilike: `%${q.trim()}%` } }
}

export function filterByCategory<T extends { categories?: Array<{ name?: string }> }>(
  items: T[],
  category: string | undefined
): T[] {
  if (!category) return items
  return items.filter((p) =>
    p.categories?.some((c) => c?.name === category)
  )
}

export function filterByOption(
  items: unknown[],
  optionTitles: string[],
  value: string | undefined
): unknown[] {
  if (!value) return items
  return items.filter((p: any) =>
    p.variants?.some((v: any) =>
      v.options?.some(
        (o: any) =>
          o.option && optionTitles.includes(o.option.title) && o.value === value
      )
    )
  )
}

export function filterBySale(items: ProductWithCalculatedPrice[]): ProductWithCalculatedPrice[] {
  return items.filter((p) => {
    const variants = p.variants ?? []
    return variants.some((v) => {
      const orig = v.calculated_price?.original_amount
      const calc = v.calculated_price?.calculated_amount
      return typeof orig === "number" && typeof calc === "number" && orig > calc
    })
  })
}

export function filterByPriceRange(
  items: ProductWithCalculatedPrice[],
  min?: number,
  max?: number
): ProductWithCalculatedPrice[] {
  return items.filter((p) => {
    const price = getLowestPrice(p)
    if (min != null && price < min) return false
    if (max != null && price > max) return false
    return true
  })
}

export function sortByPrice(
  items: ProductWithCalculatedPrice[],
  order: "price_asc" | "price_desc"
): ProductWithCalculatedPrice[] {
  return [...items].sort((a, b) =>
    order === "price_asc"
      ? getLowestPrice(a) - getLowestPrice(b)
      : getLowestPrice(b) - getLowestPrice(a)
  )
}

// CatalogService: recibe query de Medusa, aplica filtros/orden/paginación y devuelve { result, metadata }
export async function getCatalog(
  query: Query,
  params: CatalogQueryParams
): Promise<{ result: unknown[]; metadata: Record<string, unknown> }> {
  const region_id = params.region_id ?? ""
  const currency_code = params.currency_code ?? "ars"
  const page = params.page ?? 1
  const needsManual =
    params.order === "price_asc" ||
    params.order === "price_desc" ||
    !!params.category ||
    !!params.sale ||
    !!params.color ||
    !!params.talle ||
    params.min_price != null ||
    params.max_price != null

  const { data, metadata } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "description", "thumbnail",
      "categories.name",
      "variants.id",
      "variants.calculated_price.calculated_amount",
      "variants.calculated_price.original_amount",
      "variants.options.value",
      "variants.options.option.title",
      "images.url",
      "metadata",
    ],
    filters: buildTitleFilter(params.q),
    pagination: needsManual
      ? undefined
      : {
          take: DEFAULT_LIMIT,
          skip: (page - 1) * DEFAULT_LIMIT,
          order:
            params.order === "created_at_desc"
              ? { created_at: "DESC" }
              : params.order === "created_at_asc"
                ? { created_at: "ASC" }
                : {},
        },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region_id || undefined,
          currency_code,
        }),
      },
    },
  })

  let result = Array.isArray(data) ? [...data] : []
  result = filterByCategory(result, params.category)
  result = filterByOption(result, OPTION_TITLES.COLOR, params.color) as ProductWithCalculatedPrice[]
  result = filterByOption(result, OPTION_TITLES.SIZE, params.talle) as ProductWithCalculatedPrice[]
  if (params.sale) result = filterBySale(result)
  result = filterByPriceRange(result, params.min_price, params.max_price)
  if (params.order === "price_asc" || params.order === "price_desc") {
    result = sortByPrice(result, params.order)
  }

  let outMetadata = metadata as Record<string, unknown>
  if (!outMetadata && result.length > 0) {
    const skip = (page - 1) * DEFAULT_LIMIT
    const slice = result.slice(skip, skip + DEFAULT_LIMIT)
    outMetadata = {
      count: slice.length,
      skip,
      take: DEFAULT_LIMIT,
      total: result.length,
    }
    result = slice
  }
  return { result, metadata: outMetadata }
}
```

```ts
// apps/backend/src/lib/constants.ts

export const OPTION_TITLES = {
  COLOR: ["Color", "Colour"],
  SIZE: ["Talle", "Talla", "Size"],
} as const
```

El **route** queda reducido a:

```ts
// apps/backend/src/api/store/custom/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { GetStoreCustomSchemaType } from "./validators"
import { getCatalog } from "./catalog-service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const params = (req.validatedQuery ?? req.query) as GetStoreCustomSchemaType
  const { result, metadata } = await getCatalog(query, {
    q: params.q,
    order: params.order,
    category: params.category,
    sale: params.sale,
    color: params.color,
    talle: params.talle,
    min_price: params.min_price,
    max_price: params.max_price,
    region_id: params.region_id ?? "",
    currency_code: params.currency_code ?? "ars",
    page: params.page ?? 1,
  })
  res.json({ result, metadata })
}
```

- **Ventajas:** filtros y orden testables sin HTTP; constantes de opciones en un solo lugar; handler fácil de leer.

---

### 3.3 www: mapeo de producto en un solo módulo

**Principio:** DRY, tipos claros. Un solo lugar que transforma la respuesta del API al modelo de la UI.

**Antes:** `mapMedusaProduct` dentro de `catalog/page.tsx`; tipos repartidos entre service y componente.

**Después:**

```ts
// apps/www/src/mapping/product-mapping.ts (o lib/mapping/product-mapping.ts)

import type { CatalogProductRaw } from "@/services/product.service"
import type { CatalogProduct } from "@/components/catalog"  // o definir el tipo aquí

const COLOR_OPTION_TITLES = ["Color", "Colour"]

export function mapMedusaProductToCatalog(raw: Record<string, unknown>): CatalogProduct {
  const images = Array.isArray(raw.images) ? (raw.images as Array<{ url?: string }>) : []
  const thumbnail =
    (typeof raw.thumbnail === "string" && raw.thumbnail) || images[0]?.url || null
  const thumbnailHover = images.length > 1 && images[1]?.url ? images[1].url : null

  const variants = Array.isArray(raw.variants)
    ? (raw.variants as Array<{
        calculated_price?: { calculated_amount?: number; currency_code?: string }
        options?: Array<{ value?: string; option?: { title?: string } }>
      }>)
    : []

  const colorValues = new Set<string>()
  for (const v of variants) {
    for (const o of v.options ?? []) {
      if (o.option && COLOR_OPTION_TITLES.includes(o.option.title) && o.value) {
        colorValues.add(o.value)
      }
    }
  }

  return {
    id: String(raw.id),
    title: typeof raw.title === "string" ? raw.title : null,
    handle: typeof raw.handle === "string" ? raw.handle : null,
    thumbnail,
    thumbnailHover: thumbnailHover ?? undefined,
    variants: variants.map((v) => ({ calculated_price: v.calculated_price })),
    colorValues: Array.from(colorValues),
  }
}
```

En `catalog/page.tsx` solo se importa y se usa:

```ts
import { mapMedusaProductToCatalog } from "@/mapping/product-mapping"

// ...
products = list.map((p) => mapMedusaProductToCatalog(p as unknown as Record<string, unknown>))
```

- El tipo `CatalogProduct` puede vivir en `types/` o re-exportarse desde el componente; lo importante es que el mapper tenga un único contrato de entrada (DTO del API) y salida (modelo de catálogo UI).

---

## 4. Resumen de prioridades

| Prioridad | Cambio | Esfuerzo | Beneficio |
|-----------|--------|----------|-----------|
| Alta | `lib/env.ts` + usar `getMedusaBaseUrl()` en www | Bajo | Una sola fuente de verdad para URL/key; menos errores en deploys. |
| Alta | Mover `mapMedusaProduct` a `mapping/product-mapping.ts` | Bajo | DRY, un solo lugar para cambiar el contrato UI. |
| Media | Backend: extraer `catalog-service.ts` + constantes `OPTION_TITLES` | Medio | Handlers más legibles; filtros y orden testables. |
| Media | Unificar `.env.example` (raíz vs backend) y documentar PORT | Bajo | Menos confusión en desarrollo. |
| Baja | Eliminar o documentar `packages/utils` y `packages/database` | Bajo | Menos ruido en el monorepo. |
| Baja | Inyección de dependencias en servicios www (cliente Medusa inyectable) | Medio | Mejor testabilidad; se puede hacer gradualmente. |

---

## 5. Partes que necesitaría ver para profundizar

- **Flujo completo de checkout:** si hay más lógica en acciones (validación, cálculos), podría proponer un “CheckoutService” o use case en el frontend.
- **Tipos de orden y carrito:** si querés compartir tipos entre backend y www vía `packages/shared-types`, conviene ver cómo se serializan hoy (Store API responses).
- **Tests existentes:** si hay tests, la refactorización puede priorizar módulos que ya se testean o que querés empezar a testear (ej. `catalog-service`, `getLowestPrice`, mappers).
- **test-deploy:** si se mantiene como “copia de backend para otro deploy”, sugeriría documentar qué comparte y qué no (o un script que genere ese árbol desde backend) para no duplicar lógica a largo plazo.

Si indicás por dónde querés empezar (por ejemplo “solo env + mapper en www” o “solo backend catalog-service”), se puede bajar esto a pasos concretos de PRs.
