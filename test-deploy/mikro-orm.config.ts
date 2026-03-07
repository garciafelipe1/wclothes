import { defineConfig } from "@mikro-orm/postgresql"
import { Migrator } from "@mikro-orm/migrations"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  clientUrl: process.env.DATABASE_URL!,
  entities: ["node_modules/@medusajs/framework/dist/models/**/*.js"],
  migrations: {
    path: "./src/migrations",
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    dropTables: false,
    safe: false,
    snapshot: true,
    emit: "ts",
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV === "development",
})
