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

// Rutas para que Vite resuelva módulos del admin
// Monorepo: node_modules en raíz. Deploy/Docker: node_modules en __dirname
const rootDir = fs.existsSync(path.join(__dirname, "node_modules", "@medusajs/framework"))
  ? __dirname
  : path.resolve(__dirname, "..", "..")
const rootNodeModules = path.join(rootDir, "node_modules")

function getDraftOrderAdminPath() {
  try {
    const pkgDir = path.dirname(require.resolve("@medusajs/draft-order/package.json", { paths: [rootNodeModules] }))
    return path.join(pkgDir, ".medusa/server/src/admin/index.mjs")
  } catch {
    return path.join(rootNodeModules, "@medusajs/draft-order/.medusa/server/src/admin/index.mjs")
  }
}
function getAdminSharedPath() {
  try {
    return path.dirname(require.resolve("@medusajs/admin-shared/package.json", { paths: [rootNodeModules] }))
  } catch {
    return path.join(rootNodeModules, "@medusajs/admin-shared")
  }
}

// Redis: Railway y otros proveedores suelen exponer REDIS_URL; también aceptamos CACHE_REDIS_URL
const redisUrl = process.env.REDIS_URL || process.env.CACHE_REDIS_URL

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
  // Cache + Event Bus con Redis cuando REDIS_URL está definida (p. ej. add-on Redis en Railway)
  // Event Bus: evita "Local Event Bus" en producción; usa la misma REDIS_URL que el cache
  modules: redisUrl
    ? [
        {
          resolve: "@medusajs/medusa/caching",
          options: {
            providers: [
              {
                resolve: "@medusajs/caching-redis",
                id: "caching-redis",
                is_default: true,
                options: { redisUrl },
              },
            ],
          },
        },
        {
          resolve: "@medusajs/medusa/event-bus-redis",
          options: {
            redisUrl: process.env.EVENTS_REDIS_URL || redisUrl,
            ...(process.env.NODE_ENV === "production" && {
              jobOptions: {
                removeOnComplete: { age: 3600, count: 1000 },
                removeOnFail: { age: 3600, count: 1000 },
              },
            }),
          },
        },
      ]
    : [],
  plugins: [],
  admin: {
    disable: false,
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
