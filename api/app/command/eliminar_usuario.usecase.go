package command

import (
	"api/core/apperr"
	"api/core/usecase"
	"api/models/solicitud"
	"api/models/usuario"
	"context"
	"errors"

	"gorm.io/gorm"
)

// EliminarUsuarioDTO identifica al usuario a eliminar e incluye al actor.
type EliminarUsuarioDTO struct {
	ID       int         `json:"-"`
	ActorID  int         `json:"-"`
	RolActor usuario.Rol `json:"-"`
}

type EliminarUsuario usecase.Handler[context.Context, EliminarUsuarioDTO, usuario.Usuario]

type eliminarUsuario struct {
	db *gorm.DB
}

func NewEliminarUsuario(db *gorm.DB) EliminarUsuario {
	return &eliminarUsuario{db: db}
}

// Exec elimina un usuario. Solo lo puede hacer un administrador.
// Sus solicitudes se conservan: se desvincula `creadoPorId` (ON DELETE SET NULL).
func (uc *eliminarUsuario) Exec(ctx context.Context, input EliminarUsuarioDTO) (usuario.Usuario, error) {
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

	tx := uc.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return usuario.Usuario{}, tx.Error
	}

	// Las solicitudes se conservan, pero dejan de apuntar al usuario eliminado.
	if err := tx.Model(&solicitud.Solicitud{}).
		Where("creadoPorId = ?", input.ID).
		Update("creadoPorId", nil).Error; err != nil {
		tx.Rollback()
		return usuario.Usuario{}, err
	}

	if err := tx.Delete(&u).Error; err != nil {
		tx.Rollback()
		return usuario.Usuario{}, err
	}

	if err := tx.Commit().Error; err != nil {
		return usuario.Usuario{}, err
	}

	return u, nil
}

// Validate valida las reglas de negocio de eliminación de usuarios.
func (input *EliminarUsuarioDTO) Validate() error {
	// Regla del spec: el Operador no puede crear ni eliminar usuarios.
	if !input.RolActor.EsAdministrador() {
		return apperr.Forbidden("solo un administrador puede eliminar usuarios")
	}
	if input.ID <= 0 {
		return apperr.BadRequest("el id del usuario debe un número positivo")
	}
	if input.ID == input.ActorID {
		return apperr.BadRequest("no puedes eliminar tu propio usuario")
	}
	return nil
}
