# Productos en Medusa

El catálogo del frontend (**apps/www**) obtiene los productos desde la **API de Medusa**: listado vía **GET /store/custom** (filtros, orden, paginación) y detalle por handle con la Store API.

## Opción 1: Seed desde código (recomendado)

Los productos se definen en TypeScript y se cargan en la base con un script, igual que en proyectos de referencia (ej. Las Flores de la Imprenta).

1. **Configurar base de datos y migraciones**
   ```bash
   cd apps/backend
   pnpm db:setup   # o db:migrate si ya tenés la DB
   ```

2. **Ejecutar el seed**
   ```bash
   pnpm seed
   ```
   El script:
   - Crea región (Argentina), canal de ventas, perfil de envío, ubicación de stock.
   - Crea categorías definidas en `src/shared/constants.ts` (ej. Calzado, Catálogo).
   - Carga los productos de `src/scripts/seed/products/catalog.seed.ts` (evita duplicados por handle).
   - Crea niveles de inventario y una API key publicable para el front.

3. **Copiar la publishable key**
   - Al final del seed se imprime algo como:  
     `Add to .env: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=...`
   - Copiá ese valor en el `.env` de **apps/www** (o en la raíz del monorepo) para que el front pueda llamar a la Store API.

4. **Agregar o editar productos**
   - Editá `src/scripts/seed/products/catalog.seed.ts` (o agregá nuevos `.seed.ts` en esa carpeta e importalos en `src/scripts/seed-products.ts`).
   - Volvé a ejecutar `pnpm seed`. Los productos ya existentes (por handle) no se duplican.

## Opción 2: Panel de administración

1. Iniciá el backend: `pnpm dev` (Store API en `http://localhost:9001`).
2. Abrí el dashboard de Medusa y creá un usuario admin si es la primera vez.
3. En **Products** → **Add product** creá productos con título, handle, descripción, variantes con precios e imágenes.
4. Para que la segunda imagen se vea en hover en el catálogo, subí **más de una imagen** por producto.

## Regiones y precios

- Los precios se calculan por región. El seed crea la región Argentina (ARS) y opcionalmente USD.
- En el front se usa la primera región disponible (o la de país `ar`) para `region_id` y `currency_code` en **GET /store/custom** y en el detalle de producto.

## Si el catálogo está vacío

- **"No hay productos"**: no hay productos en la base. Ejecutá `pnpm seed` o crealos desde el admin.
- **"Error de conexión"**: el backend no está corriendo o `NEXT_PUBLIC_MEDUSA_BACKEND_URL` en **apps/www** no es correcta (por defecto `http://localhost:9001`). Asegurate también de tener `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` después de correr el seed.
