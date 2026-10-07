package command

import (
	"api/core/apperr"
	"api/core/usecase"
	"api/models/solicitud"
	"context"
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

// EditarSolicitudDTO es el payload para editar una solicitud.
// Todos los campos son opcionales: solo se actualizan los que vienen informados.
type EditarSolicitudDTO struct {
	solicitud.SolicitudUpdateInput
	ID int `json:"-"`
}

type EditarSolicitud usecase.Handler[context.Context, EditarSolicitudDTO, solicitud.Solicitud]

type editarSolicitud struct {
	db *gorm.DB
}

func NewEditarSolicitud(db *gorm.DB) EditarSolicitud {
	return &editarSolicitud{db: db}
}

func (uc *editarSolicitud) Exec(ctx context.Context, input EditarSolicitudDTO) (solicitud.Solicitud, error) {
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

	actualizado := false
	if input.NombreCliente != nil {
		s.NombreCliente = strings.TrimSpace(*input.NombreCliente)
		actualizado = true
	}
	if input.Telefono != nil {
		s.Telefono = strings.TrimSpace(*input.Telefono)
		actualizado = true
	}
	if input.Descripcion != nil {
		s.Descripcion = strings.TrimSpace(*input.Descripcion)
		actualizado = true
	}
	if input.Fecha != nil {
		s.Fecha = *input.Fecha
		actualizado = true
	}
	if input.Estado != nil {
		s.Estado = *input.Estado
		actualizado = true
	}

	if !actualizado {
		return solicitud.Solicitud{}, apperr.BadRequest("no se indicó ningún campo para actualizar")
	}

	s.ActualizadoEn = time.Now()
	if err := uc.db.WithContext(ctx).Save(&s).Error; err != nil {
		return solicitud.Solicitud{}, err
	}

	return s, nil
}

// Validate valida el payload de edición.
func (input *EditarSolicitudDTO) Validate() error {
	if input.ID <= 0 {
		return apperr.BadRequest("el id de la solicitud debe ser un número positivo")
	}
	if input.NombreCliente != nil {
		if err := validarTextoObligatorio(*input.NombreCliente, "nombreCliente"); err != nil {
			return err
		}
	}
	if input.Telefono != nil {
		if err := validarTextoObligatorio(*input.Telefono, "telefono"); err != nil {
			return err
		}
	}
	if input.Descripcion != nil {
		if err := validarTextoObligatorio(*input.Descripcion, "descripcion"); err != nil {
			return err
		}
	}
	if input.Estado != nil {
		return validarEstado(*input.Estado)
	}
	return nil
}
