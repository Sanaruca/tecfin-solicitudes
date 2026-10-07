package auth

import (
	"context"
	"strings"

	"api/core/apperr"
	"api/core/web"
	"api/models/usuario"

	"github.com/gofiber/fiber/v2"
)

// usuarioKey es la clave donde se guarda el usuario autenticado en la petición.
const usuarioKey = "auth.usuario"

// Autenticar exige un Bearer token válido y carga el usuario autenticado.
//
// `buscar` resuelve el usuario a partir del id contenido en el token: se
// inyecta desde la capa de casos de uso para no acoplar este paquete a `app`
// (los casos de uso de login dependen de `auth`, aquí sería al revés).
func Autenticar(secret []byte, buscar func(context.Context, int) (usuario.Usuario, error)) fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := strings.TrimSpace(c.Get(fiber.HeaderAuthorization))
		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return web.Error(c, apperr.Unauthorized("el token debe enviarse como Bearer"), "no autorizado")
		}

		token := strings.TrimSpace(parts[1])
		if token == "" {
			return web.Error(c, apperr.Unauthorized("falta el token de autenticación"), "no autorizado")
		}

		claims, err := Parsear(secret, token)
		if err != nil {
			return web.Error(c, apperr.Unauthorized("token inválido o expirado"), "no autorizado")
		}

		u, err := buscar(c.Context(), claims.UsuarioID)
		if err != nil {
			return web.Error(c, apperr.Unauthorized("la sesión ya no es válida"), "no autorizado")
		}
		if !u.Activo {
			return web.Error(c, apperr.Unauthorized("la cuenta está desactivada"), "no autorizado")
		}

		c.Locals(usuarioKey, &u)
		return c.Next()
	}
}

// Usuario devuelve el usuario autenticado (nil si no pasó por Autenticar).
func Usuario(c *fiber.Ctx) *usuario.Usuario {
	u, _ := c.Locals(usuarioKey).(*usuario.Usuario)
	return u
}

// RequerirAdministrador deja pasar solo a administradores.
// El Operador gestiona solicitudes, pero no crea ni elimina usuarios.
func RequerirAdministrador(c *fiber.Ctx) error {
	u := Usuario(c)
	if u == nil {
		return web.Error(c, apperr.Unauthorized("falta el token de autenticación"), "no autorizado")
	}
	if !u.Rol.EsAdministrador() {
		return web.Error(c, apperr.Forbidden("solo un administrador puede gestionar usuarios"), "sin permisos")
	}
	return c.Next()
}
