import { defineConfig } from "prisma/config";

export default defineConfig({
  // Archivo principal del schema
  schema: "prisma/schema.prisma",
  // Donde se generan las migraciones
  migrations: {
    path: "prisma/migrations",
    // Comando que carga los datos de desarrollo (`bunx prisma db seed`)
    seed: "bun prisma/seed.ts",
  },
  // Conexion a la base de datos (SQLite)
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
