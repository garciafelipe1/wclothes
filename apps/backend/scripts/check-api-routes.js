/**
 * Comprueba que todos los archivos de rutas API carguen sin error de sintaxis.
 * Se ejecuta en el build de Docker; si alguno falla, el build falla y se ve el archivo en los logs.
 */
const path = require("path")
const files = [
  "dist/api/middlewares.js",
  "dist/api/store/custom/validators.js",
  "dist/api/store/custom/route.js",
  "dist/api/store/custom/product/validators.js",
  "dist/api/store/custom/product/route.js",
  "dist/api/store/orders/route.js",
]
for (const f of files) {
  try {
    require(path.resolve(process.cwd(), f))
  } catch (e) {
    console.error("FAILED:", f, e.message)
    process.exit(1)
  }
}
console.log("All API route files load OK")
