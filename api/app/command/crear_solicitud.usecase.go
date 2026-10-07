package command

import (
	"api/core/usecase"
	"api/models/solicitud"
	"context"
	"strings"
	"time"

	"gorm.io/gorm"
)

// CrearSolicitudDTO es el payload para crear una solicitud.
//
// Los campos de la solicitud vienen del body; el usuario autenticado que la
// registra (`UsuarioID`) lo inyecta la capa HTTP, nunca el cliente.
type CrearSolicitudDTO struct {
	solicitud.SolicitudCreateInput
	UsuarioID int `json:"-"`
}

type CrearSolicitud usecase.Handler[context.Context, CrearSolicitudDTO, solicitud.Solicitud]

type crearSolicitud struct {
	db *gorm.DB
}

func NewCrearSolicitud(db *gorm.DB) CrearSolicitud {
	return &crearSolicitud{db: db}
}

func (uc *crearSolicitud) Exec(ctx context.Context, input CrearSolicitudDTO) (solicitud.Solicitud, error) {
	if err := input.Validate(); err != nil {
		return solicitud.Solicitud{}, err
	}

	estado := input.Estado
	if estado == "" {
		estado = solicitud.EstadoPendiente
	}

	fecha := input.Fecha
	if fecha.IsZero() {
		fecha = time.Now()
	}

	s := solicitud.Solicitud{
		NombreCliente: strings.TrimSpace(input.NombreCliente),
		Telefono:      strings.TrimSpace(input.Telefono),
		Descripcion:   strings.TrimSpace(input.Descripcion),
		Fecha:         fecha,
		Estado:        estado,
	}
	if input.UsuarioID > 0 {
		creadoPor := input.UsuarioID
		s.CreadoPorID = &creadoPor
	}

	if err := uc.db.WithContext(ctx).Create(&s).Error; err != nil {
		return solicitud.Solicitud{}, err
	}

	return s, nil
}

// Validate valida el payload de creación.
func (input *CrearSolicitudDTO) Validate() error {
	if err := validarTextoObligatorio(input.NombreCliente, "nombreCliente"); err != nil {
		return err
	}
	if err := validarTextoObligatorio(input.Telefono, "telefono"); err != nil {
		return err
	}
	if err := validarTextoObligatorio(input.Descripcion, "descripcion"); err != nil {
		return err
	}
	return validarEstado(input.Estado)
}
