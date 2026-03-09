# Deploy en Railway (como Las Flores de la Imprenta)

## Arquitectura

- **Frontend (www)**: Next.js en contenedor
- **Backend (Medusa)**: API en contenedor
- **PostgreSQL**: Base de datos (Railway o externa)
- **Redis**: Caché y sesiones (recomendado para producción)

## Opción 1: Imágenes Docker desde GitHub Actions

Los workflows `.github/workflows/build-*.yml` construyen las imágenes y las suben a GitHub Container Registry (ghcr.io).

### Configurar GitHub Secrets

En el repo → Settings → Secrets and variables → Actions, agregar:

| Secret | Descripción |
|--------|-------------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL del backend en Railway (ej. https://ecommerce-backend.railway.app) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable key de Medusa (después del seed) |

### Conectar Railway a las imágenes

1. **Backend**: New Service → Docker Image → `ghcr.io/TU_USUARIO/ecommerce-backend:latest`
2. **Frontend**: New Service → Docker Image → `ghcr.io/TU_USUARIO/ecommerce-www:latest`
3. **PostgreSQL**: New → Database → PostgreSQL
4. **Redis**: New → Database → Redis (opcional pero recomendado)

### Variables de entorno en Railway

**Backend:**
- `DATABASE_URL` (desde PostgreSQL de Railway)
- **`REDIS_URL`** (desde Redis de Railway) — **obligatorio en producción** para evitar:
  - El aviso *"connect.session() MemoryStore is not designed for a production environment"* (sesiones en memoria).
  - El mensaje *"redisUrl not found. A fake redis instance will be used"*.
- `JWT_SECRET`, `COOKIE_SECRET`
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` (incluir la URL del frontend)

**Frontend (build args ya van en la imagen; para runtime si hace falta):**
- Las variables `NEXT_PUBLIC_*` se embeben en el build. Si cambiás la URL del backend, hay que rebuildear la imagen.

## Opción 2: Railway build desde Dockerfile

En lugar de usar imágenes pre-construidas, Railway puede construir desde el repo:

1. **Backend**: Conectar repo → Root Directory vacío → Dockerfile → Target: `runner_backend`
2. **Frontend**: Mismo repo → Root Directory vacío → Dockerfile → Target: `runner_www`

Configurar en Railway el target del build según el servicio.

## Orden de deploy

1. PostgreSQL (crear primero)
2. Redis (opcional)
3. Backend (necesita DATABASE_URL)
4. Frontend (necesita NEXT_PUBLIC_MEDUSA_BACKEND_URL = URL del backend)

## Migraciones

El script `start-railway.sh` ejecuta `medusa db:migrate` antes de iniciar. La primera vez que el backend arranca, corre las migraciones automáticamente.

## Seed

Para cargar productos, ejecutar el seed contra la DB de producción (desde local con DATABASE_URL de prod, o desde un job temporal en Railway).

---

## Si ves 502 en GET / y el backend no arranca

- **502** significa que el proxy (Railway) no recibe respuesta del backend: el proceso de Medusa **no llega a escuchar** en el puerto (p. ej. falla al registrar rutas API y hace exit).
- Si en los logs sigue saliendo **"An error occurred while registering API Routes. Error: missing ) after argument list"** pero en local el build ya está bien (sin `api_store_backup`, sin `?.`/`??` en `dist/api`), suele ser **caché de build** en Railway.

**Qué hacer:**

1. **Limpiar caché de build y volver a desplegar**
   - En Railway: proyecto → servicio **Backend** → pestaña **Settings** (o **Deploy**).
   - Buscar opción **"Clear build cache"** / **"Redeploy"** con opción de **"Clear cache"** o **"Rebuild from scratch"**.
   - Ejecutar un **nuevo deploy** con caché limpia para que use el código actual del repo (sin `api_store_backup`).
2. Si usas **Dockerfile** en la raíz: comprobar que el servicio Backend use **Build** con Dockerfile y target **`runner_backend`**, y que el **Root Directory** sea el del monorepo (o el que corresponda según tu setup). Para forzar un build sin caché, en Railway → Backend → **Variables** añade una **Build Variable** (o Build Argument): `CACHE_BUST` = `1` (o `2`, `3`… al cambiar el valor se reconstruyen las capas).
3. Tras el redeploy, revisar de nuevo los logs; si el error desaparece, el backend debería quedar en **Running** y dejar de devolver 502.

---

## Estrategia: desplegar sin rutas → Redis → reintroducir rutas

Si el backend se reinicia en bucle por un error al cargar rutas API personalizadas, seguir este orden:

### 1. Desplegar sin rutas personalizadas (estado actual)

- Las rutas custom están en `apps/backend/src/api/` (store/custom, store/orders, etc.). La carpeta `api_store_backup` fue **eliminada** para evitar que el loader cargara código antiguo.
- El script de build hace `rimraf dist && medusa build`; en `dist/api/` solo quedan las rutas actuales.
- Desplegar el backend en Railway. Si sigue fallando, **limpiar caché de build** (ver sección "Si ves 502..." arriba).

### 2. Configurar Redis en Railway

- En el proyecto Railway: **New → Database → Redis** (o add-on Redis).
- En el servicio **Backend**, añadir variable de entorno:
  - `REDIS_URL` = valor que Railway asigna al recurso Redis (suele aparecer en Variables o en la ficha del Redis).
- El `medusa-config.ts` ya usa `REDIS_URL` (o `CACHE_REDIS_URL`) para activar el módulo de cache con Redis; sin esta variable se usa el cache en memoria.

### 3. Comprobar estabilidad

- Con Redis configurado, dejar el backend corriendo y revisar logs. No deberían aparecer avisos de MemoryStore ni reinicios inesperados.

### 4. Rutas personalizadas

- Las rutas ya están en `apps/backend/src/api/store/` (custom, orders, etc.). No hay que mover ninguna carpeta; si hubieras tenido un backup, no lo coloques bajo `src/api` con nombre que el loader pueda confundir (evitar duplicar rutas en `dist`).

### 5. Si vuelve a fallar al cargar rutas

- Revisar los **logs del backend** en Railway (el error suele aparecer al arrancar: "An error occurred while registering API Routes" o "missing ) after argument list").
- Con esa información se puede depurar la ruta concreta que falla (p. ej. `store/custom/route.ts`, `store/orders/route.ts`) y corregir sintaxis o dependencias.

---

## Si el error "missing ) after argument list" persiste

Se aplicaron varios cambios en las rutas API para evitar que el JS generado provoque ese error:
1. **Imports**: en `store/custom/route.ts`, `import type { ... }` en una línea e `import { getLowestPrice }` en otra (no mezclar tipo y valor en el mismo import).
2. **`as const`**: eliminado en `store/custom/route.ts` y `store/orders/route.ts` en literales de orden (`"DESC"`, `"ASC"`). También eliminado en `store/custom/validators.ts` en `SORT_OPTIONS` y `CATEGORY_OPTIONS` (usar `z.enum(SORT_OPTIONS as [string, ...string[]])` para el tipo).
3. **Node**: en Railway, usar Node 20 (variable `NODE_VERSION=20` o configurar en el panel) para coincidir con `engines` del backend.

Si tras el push el backend en Railway sigue cayendo:

### 1. Confirmar que el fix está en el commit desplegado

- En el commit que Railway está construyendo debe estar el `route.ts` con:
  - `import type { ProductWithCalculatedPrice } from "..."` en una línea.
  - `import { getLowestPrice } from "..."` en otra.
- No debe haber `import { getLowestPrice, type ProductWithCalculatedPrice }`.

### 2. Reproducir el arranque como en Railway (local)

Para ver el mismo error en local con la misma forma de arranque:

```bash
cd apps/backend
pnpm run build
# Arrancar como en el contenedor (usa el CLI de Medusa):
# En Linux/mac: sh scripts/start-railway.sh
# En Windows (PowerShell): buscar cli.js en node_modules y ejecutar:
#   node (ruta)/cli.js start -p 8000 -H 0.0.0.0
```

Si el error aparece ahí, el stack trace indicará **archivo y línea** del código cargado (p. ej. dentro de `dist/api/...` o del loader de Medusa).

### 3. Revisar el stack trace en Railway

- En los logs del servicio Backend en Railway, copiar el **stack trace completo**.
- Si dice algo como `.../dist/loaders/api.js:56`, el fallo está en el loader de Medusa al cargar una ruta; el mensaje anterior en el stack suele indicar el **archivo de tu proyecto** que provocó el error (p. ej. `dist/api/store/custom/route.js`).

### 4. Comprobar todos los archivos que carga el API

Archivos que participan al registrar rutas store:

- `src/api/store/custom/route.ts`
- `src/api/store/custom/validators.ts`
- `src/api/store/custom/product/route.ts`
- `src/api/store/custom/product/validators.ts`
- `src/api/store/orders/route.ts`
- `src/api/middlewares.ts`

En todos ellos:

- No usar alias `@/` en imports (usar rutas relativas).
- Evitar `import { x, type Y } from "..."`; usar `import type { Y }` en una línea e `import { x }` en otra.
- En objetos y arrays que se usan en runtime, evitar `as const` por si el compilado en el contenedor emite algo que el Node de Railway no parsea bien; usar el literal directo (y en validators, `z.enum(arr as [string, ...string[]])` si hace falta).

### Errores típicos en los logs de Railway

- **"An error occurred while registering API Routes. Error: missing ) after argument list"** → El fallo está en alguno de los archivos listados arriba; suele ser por `as const` o imports mezclados. El stack en `attributes.stack` apunta a `api.js` del loader; el archivo problemático es uno de los que ese loader está cargando.
- **"Error starting server"** → Suele ser consecuencia del error anterior.
- **"connect.session() MemoryStore is not designed for a production environment"** → Advertencia: en producción conviene usar Redis (configurar `REDIS_URL`); no impide que el backend arranque.
- Tras cualquier cambio, ejecutar `pnpm --filter @ecommerce/backend run build` y revisar que `dist/api/.../*.js` no tenga sintaxis rara (paréntesis sin cerrar, comas faltantes).

### 5. Último recurso: desplegar sin rutas custom para dejar el backend estable

Si hay que tener el backend arriba ya y seguir depurando después:

- Mover `apps/backend/src/api/store` a `apps/backend/src/api_store_backup` (fuera de `src/api`).
- Build y deploy: el backend arrancará sin esas rutas; el resto de la API (admin, store por defecto) sigue funcionando.
- Cuando se localice y corrija el fallo, volver a mover `api_store_backup` → `src/api/store` y desplegar de nuevo.
