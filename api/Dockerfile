# Build stage for Go API
FROM golang:1.25-alpine AS builder

# Necesario para CGO con go-sqlite3
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app

# Copiar go.mod y go.sum
COPY api/go.mod api/go.sum ./
RUN go mod download

# Copiar código de la API
COPY api/ ./

# Compilar binario estático con CGO
ENV CGO_ENABLED=1
RUN go build -o /app/api-server ./server.go

# Runtime stage con Bun (para Prisma + seed)
FROM oven/bun:1.2-alpine AS runtime

# Librerías necesarias para SQLite
RUN apk add --no-cache ca-certificates sqlite-libs

WORKDIR /app

# Copiar binario de Go
COPY --from=builder /app/api-server ./api-server

# Copiar Prisma schema, package.json, lock, config y seed
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY package.json bun.lock ./

# Instalar dependencias (para ejecutar prisma/seed)
RUN bun install

# Generar Prisma Client
RUN DATABASE_URL=file:./dev.db bun prisma generate

# Copiar entrypoint
COPY api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Render inyecta PORT; por defecto 8080
ENV PORT=8080
ENV DATABASE_URL=file:./dev.db

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]
