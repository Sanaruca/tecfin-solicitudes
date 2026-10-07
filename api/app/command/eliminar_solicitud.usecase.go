package command

import (
	"api/core/apperr"
	"api/core/usecase"
	"api/models/solicitud"
	"context"
	"errors"

	"gorm.io/gorm"
)

// EliminarSolicitudDTO identifica la solicitud a eliminar.
type EliminarSolicitudDTO struct {
	ID int `json:"-"`
}

type EliminarSolicitud usecase.Handler[context.Context, EliminarSolicitudDTO, solicitud.Solicitud]

type eliminarSolicitud struct {
	db *gorm.DB
}

func NewEliminarSolicitud(db *gorm.DB) EliminarSolicitud {
	return &eliminarSolicitud{db: db}
}

// Exec elimina la solicitud y devuelve el registro eliminado.
// Tanto el Administrador como el Operador pueden hacerlo (gestión de solicitudes).
func (uc *eliminarSolicitud) Exec(ctx context.Context, input EliminarSolicitudDTO) (solicitud.Solicitud, error) {
	if err := input.Validate(); err != nil {
		return solicitud.Solicitud{}, err
	}

	var s solicitud.Solicitud
	err := uc.db.WithContext(ctx).Where("id = ?", input.ID).First(&s).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return solicitud.Solicitud{}, apperr.NotFound("solicitud no encontrada")
	}
	if err != nil {
		return solicitud.Solicitud{}, err
	}

	if err := uc.db.WithContext(ctx).Delete(&s).Error; err != nil {
		return solicitud.Solicitud{}, err
	}

	return s, nil
}

// Validate valida el id de la solicitud.
func (input *EliminarSolicitudDTO) Validate() error {
	if input.ID <= 0 {
		return apperr.BadRequest("el id de la solicitud debe ser un número positivo")
	}
	return nil
}
