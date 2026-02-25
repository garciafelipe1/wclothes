# Borra la base medusa-backend para poder hacer un db:setup limpio.
# Uso: desde la raíz del repo, .\scripts\drop-medusa-db.ps1
# Requiere: contenedor medusa-postgres en marcha (pnpm run postgres:up)

docker exec medusa-postgres psql -U postgres -c 'DROP DATABASE IF EXISTS "medusa-backend";'
if ($LASTEXITCODE -eq 0) {
  Write-Host "Base medusa-backend eliminada. Ejecuta: pnpm --filter @ecommerce/backend run db:setup"
} else {
  Write-Host "Error. Comprueba que el contenedor medusa-postgres este en marcha: pnpm run postgres:up"
}
