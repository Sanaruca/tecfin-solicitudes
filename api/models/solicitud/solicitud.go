package solicitud

import (
	"api/models/usuario"
	"time"
)

// EstadoSolicitud define los estados posibles de una solicitud.
type EstadoSolicitud string

const (
	EstadoPendiente  EstadoSolicitud = "PENDIENTE"  // Pendiente
	EstadoEnProceso  EstadoSolicitud = "EN_PROCESO" // En proceso
	EstadoCompletada EstadoSolicitud = "COMPLETADA" // Completada
	EstadoCancelada  EstadoSolicitud = "CANCELADA"  // Cancelada
)

// EstadosValidos lista todos los estados permitidos (para filtrado y validación).
func EstadosValidos() []EstadoSolicitud {
	return []EstadoSolicitud{
		EstadoPendiente,
		EstadoEnProceso,
		EstadoCompletada,
		EstadoCancelada,
	}
}

// Valid indica si el estado tiene un valor permitido.
func (e EstadoSolicitud) Valid() bool {
	for _, s := range EstadosValidos() {
		if e == s {
			return true
		}
	}
	return false
}

// Solicitud representa una solicitud de cliente.
// Espejo del model `Solicitud` de prisma/schema.prisma (tabla SQLite "Solicitud").
//
// Los tags `not null` / `default` reproducen el schema que genera Prisma:
// así `AutoMigrate` no "corrige" (reconstruye) las tablas al arrancar.
type Solicitud struct {
	ID            int             `json:"id" gorm:"column:id;primaryKey;autoIncrement" db:"id"`
	NombreCliente string          `json:"nombreCliente" gorm:"column:nombreCliente;not null;index:Solicitud_nombreCliente_idx" db:"nombreCliente"`
	Telefono      string          `json:"telefono" gorm:"column:telefono;not null" db:"telefono"`
	Descripcion   string          `json:"descripcion" gorm:"column:descripcion;not null" db:"descripcion"`
	Fecha         time.Time       `json:"fecha" gorm:"column:fecha;not null;default:CURRENT_TIMESTAMP" db:"fecha"`
	Estado        EstadoSolicitud `json:"estado" gorm:"column:estado;not null;default:'PENDIENTE';index:Solicitud_estado_idx" db:"estado"`
	CreadoEn      time.Time       `json:"createdAt" gorm:"column:createdAt;not null;default:CURRENT_TIMESTAMP;autoCreateTime" db:"createdAt"`
	ActualizadoEn time.Time       `json:"updatedAt" gorm:"column:updatedAt;not null;autoUpdateTime" db:"updatedAt"`
	// Usuario (Administrador u Operador) que registró la solicitud.
	// Puede ser nil: si se elimina el usuario, la solicitud se conserva (ON DELETE SET NULL).
	CreadoPorID *int             `json:"creadoPorId" gorm:"column:creadoPorId" db:"creadoPorId"`
	CreadoPor   *usuario.Usuario `json:"creadoPor,omitempty" gorm:"-" db:"-"`
}

// TableName usa el mismo nombre de tabla que prisma/schema.prisma.
// Sin esto GORM crearía una tabla `solicitudes` distinta a la de Prisma.
func (Solicitud) TableName() string {
	return "Solicitud"
}

// SolicitudCreateInput es el payload para crear una solicitud.
type SolicitudCreateInput struct {
	NombreCliente string          `json:"nombreCliente" validate:"required"`
	Telefono      string          `json:"telefono" validate:"required"`
	Descripcion   string          `json:"descripcion" validate:"required"`
	Fecha         time.Time       `json:"fecha"`
	Estado        EstadoSolicitud `json:"estado" validate:"omitempty,oneof=PENDIENTE EN_PROCESO COMPLETADA CANCELADA"`
}

// SolicitudUpdateInput es el payload para editar una solicitud (campos opcionales).
type SolicitudUpdateInput struct {
	NombreCliente *string          `json:"nombreCliente,omitempty"`
	Telefono      *string          `json:"telefono,omitempty"`
	Descripcion   *string          `json:"descripcion,omitempty"`
	Fecha         *time.Time       `json:"fecha,omitempty"`
	Estado        *EstadoSolicitud `json:"estado,omitempty" validate:"omitempty,oneof=PENDIENTE EN_PROCESO COMPLETADA CANCELADA"`
}

// SolicitudFilter son los parámetros del listado: búsqueda por nombre + filtro por estado.
type SolicitudFilter struct {
	Nombre    string          `form:"nombre" query:"nombre"` // buscar por nombre de cliente
	Estado    EstadoSolicitud `form:"estado" query:"estado"` // filtrar por estado
	Pagina    int             `form:"pagina" query:"pagina"`
	PorPagina int             `form:"porPagina" query:"porPagina"`
}
