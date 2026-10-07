package query

import (
	"api/core/apperr"
	"api/core/usecase"
	"api/models/usuario"
	"context"
	"errors"

	"gorm.io/gorm"
)

// ObtenerUsuarioDTO identifica un usuario por su id.
type ObtenerUsuarioDTO struct {
	ID int `json:"id"`
}

type ObtenerUsuario usecase.Handler[context.Context, ObtenerUsuarioDTO, usuario.Usuario]

type obtenerUsuario struct {
	db *gorm.DB
}

func NewObtenerUsuario(db *gorm.DB) ObtenerUsuario {
	return &obtenerUsuario{db: db}
}

func (uc *obtenerUsuario) Exec(ctx context.Context, input ObtenerUsuarioDTO) (usuario.Usuario, error) {
	if err := input.Validate(); err != nil {
		return usuario.Usuario{}, err
	}

	var u usuario.Usuario
	err := uc.db.WithContext(ctx).Where("id = ?", input.ID).First(&u).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return usuario.Usuario{}, apperr.NotFound("usuario no encontrado")
	}
	if err != nil {
		return usuario.Usuario{}, err
	}

	return u, nil
}

// Validate valida el id del usuario.
func (input *ObtenerUsuarioDTO) Validate() error {
	if input.ID <= 0 {
		return apperr.BadRequest("el id del usuario debe ser un número positivo")
	}
	return nil
}
