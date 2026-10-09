#!/bin/sh
set -e

DB_URL="${DATABASE_URL:-file:./dev.db}"

echo "==> Configurando base de datos con Prisma..."
bun prisma db push --schema=prisma/schema.prisma --url "$DB_URL"

echo "==> Cargando mocks (seed)..."
bun prisma db seed --schema=prisma/schema.prisma || echo "Seed ya aplicado o ignorado"

echo "==> Levantando API..."
exec ./api-server
