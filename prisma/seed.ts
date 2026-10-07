/**
 * Seeder de la base de datos (SQLite + Prisma).
 *
 * Carga exactamente los mismos datos de desarrollo que usa el panel en modo
 * mock (`panel/lib/mock/store.ts`): usuarios de prueba y solicitudes de clientes.
 *
 * Uso (desde la raíz del repositorio):
 *   bunx prisma db push   # crea las tablas si no existen
 *   bunx prisma db seed   # carga los datos (o `bun run db:seed`)
 *   bun run db:setup      # hace ambas cosas
 *
 * El seeder es idempotente: nunca pisa datos existentes, solo inserta los que faltan.
 * Las contraseñas se guardan hasheadas con bcrypt (verificarlas desde la API Go
 * con golang.org/x/crypto/bcrypt).
 */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hashSync } from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.ts";

// ---------------------------------------------------------------------------
// Datos de desarrollo (espejo de los mocks del panel)
// ---------------------------------------------------------------------------

interface SeedUsuario {
  id: number;
  nombre: string;
  email: string;
  /** Contraseña en texto plano SOLO para el seed; se guarda hasheada. */
  password: string;
  rol: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SeedSolicitud {
  id: number;
  nombreCliente: string;
  telefono: string;
  descripcion: string;
  fecha: string;
  estado: string;
  creadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
}

const USUARIOS: SeedUsuario[] = [
  {
    id: 1,
    nombre: "Ana Torres",
    email: "admin@empresa.com",
    password: "admin123",
    rol: "ADMINISTRADOR",
    activo: true,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: 2,
    nombre: "Luis Gómez",
    email: "operador@empresa.com",
    password: "operador123",
    rol: "OPERADOR",
    activo: true,
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-02-15T09:00:00.000Z",
  },
  {
    id: 3,
    nombre: "Marta Ríos",
    email: "marta@empresa.com",
    password: "operador123",
    rol: "OPERADOR",
    activo: true,
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z",
  },
  {
    id: 4,
    nombre: "Carlos Vega",
    email: "carlos@empresa.com",
    password: "admin123",
    rol: "ADMINISTRADOR",
    activo: false,
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
];

const SOLICITUDES: SeedSolicitud[] = [
  {
    id: 1,
    nombreCliente: "Mercado San Rafael",
    telefono: "+54 9 11 4433-2211",
    descripcion: "Solicitud de presupuesto para el pedido mensual de almacén.",
    fecha: "2026-10-06T12:00:00.000Z",
    estado: "PENDIENTE",
    creadoPorId: 1,
    createdAt: "2026-10-06T10:15:00.000Z",
    updatedAt: "2026-10-06T10:15:00.000Z",
  },
  {
    id: 2,
    nombreCliente: "Lucía Fernández",
    telefono: "+54 9 11 5555-1010",
    descripcion: "Reprogramación de la entrega que quedó pendiente desde el lunes.",
    fecha: "2026-10-05T12:00:00.000Z",
    estado: "EN_PROCESO",
    creadoPorId: 2,
    createdAt: "2026-10-05T08:40:00.000Z",
    updatedAt: "2026-10-05T14:20:00.000Z",
  },
  {
    id: 3,
    nombreCliente: "Ferretería El Tornillo",
    telefono: "+54 9 341 5544-3322",
    descripcion: "Consulta por stock de herramientas eléctricas.",
    fecha: "2026-10-04T12:00:00.000Z",
    estado: "PENDIENTE",
    creadoPorId: 2,
    createdAt: "2026-10-04T16:05:00.000Z",
    updatedAt: "2026-10-04T16:05:00.000Z",
  },
  {
    id: 4,
    nombreCliente: "Distribuidora Norte",
    telefono: "+54 9 387 4455-6677",
    descripcion: "Ampliación de la orden de compra #4521.",
    fecha: "2026-10-03T12:00:00.000Z",
    estado: "PENDIENTE",
    creadoPorId: 1,
    createdAt: "2026-10-03T11:30:00.000Z",
    updatedAt: "2026-10-03T11:30:00.000Z",
  },
  {
    id: 5,
    nombreCliente: "Estudio Contable López",
    telefono: "+54 9 11 2233-4455",
    descripcion: "Alta del servicio de soporte técnico mensual.",
    fecha: "2026-10-01T12:00:00.000Z",
    estado: "EN_PROCESO",
    creadoPorId: 2,
    createdAt: "2026-10-01T09:10:00.000Z",
    updatedAt: "2026-10-02T17:45:00.000Z",
  },
  {
    id: 6,
    nombreCliente: "Jorge Bianchi",
    telefono: "+54 9 351 6677-8899",
    descripcion: "Reclamo por factura emitida con importe incorrecto.",
    fecha: "2026-09-28T12:00:00.000Z",
    estado: "COMPLETADA",
    creadoPorId: 1,
    createdAt: "2026-09-28T13:00:00.000Z",
    updatedAt: "2026-09-30T10:00:00.000Z",
  },
  {
    id: 7,
    nombreCliente: "Marcelo Duarte",
    telefono: "+54 9 261 9080-7060",
    descripcion: "Cambio de turno para la visita técnica.",
    fecha: "2026-09-20T12:00:00.000Z",
    estado: "CANCELADA",
    creadoPorId: 2,
    createdAt: "2026-09-20T15:25:00.000Z",
    updatedAt: "2026-09-21T09:05:00.000Z",
  },
  {
    id: 8,
    nombreCliente: "Panadería La Espiga",
    telefono: "+54 9 11 8899-0011",
    descripcion: "Pedido de 200 unidades con entrega a domicilio.",
    fecha: "2026-09-15T12:00:00.000Z",
    estado: "COMPLETADA",
    creadoPorId: 1,
    createdAt: "2026-09-15T08:00:00.000Z",
    updatedAt: "2026-09-16T12:40:00.000Z",
  },
  {
    id: 9,
    nombreCliente: "Verónica Sosa",
    telefono: "+54 9 11 7766-5544",
    descripcion: "Solicitud de reembolso por servicio no utilizado.",
    fecha: "2026-09-10T12:00:00.000Z",
    estado: "CANCELADA",
    creadoPorId: 2,
    createdAt: "2026-09-10T18:20:00.000Z",
    updatedAt: "2026-09-12T11:15:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Ejecución
// ---------------------------------------------------------------------------

/**
 * URL de conexión: se respeta `DATABASE_URL` (cargado desde `.env`) y, si es
 * relativa, se resuelve contra la raíz del repositorio para que funcione
 * aunque se ejecute desde otro directorio.
 */
function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!raw.startsWith("file:")) return raw;
  const filepath = raw.slice("file:".length);
  if (filepath.startsWith("/") || filepath.startsWith(":memory:")) return raw;
  // Raíz del repositorio (este archivo vive en prisma/)
  const repoRoot = fileURLToPath(new URL("../", import.meta.url));
  return `file:${resolve(repoRoot, filepath)}`;
}

async function main() {
  const adapter = new PrismaLibSql({ url: resolveDatabaseUrl() });
  const prisma = new PrismaClient({ adapter });

  let usuariosCreados = 0;
  let usuariosExistentes = 0;
  let solicitudesCreadas = 0;
  let solicitudesExistentes = 0;

  try {
    for (const usuario of USUARIOS) {
      const existe = await prisma.usuario.findUnique({ where: { email: usuario.email } });
      if (existe) {
        usuariosExistentes += 1;
        continue;
      }
      await prisma.usuario.create({
        data: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          password: hashSync(usuario.password, 10),
          rol: usuario.rol,
          activo: usuario.activo,
          createdAt: new Date(usuario.createdAt),
          updatedAt: new Date(usuario.updatedAt),
        },
      });
      usuariosCreados += 1;
    }

    for (const solicitud of SOLICITUDES) {
      const existe = await prisma.solicitud.findUnique({ where: { id: solicitud.id } });
      if (existe) {
        solicitudesExistentes += 1;
        continue;
      }
      await prisma.solicitud.create({
        data: {
          id: solicitud.id,
          nombreCliente: solicitud.nombreCliente,
          telefono: solicitud.telefono,
          descripcion: solicitud.descripcion,
          fecha: new Date(solicitud.fecha),
          estado: solicitud.estado,
          creadoPorId: solicitud.creadoPorId,
          createdAt: new Date(solicitud.createdAt),
          updatedAt: new Date(solicitud.updatedAt),
        },
      });
      solicitudesCreadas += 1;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("Seed completado.");
  console.log(
    `  Usuarios:    ${usuariosCreados} creados, ${usuariosExistentes} ya existentes`,
  );
  console.log(
    `  Solicitudes: ${solicitudesCreadas} creadas, ${solicitudesExistentes} ya existentes`,
  );
  console.log("");
  console.log("Accesos de prueba:");
  console.log("  admin@empresa.com    / admin123    (Administrador)");
  console.log("  operador@empresa.com / operador123 (Operador)");
}

main().catch((error) => {
  console.error("Error al sembrar la base de datos:", error);
  process.exitCode = 1;
});
