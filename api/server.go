package main

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"strings"

	"api/app/command"
	"api/app/query"
	"api/core/apperr"
	"api/core/auth"
	"api/core/web"
	"api/models/solicitud"
	"api/models/usuario"
	"api/service"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Cargar configuración (.env del directorio de trabajo o de la raíz del repo)
	envPath := cargarEnv()

	// Conexión GORM a la base de datos real (SQLite)
	db, err := gorm.Open(sqlite.Open(rutaBD(envPath)), &gorm.Config{})
	if err != nil {
		log.Fatalf("error al conectar a la base de datos: %v", err)
	}

	// El schema lo define Prisma (prisma/schema.prisma + `bun run db:setup`).
	// AutoMigrate solo se usa para crear las tablas si faltan (BD nueva):
	// si ya existen se respetan tal cual, para no tocar índices, defaults y
	// constraints del schema de Prisma (GORM perdería los índices al
	// reconstruir la tabla).
	if err := migrarSiFalta(db); err != nil {
		log.Fatalf("error al migrar modelos: %v", err)
	}

	// Secreto para firmar los JWT de sesión
	secret := []byte(os.Getenv("JWT_SECRET"))
	if len(secret) == 0 {
		secret = []byte("solicitudes-dev-secret")
		log.Println("aviso: JWT_SECRET no está definido; se usa un secreto de desarrollo")
	}

	// Casos de uso
	svc := service.New(db, secret)

	// Configurar Fiber
	app := fiber.New(fiber.Config{
		AppName: "Solicitudes API",
	})

	// CORS: permitir orígenes (variable ALLOWED_ORIGINS, separados por ';') o todos en desarrollo
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		app.Use(cors.New())
	} else {
		origins := strings.Split(allowedOrigins, ";")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
		}
		app.Use(cors.New(cors.Config{
			AllowOrigins:     strings.Join(origins, ","),
			AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
			AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
			AllowCredentials: true,
		}))
	}
	app.Use(logger.New())

	// Autenticación: valida el Bearer token y carga el usuario autenticado
	autenticado := auth.Autenticar(secret, func(ctx context.Context, id int) (usuario.Usuario, error) {
		return svc.Queries.ObtenerUsuario.Exec(ctx, query.ObtenerUsuarioDTO{ID: id})
	})
	administrador := auth.RequerirAdministrador

	// Rutas
	api := app.Group("/api")

	// --- Login / sesión ---
	api.Post("/auth/login", func(c *fiber.Ctx) error {
		var dto query.LoginDTO
		if err := c.BodyParser(&dto); err != nil {
			return web.Error(c, apperr.BadRequest("el cuerpo de la petición no es JSON válido"), "petición inválida")
		}

		res, err := svc.Queries.Login.Exec(c.Context(), dto)
		if err != nil {
			return web.Error(c, err, "no se pudo iniciar sesión")
		}
		return c.JSON(res)
	})

	// La sesión es stateless (JWT): el cliente solo descarta el token.
	api.Post("/auth/logout", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})

	api.Get("/auth/me", autenticado, func(c *fiber.Ctx) error {
		return c.JSON(auth.Usuario(c))
	})

	// --- Solicitudes ---
	api.Get("/solicitudes", autenticado, func(c *fiber.Ctx) error {
		var dto query.ObtenerSolicitudesDTO
		if err := c.QueryParser(&dto); err != nil {
			return web.Error(c, apperr.BadRequest("parámetros de consulta inválidos"), "parámetros inválidos")
		}

		res, err := svc.Queries.ObtenerSolicitudes.Exec(c.Context(), dto)
		if err != nil {
			return web.Error(c, err, "error al obtener solicitudes")
		}
		return c.JSON(res)
	})

	api.Get("/solicitudes/:id", autenticado, func(c *fiber.Ctx) error {
		id, err := web.ParamID(c)
		if err != nil {
			return web.Error(c, err, "parámetros inválidos")
		}

		res, err := svc.Queries.ObtenerSolicitud.Exec(c.Context(), query.ObtenerSolicitudDTO{ID: id})
		if err != nil {
			return web.Error(c, err, "no se pudo obtener la solicitud")
		}
		return c.JSON(res)
	})

	api.Post("/solicitudes", autenticado, func(c *fiber.Ctx) error {
		var dto command.CrearSolicitudDTO
		if err := c.BodyParser(&dto); err != nil {
			return web.Error(c, apperr.BadRequest("el cuerpo de la petición no es JSON válido"), "petición inválida")
		}
		if u := auth.Usuario(c); u != nil {
			dto.UsuarioID = u.ID
		}

		res, err := svc.Commands.CrearSolicitud.Exec(c.Context(), dto)
		if err != nil {
			return web.Error(c, err, "no se pudo crear la solicitud")
		}
		return c.Status(fiber.StatusCreated).JSON(res)
	})

	api.Put("/solicitudes/:id", autenticado, func(c *fiber.Ctx) error {
		id, err := web.ParamID(c)
		if err != nil {
			return web.Error(c, err, "parámetros inválidos")
		}

		var dto command.EditarSolicitudDTO
		if err := c.BodyParser(&dto); err != nil {
			return web.Error(c, apperr.BadRequest("el cuerpo de la petición no es JSON válido"), "petición inválida")
		}
		dto.ID = id

		res, err := svc.Commands.EditarSolicitud.Exec(c.Context(), dto)
		if err != nil {
			return web.Error(c, err, "no se pudo editar la solicitud")
		}
		return c.JSON(res)
	})

	api.Delete("/solicitudes/:id", autenticado, func(c *fiber.Ctx) error {
		id, err := web.ParamID(c)
		if err != nil {
			return web.Error(c, err, "parámetros inválidos")
		}

		res, err := svc.Commands.EliminarSolicitud.Exec(c.Context(), command.EliminarSolicitudDTO{ID: id})
		if err != nil {
			return web.Error(c, err, "no se pudo eliminar la solicitud")
		}
		return c.JSON(res)
	})

	// --- Usuarios (solo Administrador) ---
	api.Get("/usuarios", autenticado, administrador, func(c *fiber.Ctx) error {
		var dto query.ObtenerUsuariosDTO
		if err := c.QueryParser(&dto); err != nil {
			return web.Error(c, apperr.BadRequest("parámetros de consulta inválidos"), "parámetros inválidos")
		}

		res, err := svc.Queries.ObtenerUsuarios.Exec(c.Context(), dto)
		if err != nil {
			return web.Error(c, err, "error al obtener usuarios")
		}
		return c.JSON(res)
	})

	api.Post("/usuarios", autenticado, administrador, func(c *fiber.Ctx) error {
		var dto command.CrearUsuarioDTO
		if err := c.BodyParser(&dto); err != nil {
			return web.Error(c, apperr.BadRequest("el cuerpo de la petición no es JSON válido"), "petición inválida")
		}
		if u := auth.Usuario(c); u != nil {
			dto.RolActor = u.Rol
		}

		res, err := svc.Commands.CrearUsuario.Exec(c.Context(), dto)
		if err != nil {
			return web.Error(c, err, "no se pudo crear el usuario")
		}
		return c.Status(fiber.StatusCreated).JSON(res)
	})

	api.Delete("/usuarios/:id", autenticado, administrador, func(c *fiber.Ctx) error {
		id, err := web.ParamID(c)
		if err != nil {
			return web.Error(c, err, "parámetros inválidos")
		}

		var dto command.EliminarUsuarioDTO
		if u := auth.Usuario(c); u != nil {
			dto.ActorID = u.ID
			dto.RolActor = u.Rol
		}
		dto.ID = id

		res, err := svc.Commands.EliminarUsuario.Exec(c.Context(), dto)
		if err != nil {
			return web.Error(c, err, "no se pudo eliminar el usuario")
		}
		return c.JSON(res)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor corriendo en http://localhost:%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}

// migrarSiFalta crea las tablas del modelo solo si aún no existen.
func migrarSiFalta(db *gorm.DB) error {
	if db.Migrator().HasTable(&usuario.Usuario{}) && db.Migrator().HasTable(&solicitud.Solicitud{}) {
		return nil
	}
	return db.AutoMigrate(&usuario.Usuario{}, &solicitud.Solicitud{})
}

// cargarEnv carga el primer .env que encuentre (directorio de trabajo o raíz
// del repo) y devuelve su ruta, para resolver después las rutas relativas.
func cargarEnv() string {
	rutas := []string{".env", filepath.Join("..", ".env")}
	for _, ruta := range rutas {
		if _, err := os.Stat(ruta); err != nil {
			continue
		}
		if err := godotenv.Load(ruta); err != nil {
			log.Printf("aviso: no se pudo leer %s: %v", ruta, err)
			continue
		}
		return ruta
	}
	return ""
}

// rutaBD resuelve la ruta del archivo SQLite a partir de DATABASE_URL.
// `file:./dev.db` (formato de Prisma) se resuelve relativa al archivo .env.
func rutaBD(envPath string) string {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return "dev.db"
	}

	dsn = strings.TrimPrefix(dsn, "file:")
	if !filepath.IsAbs(dsn) && envPath != "" {
		dsn = filepath.Join(filepath.Dir(envPath), dsn)
	}
	return dsn
}
