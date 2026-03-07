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
- `REDIS_URL` (desde Redis de Railway)
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

## Estrategia: desplegar sin rutas → Redis → reintroducir rutas

Si el backend se reinicia en bucle por un error al cargar rutas API personalizadas, seguir este orden:

### 1. Desplegar sin rutas personalizadas (estado actual)

- Las rutas custom están en `apps/backend/src/api_store_backup/` (fuera de `src/api`), así que el loader de API de Medusa **no las carga**.
- Desplegar el backend en Railway tal cual. Comprobar que el servicio quede **estable** (sin reinicios cada ~5 min).

### 2. Configurar Redis en Railway

- En el proyecto Railway: **New → Database → Redis** (o add-on Redis).
- En el servicio **Backend**, añadir variable de entorno:
  - `REDIS_URL` = valor que Railway asigna al recurso Redis (suele aparecer en Variables o en la ficha del Redis).
- El `medusa-config.ts` ya usa `REDIS_URL` (o `CACHE_REDIS_URL`) para activar el módulo de cache con Redis; sin esta variable se usa el cache en memoria.

### 3. Comprobar estabilidad

- Con Redis configurado, dejar el backend corriendo y revisar logs. No deberían aparecer avisos de MemoryStore ni reinicios inesperados.

### 4. Reintroducir las rutas personalizadas

- En el repo, mover la carpeta de vuelta bajo `src/api` con el nombre que Medusa expone como scope:
  - `apps/backend/src/api_store_backup` → `apps/backend/src/api/store`
- Revisar imports relativos en esas rutas (p. ej. `../../lib` y `../../shared` deben volver a `../../../lib` y `../../../shared` porque la ruta será `src/api/store/...`).
- Hacer commit, volver a desplegar el backend en Railway.

### 5. Si vuelve a fallar al cargar rutas

- Revisar los **logs del backend** en Railway (el error suele aparecer al arrancar: "An error occurred while registering API Routes" o "missing ) after argument list").
- Con esa información se puede depurar la ruta concreta que falla (p. ej. `store/custom/route.ts`, `store/orders/route.ts`) y corregir sintaxis o dependencias.
