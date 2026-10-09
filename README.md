<div align="center">

# 📋 Sistema de Gestión de Solicitudes

**Aplicación web full-stack moderna y minimalista para la administración y seguimiento de solicitudes de clientes.**

[Demostración en vivo](#-despliegue) · [Reportar un error](../../issues) · [Solicitar una función](../../issues)

<br />

[![Estado del Proyecto](https://img.shields.io/badge/Estado-Listo%20para%20Producci%C3%B3n-success?style=for-the-badge)](https://github.com)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 👁️ Vista General

El **Sistema de Gestión de Solicitudes** permite a las empresas centralizar, organizar y dar seguimiento al flujo de trabajo con sus clientes. Diseñado con una arquitectura por roles, garantiza que el equipo operativo gestione las solicitudes eficientemente mientras la administración mantiene el control sobre los usuarios del sistema.

### ✨ Características Principales

- 🔒 **Autenticación Segura & Control de Acceso (RBAC):**
  - **Administrador:** Control total sobre solicitudes y gestión de usuarios (creación/eliminación de cuentas).
  - **Operador:** Gestión operativa de solicitudes (creación, edición y cambio de estado).
- 📝 **Gestión Completa de Solicitudes (CRUD):**
  - Registro con nombre de cliente, teléfono, descripción, fecha y estado.
  - Flujo de estados: `Pendiente` 🟡 | `En proceso` 🔵 | `Completada` 🟢 | `Cancelada` 🔴
- 🔍 **Búsqueda & Filtros en Tiempo Real:**
  - Búsqueda dinámica por nombre de cliente.
  - Filtrado rápido por estado.
- 📱 **Interfaz Responsive & Minimalista:**
  - Experiencia de usuario fluida y adaptable a dispositivos móviles, tablets y escritorio.
- ⚡ **API RESTful Persistente:** Conexión directa a base de datos relacional (SQLite) con Fiber + GORM.

---

## 🛠️ Tecnologías Utilizadas

<details>
<summary><b>Ver Stack Tecnológico</b></summary>

<br />

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router) + React 19 | Interfaz de usuario declarativa y responsive |
| **Styling** | Tailwind CSS 4 | Diseño minimalista y utilitario |
| **Backend** | Go 1.23 + Fiber + GORM | API RESTful sólida y eficiente |
| **Base de Datos** | SQLite (Prisma ORM) | Almacenamiento relacional de datos |
| **Autenticación** | JWT (JSON Web Tokens) | Sesiones seguras basadas en tokens |
| **Tooling** | Bun | Gestor de paquetes y runtime |

</details>

---

## 🚀 Inicio Rápido

Sigue estos pasos para ejecutar el proyecto de manera local.

### Prerrequisitos

Asegúrate de tener instalado en tu sistema:
- [Go](https://golang.org/dl/) (1.23+)
- [Bun](https://bun.sh/) (1.4+)
- [Git](https://git-scm.com/)

### Instala y Ejecuta

1. **Clona el repositorio:**
```bash
git clone https://github.com/Sanaruca/tecfin-solicitudes.git
cd tecfin-solicitudes
```

2. **Configura las variables de entorno:**
Copia el archivo de ejemplo y ajusta si es necesario:
```bash
cp .env.example .env
```
> **Nota:** `DATABASE_URL="file:./dev.db"` es relativo a la raíz del repositorio.

3. **Configura la base de datos (crea tablas y carga datos de desarrollo):**
```bash
bun run db:setup
```
> Este comando ejecuta `prisma db push` + `prisma db seed` (idempotente).

4. **Ejecuta la API (Go):**
```bash
cd api && go run server.go
```
> La API corre en `http://localhost:8080`

5. **Ejecuta el Panel (Next.js) en otra terminal:**
```bash
cd panel && bun dev
```
> El frontend corre en `http://localhost:3000`

6. Abre tu navegador e ingresa a `http://localhost:3000`.

---

## 🔐 Credenciales Demo

Para probar los distintos roles del sistema en el entorno de desarrollo:

| Rol | Usuario / Email | Contraseña | Permisos |
| --- | --- | --- | --- |
| **Administrador** | `admin@empresa.com` | `admin123` | Solicitudes (CRUD) + Gestión de Usuarios |
| **Operador** | `operador@empresa.com` | `operador123` | Solicitudes (CRUD) |

---

## 🗄️ Base de Datos y Prisma

El esquema de datos está definido en `prisma/schema.prisma` y se usa **Prisma Client** (generado en `src/generated/prisma`).

### Comandos útiles

```bash
# Generar cliente Prisma (tras cambios en schema.prisma)
bunx prisma generate

# Aplicar migraciones en desarrollo
bunx prisma migrate dev

# Solo crear/actualizar tablas (sin seed)
bun run db:push

# Solo cargar datos de desarrollo (idempotente)
bun run db:seed

# Setup completo (push + seed)
bun run db:setup

# Abrir Prisma Studio
bunx prisma studio
```

### Datos de desarrollo
- `prisma/seed.ts` carga 4 usuarios y 9 solicitudes (mismos datos que el modo mock del panel).
- El seed es **idempotente**: se puede re-ejecutar sin duplicar datos.
- Passwords hasheadas con bcrypt (`$2b$`); la API Go las verifica con `golang.org/x/crypto/bcrypt`.

---

## 🌐 Despliegue

La aplicación está configurada para desplegarse en:

* 🔗 **Aplicación Web (Frontend):** [Vercel](https://vercel.com) — `panel/`
* 🔗 **API / Backend:** [Render](https://render.com) / [Fly.io](https://fly.io) — `api/`

> Configura las variables de entorno en la plataforma de despliegue:
> - `DATABASE_URL` (SQLite en volumen persistente o migra a PostgreSQL)
> - `JWT_SECRET` (clave segura en producción)
> - `ALLOWED_ORIGINS` (origen del frontend, ej. `https://tu-app.vercel.app`)
> - `PORT` (la API escucha en `$PORT` o 8080 por defecto)

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para obtener más información.