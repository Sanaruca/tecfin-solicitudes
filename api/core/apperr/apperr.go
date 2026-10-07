// Package apperr define errores de aplicación con un estado HTTP asociado.
//
// Los casos de uso devuelven estos errores y la capa HTTP los traduce
// directamente a una respuesta JSON, sin tener que clasificarlos en cada ruta.
package apperr

import (
	"errors"
	"fmt"
)

// Error es un error de aplicación con estado HTTP y mensaje para el cliente.
type Error struct {
	Status  int
	Message string
	Err     error // error original (para los logs), puede ser nil
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

// Unwrap permite usar errors.Is / errors.As sobre el error original.
func (e *Error) Unwrap() error { return e.Err }

// New crea un error de aplicación.
func New(status int, message string) *Error {
	return &Error{Status: status, Message: message}
}

// Wrap crea un error de aplicación conservando el error original.
func Wrap(status int, message string, err error) *Error {
	return &Error{Status: status, Message: message, Err: err}
}

// BadRequest errores de validación o de parámetros (400).
func BadRequest(message string) *Error { return New(400, message) }

// Unauthorized errores de autenticación (401).
func Unauthorized(message string) *Error { return New(401, message) }

// Forbidden errores de autorización (403): rol insuficiente.
func Forbidden(message string) *Error { return New(403, message) }

// NotFound recurso inexistente (404).
func NotFound(message string) *Error { return New(404, message) }

// Conflict conflicto con el estado actual, p. ej. email duplicado (409).
func Conflict(message string) *Error { return New(409, message) }

// StatusCode devuelve el estado HTTP del error (500 si no está clasificado).
func StatusCode(err error) int {
	var e *Error
	if errors.As(err, &e) {
		return e.Status
	}
	return 500
}

// Message devuelve el mensaje que se le muestra al cliente.
// `fallback` se usa para los errores internos, que no deben filtrarse.
func Message(err error, fallback string) string {
	var e *Error
	if errors.As(err, &e) && e.Message != "" {
		return e.Message
	}
	return fallback
}
