package app

import (
	"api/app/command"
	"api/app/query"
)

// Queries agrupa los casos de uso de lectura.
type Queries struct {
	Login              query.Login
	ObtenerUsuario     query.ObtenerUsuario
	ObtenerUsuarios    query.ObtenerUsuarios
	ObtenerSolicitud   query.ObtenerSolicitud
	ObtenerSolicitudes query.ObtenerSolicitudes
}

// Commands agrupa los casos de uso de escritura.
type Commands struct {
	CrearSolicitud    command.CrearSolicitud
	EditarSolicitud   command.EditarSolicitud
	EliminarSolicitud command.EliminarSolicitud
	CrearUsuario      command.CrearUsuario
	EliminarUsuario   command.EliminarUsuario
}
