/**
 * Parche para @medusajs/utils: en MikroORM 6.4, EventManager.subscribers es un Set,
 * no un array; el código usa .some() -> hay que usar Array.from(...).some()
 */
const path = require("path");
const fs = require("fs");

const relPath = path.join("@medusajs", "utils", "dist", "modules-sdk", "medusa-internal-service.js");
const candidates = [
  path.join(__dirname, "..", "node_modules", relPath),
  path.join(__dirname, "..", "..", "node_modules", relPath),
];
const file = candidates.find((f) => fs.existsSync(f));

if (!file) {
  console.warn("[postinstall] @medusajs/utils no encontrado, omitiendo parche.");
  process.exit(0);
}

let content = fs.readFileSync(file, "utf8");
const target = "manager.getEventManager().subscribers.some(";
const replacement = "Array.from(manager.getEventManager().subscribers).some(";

if (content.includes(target) && !content.includes(replacement)) {
  content = content.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replacement);
  fs.writeFileSync(file, content);
  console.log("[postinstall] Parche aplicado: medusa-internal-service.js (MikroORM Set->array)");
}
