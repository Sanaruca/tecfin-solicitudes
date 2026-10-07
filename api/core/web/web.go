// Package web concentra la traducción de parámetros y errores a respuestas HTTP.
package web

import (
	"strconv"

	"api/core/apperr"

	"github.com/gofiber/fiber/v2"
)

// Error responde con el estado y el mensaje correspondientes al error.
// Los errores no clasificados caen en 500 con el mensaje genérico `fallback`,
// para no exponer detalles internos al cliente.
func Error(c *fiber.Ctx, err error, fallback string) error {
	return c.Status(apperr.StatusCode(err)).JSON(fiber.Map{
		"error": apperr.Message(err, fallback),
	})
}

// ParamID extrae y valida el parámetro de ruta `:id`.
func ParamID(c *fiber.Ctx) (int, error) {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return 0, apperr.BadRequest("el id debe ser un número entero positivo")
	}
	return id, nil
}
