package query

import (
	"api/core/apperr"
	"api/core/usecase"
	"api/models/solicitud"
	"context"
	"strings"

	"gorm.io/gorm"
)

// ObtenerSolicitudesDTO son los filtros del listado de solicitudes.
// Todos los campos son opcionales: sin filtros se devuelve el listado completo.
type ObtenerSolicitudesDTO struct {
	UsuarioID int    `json:"usuario_id" query:"usuario_id"` // solicitudes registradas por un usuario
	Nombre    string `json:"nombre" query:"nombre"`         // buscar por nombre de cliente (parcial)
	Estado    string `json:"estado" query:"estado"`         // filtrar por estado
	Pagina    int    `json:"pagina" query:"pagina"`         // página, empieza en 1
	PorPagina int    `json:"porPagina" query:"porPagina"`   // 0 = sin paginación
}

type ObtenerSolicitudes usecase.Handler[context.Context, ObtenerSolicitudesDTO, []solicitud.Solicitud]

type obtenerSolicitudes struct {
	db *gorm.DB
}

func NewObtenerSolicitudes(db *gorm.DB) ObtenerSolicitudes {
	return &obtenerSolicitudes{db: db}
}

func (uc *obtenerSolicitudes) Exec(ctx context.Context, input ObtenerSolicitudesDTO) ([]solicitud.Solicitud, error) {
	if err := input.Validate(); err != nil {
		return nil, err
	}

	solicitudes := make([]solicitud.Solicitud, 0)
	query := uc.db.WithContext(ctx).Model(&solicitud.Solicitud{})

	if input.UsuarioID > 0 {
		query = query.Where("creadoPorId = ?", input.UsuarioID)
	}

	// Buscar por nombre de cliente (coincidencia parcial, sin distinguir mayúsculas).
	if nombre := strings.TrimSpace(input.Nombre); nombre != "" {
		query = query.Where("nombreCliente LIKE ? ESCAPE '\\'", patronLike(nombre))
	}

	// Filtrar por estado.
	if estado := strings.TrimSpace(input.Estado); estado != "" {
		e := solicitud.EstadoSolicitud(strings.ToUpper(estado))
		if !e.Valid() {
			return nil, apperr.BadRequest("estado inválido: use PENDIENTE, EN_PROCESO, COMPLETADA o CANCELADA")
		}
		query = query.Where("estado = ?", e)
	}

	// Paginación opcional.
	if input.PorPagina > 0 {
		pagina := input.Pagina
		if pagina < 1 {
			pagina = 1
		}
		query = query.Offset((pagina - 1) * input.PorPagina).Limit(input.PorPagina)
	}

	err := query.Order("id DESC").Find(&solicitudes).Error
	if err != nil {
		return nil, err
	}

	return solicitudes, nil
}

// Validate valida los filtros del listado.
func (input *ObtenerSolicitudesDTO) Validate() error {
	if input.UsuarioID < 0 {
		return apperr.BadRequest("usuario_id no puede ser negativo")
	}
	if input.Pagina < 0 {
		return apperr.BadRequest("pagina no puede ser negativa")
	}
	if input.PorPagina < 0 {
		return apperr.BadRequest("porPagina no puede ser negativo")
	}
	return nil
}

// patronLike escapa los comodines de LIKE para que la búsqueda sea literal.
func patronLike(texto string) string {
	escapar := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)
	return "%" + escapar.Replace(texto) + "%"
}
