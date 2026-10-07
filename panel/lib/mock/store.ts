/**
 * Store mock: simula la base de datos real con datos en `localStorage`.
 *
 * Toda la UI consume esta store a través de `lib/api/*`, de modo que al
 * integrar la API Go (flag `USE_MOCK = false`) no hay que tocar las vistas.
 */
import { normalizeText } from "@/lib/format";
import type {
  LoginInput,
  LoginResponse,
  Solicitud,
  SolicitudCreateInput,
  SolicitudFilters,
  SolicitudUpdateInput,
  SessionUser,
  Usuario,
  UsuarioCreateInput,
} from "@/lib/types";

const LS_SOLICITUDES = "panel.mock.solicitudes";
const LS_USUARIOS = "panel.mock.usuarios";
const LS_SESSION = "panel.mock.session";

/** Usuario mock con password (solo para login; nunca se expone a la UI). */
type MockUsuario = Usuario & { password: string };

const SEED_USUARIOS: MockUsuario[] = [
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

const SEED_SOLICITUDES: Solicitud[] = [
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
// Helpers
// ---------------------------------------------------------------------------

const isBrowser = () => typeof window !== "undefined";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Latencia artificial para ver los estados de carga en las vistas. */
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

function read<T>(key: string, seed: T): T {
  if (!isBrowser()) return clone(seed);
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    window.localStorage.setItem(key, JSON.stringify(seed));
  } catch {
    // localStorage no disponible: usamos la semilla en memoria.
  }
  return clone(seed);
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignoramos errores de cuota/desactivado
  }
}

const nextId = (items: Array<{ id: number }>) =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

const now = () => new Date().toISOString();

/** Última sesión leída, para devolver siempre la misma referencia. */
let sessionCache: { raw: string | null; value: SessionUser | null } = {
  raw: undefined as unknown as string | null,
  value: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const mockDB = {
  solicitudes: {
    async list(filters: SolicitudFilters = {}): Promise<Solicitud[]> {
      await delay();
      const nombre = normalizeText(filters.nombre ?? "");
      return read(LS_SOLICITUDES, SEED_SOLICITUDES)
        .filter((s) => !nombre || normalizeText(s.nombreCliente).includes(nombre))
        .filter((s) => !filters.estado || s.estado === filters.estado)
        .sort(
          (a, b) =>
            b.fecha.localeCompare(a.fecha) ||
            b.createdAt.localeCompare(a.createdAt) ||
            b.id - a.id,
        );
    },

    async get(id: number): Promise<Solicitud | null> {
      await delay();
      return read(LS_SOLICITUDES, SEED_SOLICITUDES).find((s) => s.id === id) ?? null;
    },

    async create(input: SolicitudCreateInput): Promise<Solicitud> {
      await delay(300);
      const items = read(LS_SOLICITUDES, SEED_SOLICITUDES);
      const timestamp = now();
      const solicitud: Solicitud = {
        id: nextId(items),
        creadoPorId: mockDB.auth.getSession()?.id ?? null,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...input,
      };
      items.unshift(solicitud);
      write(LS_SOLICITUDES, items);
      return solicitud;
    },

    async update(id: number, input: SolicitudUpdateInput): Promise<Solicitud> {
      await delay(300);
      const items = read(LS_SOLICITUDES, SEED_SOLICITUDES);
      const index = items.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("La solicitud no existe o fue eliminada.");
      const actualizada: Solicitud = {
        ...items[index],
        ...input,
        updatedAt: now(),
      };
      items[index] = actualizada;
      write(LS_SOLICITUDES, items);
      return actualizada;
    },

    async remove(id: number): Promise<void> {
      await delay(300);
      const items = read(LS_SOLICITUDES, SEED_SOLICITUDES);
      write(
        LS_SOLICITUDES,
        items.filter((s) => s.id !== id),
      );
    },
  },

  usuarios: {
    async list(): Promise<Usuario[]> {
      await delay();
      return read(LS_USUARIOS, SEED_USUARIOS)
        .map(toUsuario)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    },

    async create(input: UsuarioCreateInput): Promise<Usuario> {
      await delay(300);
      const items = read(LS_USUARIOS, SEED_USUARIOS);
      const email = input.email.trim().toLowerCase();
      if (items.some((u) => u.email.toLowerCase() === email)) {
        throw new Error("Ya existe un usuario con ese email.");
      }
      const timestamp = now();
      const usuario: MockUsuario = {
        id: nextId(items),
        nombre: input.nombre.trim(),
        email,
        password: input.password,
        rol: input.rol,
        activo: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      items.push(usuario);
      write(LS_USUARIOS, items);
      return toUsuario(usuario);
    },

    async remove(id: number): Promise<void> {
      await delay(300);
      const session = mockDB.auth.getSession();
      if (session && session.id === id) {
        throw new Error("No puedes eliminar el usuario con el que iniciaste sesión.");
      }
      const items = read(LS_USUARIOS, SEED_USUARIOS);
      write(
        LS_USUARIOS,
        items.filter((u) => u.id !== id),
      );
    },
  },

  auth: {
    /** Devuelve la sesión guardada (solo en el navegador). */
    getSession(): SessionUser | null {
      if (!isBrowser()) return null;
      try {
        const raw = window.localStorage.getItem(LS_SESSION);
        return raw ? (JSON.parse(raw) as SessionUser) : null;
      } catch {
        return null;
      }
    },

    /**
     * Sesión con referencia estable (para `useSyncExternalStore`).
     * Reutiliza el objeto mientras el valor en storage no cambie.
     */
    getSessionSnapshot(): SessionUser | null {
      if (!isBrowser()) return null;
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(LS_SESSION);
      } catch {
        raw = null;
      }
      if (raw !== sessionCache.raw) {
        let value: SessionUser | null = null;
        try {
          value = raw ? (JSON.parse(raw) as SessionUser) : null;
        } catch {
          value = null;
        }
        sessionCache = { raw, value };
      }
      return sessionCache.value;
    },

    /** Se suscribe a cambios de la sesión (storage events). */
    subscribe(callback: () => void): () => void {
      if (!isBrowser()) return () => undefined;
      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === LS_SESSION) callback();
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },

    async login({ email, password }: LoginInput): Promise<LoginResponse> {
      await delay(400);
      const items = read(LS_USUARIOS, SEED_USUARIOS);
      const usuario = items.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!usuario || usuario.password !== password) {
        throw new Error("Email o contraseña incorrectos.");
      }
      if (!usuario.activo) {
        throw new Error("El usuario está desactivado. Contactá al administrador.");
      }
      const session = toUsuario(usuario);
      write(LS_SESSION, session);
      return { token: `mock-token-${usuario.id}`, user: session };
    },

    async logout(): Promise<void> {
      await delay(100);
      if (isBrowser()) window.localStorage.removeItem(LS_SESSION);
    },
  },
};

/** Oculta el password antes de exponer un usuario. */
function toUsuario(usuario: MockUsuario): Usuario {
  const { password, ...rest } = usuario;
  void password; // el password nunca sale de la store
  return rest;
}
