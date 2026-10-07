package query

import (
	"api/core/apperr"
	"api/core/usecase"
	"api/models/solicitud"
	"context"
	"errors"

	"gorm.io/gorm"
)

// ObtenerSolicitudDTO identifica una solicitud por su id.
type ObtenerSolicitudDTO struct {
	ID int `json:"id"`
}

type ObtenerSolicitud usecase.Handler[context.Context, ObtenerSolicitudDTO, solicitud.Solicitud]

type obtenerSolicitud struct {
	db *gorm.DB
}

func NewObtenerSolicitud(db *gorm.DB) ObtenerSolicitud {
	return &obtenerSolicitud{db: db}
}

func (uc *obtenerSolicitud) Exec(ctx context.Context, input ObtenerSolicitudDTO) (solicitud.Solicitud, error) {
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

	return s, nil
}

// Validate valida el id de la solicitud.
func (input *ObtenerSolicitudDTO) Validate() error {
	if input.ID <= 0 {
		return apperr.BadRequest("el id de la solicitud debe ser un número positivo")
	}
	return nil
}
