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
