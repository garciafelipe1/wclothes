const path = require("path")
const fs = require("fs")
const dotenv = require("dotenv")
const { defineConfig } = require("@medusajs/framework/utils")

const cwd = process.cwd()
const rootEnvPath = path.resolve(cwd, "..", "..", ".env")
const localEnvPath = path.resolve(cwd, ".env")
// Monorepo: cargar .env de la raíz primero, luego el de apps/backend (local overrides)
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath })
}
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath })
}
// Si no hay ninguno en raíz, cargar solo el de la carpeta actual
if (!fs.existsSync(rootEnvPath) && !fs.existsSync(localEnvPath)) {
  dotenv.config()
}

// Rutas para que Vite resuelva módulos del admin (pnpm no siempre expone estos subpaths)
function getDraftOrderAdminPath() {
  try {
    const pkgDir = path.dirname(require.resolve("@medusajs/draft-order/package.json"))
    return path.join(pkgDir, ".medusa/server/src/admin/index.mjs")
  } catch {
    return path.join(process.cwd(), "node_modules/@medusajs/draft-order/.medusa/server/src/admin/index.mjs")
  }
}
function getAdminSharedPath() {
  try {
    return path.dirname(require.resolve("@medusajs/admin-shared/package.json"))
  } catch {
    return path.join(process.cwd(), "node_modules/@medusajs/admin-shared")
  }
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions:
      process.env.NODE_ENV === "development"
        ? { connection: { ssl: false } }
        : { connection: { ssl: { rejectUnauthorized: false } } },
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:9001",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7001,http://localhost:9001",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  plugins: [],
  admin: {
    vite: () => ({
      resolve: {
        alias: {
          "@medusajs/draft-order/admin": getDraftOrderAdminPath(),
          "@medusajs/admin-shared": getAdminSharedPath(),
        },
      },
    }),
  },
})
