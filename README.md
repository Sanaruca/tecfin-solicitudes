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
  - **Administrador:** Control total sobre solicitudes y gestión de usuarios (creación de cuentas).
  - **Operador:** Gestión operativa de solicitudes (creación, edición y cambio de estado).
- 📝 **Gestión Completa de Solicitudes (CRUD):**
  - Registro con nombre de cliente, teléfono, descripción, fecha y estado.
  - Flujo de estados: `Pendiente` 🟡 | `En proceso` 🔵 | `Completada` 🟢 | `Cancelada` 🔴
- 🔍 **Búsqueda & Filtros en Tiempo Real:**
  - Búsqueda dinámica por nombre de cliente.
  - Filtrado rápido por estado.
- 📱 **Interfaz Responsive & Minimalista:**
  - Experiencia de usuario fluida y adaptable a dispositivos móviles, tablets y escritorio.
- ⚡ **API RESTful Persistente:** Conexión directa a base de datos relacional.

---

## 🛠️ Tecnologías Utilizadas

<details>
<summary><b>Ver Stack Tecnológico</b></summary>

<br />

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js | Interfaz de usuario declarativa y responsive |
| **Styling** | Tailwind CSS / CSS Modules | Diseño minimalista y utilitario |
| **Backend** | Go | API RESTful sólida y eficiente |
| **Base de Datos** | SQLite | Almacenamiento relacional de datos |
| **Autenticación**| JWT (JSON Web Tokens) | Sesiones seguras basadas en tokens |

</details>

---

## 🚀 Inicio Rápido

Sigue estos pasos para ejecutar el proyecto de manera local.

### Prerrequisitos

Asegúrate de tener instalado en tu sistema:
- [Node.js](https://nodejs.org/) (v18+ recomendado)
- [Git](https://git-scm.com/)
- Instancia de Base de Datos (PostgreSQL / MySQL)

### Instala y Ejecuta

1. **Clona el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/gestion-solicitudes.git](https://github.com/tu-usuario/gestion-solicitudes.git)
   cd gestion-solicitudes

```

2. **Configura las variables de entorno:**
Crea un archivo `.env` en la raíz (o dentro de las carpetas backend/frontend según corresponda) guiándote con el archivo `.env.example`:
```env
PORT=5000
DATABASE_URL=postgresql://usuario:password@localhost:5432/gestion_db
JWT_SECRET=tu_clave_secreta_super_segura

```


3. **Instala dependencias y ejecuta el proyecto:**
*Para el Backend:*
```bash
cd backend
npm install
npm run dev

```


*Para el Frontend:*
```bash
cd frontend
npm install
npm run dev

```


4. Abre tu navegador e ingresa a `http://localhost:3000`.

---

## 🔐 Credenciales Demo

Para probar los distintos roles del sistema en el entorno de desarrollo o demo:

| Rol | Usuario / Email | Contraseña | Permisos |
| --- | --- | --- | --- |
| **Administrador** | `admin@empresa.com` | `Admin123!` | Solicitudes (CRUD) + Gestión de Usuarios |
| **Operador** | `operador@empresa.com` | `Operator123!` | Solicitudes (CRUD) |

---

## 🌐 Despliegue

La aplicación se encuentra desplegada y lista para ser probada en producción:

* 🔗 **Aplicación Web:** [https://tu-proyecto.vercel.app](https://tu-proyecto.vercel.app)
* 🔗 **API / Backend:** [https://tu-api.onrender.com](https://www.google.com/search?q=https://tu-api.onrender.com)

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para obtener más información.