package query

import (
	"api/core/apperr"
	"api/core/usecase"
	"api/models/usuario"
	"context"
	"strings"

	"gorm.io/gorm"
)

// ObtenerUsuariosDTO son los filtros del listado de usuarios.
type ObtenerUsuariosDTO struct {
	Rol string `json:"rol" query:"rol"` // ADMINISTRADOR | OPERADOR
}

type ObtenerUsuarios usecase.Handler[context.Context, ObtenerUsuariosDTO, []usuario.Usuario]

type obtenerUsuarios struct {
	db *gorm.DB
}

func NewObtenerUsuarios(db *gorm.DB) ObtenerUsuarios {
	return &obtenerUsuarios{db: db}
}

// Exec lista usuarios. La contraseña nunca se expone (json:"-" en el modelo).
func (uc *obtenerUsuarios) Exec(ctx context.Context, input ObtenerUsuariosDTO) ([]usuario.Usuario, error) {
	if err := input.Validate(); err != nil {
		return nil, err
	}

	usuarios := make([]usuario.Usuario, 0)
	query := uc.db.WithContext(ctx).Model(&usuario.Usuario{})

	if rol := strings.TrimSpace(input.Rol); rol != "" {
		r := usuario.Rol(strings.ToUpper(rol))
		if !r.Valid() {
			return nil, apperr.BadRequest("rol inválido: use ADMINISTRADOR u OPERADOR")
		}
		query = query.Where("rol = ?", r)
	}

	err := query.Order("id DESC").Find(&usuarios).Error
	if err != nil {
		return nil, err
	}

	return usuarios, nil
}

// Validate valida los filtros del listado de usuarios.
func (input *ObtenerUsuariosDTO) Validate() error {
	return nil
}
