package service

import (
	"api/app"
	"api/app/command"
	"api/app/query"
	"gorm.io/gorm"
)

// Service es la composición de todos los casos de uso de la API.
type Service struct {
	Queries  app.Queries
	Commands app.Commands
}

// New crea el servicio con todos los casos de uso.
// `secret` es la clave con la que se firman los JWT de sesión (JWT_SECRET).
func New(db *gorm.DB, secret []byte) *Service {
	return &Service{
		Queries: app.Queries{
			Login:              query.NewLogin(db, secret),
			ObtenerUsuario:     query.NewObtenerUsuario(db),
			ObtenerUsuarios:    query.NewObtenerUsuarios(db),
			ObtenerSolicitud:   query.NewObtenerSolicitud(db),
			ObtenerSolicitudes: query.NewObtenerSolicitudes(db),
		},
		Commands: app.Commands{
			CrearSolicitud:    command.NewCrearSolicitud(db),
			EditarSolicitud:   command.NewEditarSolicitud(db),
			EliminarSolicitud: command.NewEliminarSolicitud(db),
			CrearUsuario:      command.NewCrearUsuario(db),
			EliminarUsuario:   command.NewEliminarUsuario(db),
		},
	}
}
