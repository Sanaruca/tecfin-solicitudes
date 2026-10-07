package command

import (
	"api/core/apperr"
	"api/models/solicitud"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// validarEstado valida el estado de una solicitud.
// Un estado vacío es válido: se asume PENDIENTE (valor por defecto del modelo).
// Ojo: SQLite no soporta ENUM, así que los valores se validan en esta capa.
func validarEstado(estado solicitud.EstadoSolicitud) error {
	if estado == "" {
		return nil
	}
	if !estado.Valid() {
		return apperr.BadRequest("estado inválido: use PENDIENTE, EN_PROCESO, COMPLETADA o CANCELADA")
	}
	return nil
}

// validarTextoObligatorio valida que un campo no venga vacío.
func validarTextoObligatorio(valor, campo string) error {
	if strings.TrimSpace(valor) == "" {
		return apperr.BadRequest("el campo " + campo + " es obligatorio")
	}
	return nil
}

// esDuplicado detecta violaciones de la restricción UNIQUE de SQLite
// (p. ej. email repetido), traducida o no por GORM.
func esDuplicado(err error) bool {
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return true
	}
	return err != nil && strings.Contains(err.Error(), "UNIQUE constraint failed")
}
