# Solicitudes — guía rápida para el agente

App de gestión de solicitudes de clientes. Especificación completa en `spec.md` y `do.md`.

## Estructura

- `api/` — API en Go con Fiber + GORM (SQLite). Servidor: `api/server.go`.
- `panel/` — Frontend Next.js 16 (App Router) + Tailwind 4. Ver `panel/AGENTS.md`.
- `prisma/schema.prisma` — esquema de datos (SQLite). Cliente generado en `src/generated/prisma`.
- `dev.db` — base de datos SQLite de desarrollo (`DATABASE_URL` en `.env`).

## Comandos

```sh
# API (Go)
cd api && go run server.go          # puerto 4000

# Panel (Next.js)
cd panel && bun dev                 # puerto 3000

# Prisma
bunx prisma generate
bunx prisma migrate dev

# Base de datos de desarrollo (después de clonar)
bun run db:setup                   # db push + db seed (crear tablas y cargar datos)
bun run db:push                    # solo crear/actualizar tablas
bun run db:seed                    # solo cargar datos (prisma/seed.ts, idempotente)
```

## Datos de desarrollo

- `prisma/seed.ts` carga con Prisma los mismos datos que usa el panel en modo mock: 4 usuarios y 9 solicitudes.
- Solo inserta lo que falta: se puede re-ejecutar sin pisar datos existentes.
- Accesos: `admin@empresa.com` / `admin123` (Administrador) · `operador@empresa.com` / `operador123` (Operador).
- El seed corre con Bun + `@prisma/adapter-libsql` (better-sqlite3 no funciona bajo Bun).
- `DATABASE_URL="file:./dev.db"` es relativo a la raíz del repo.

## Reglas

- SQLite no soporta ENUM: `rol` y `estado` son `String` con valores fijos (`ADMINISTRADOR`/`OPERADOR`, `PENDIENTE`/`EN_PROCESO`/`COMPLETADA`/`CANCELADA`). Validar en la capa de aplicación.
- Passwords siempre hasheados, nunca en texto plano. En el seed se usa bcrypt (`$2b$`); verificarlas desde la API Go con `golang.org/x/crypto/bcrypt`.
- Roles: el Administrador crea usuarios; el Operador solo gestiona solicitudes.
