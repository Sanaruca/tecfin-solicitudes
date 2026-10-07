package command

import (
	"api/core/apperr"
	"api/core/password"
	"api/core/usecase"
	"api/models/usuario"
	"context"
	"net/mail"
	"strings"

	"gorm.io/gorm"
)

// CrearUsuarioDTO es el payload para crear un usuario.
// Solo lo puede usar un administrador (`RolActor` lo inyecta la capa HTTP).
type CrearUsuarioDTO struct {
	usuario.UsuarioCreateInput
	RolActor usuario.Rol `json:"-"`
}

type CrearUsuario usecase.Handler[context.Context, CrearUsuarioDTO, usuario.Usuario]

type crearUsuario struct {
	db *gorm.DB
}

func NewCrearUsuario(db *gorm.DB) CrearUsuario {
	return &crearUsuario{db: db}
}

func (uc *crearUsuario) Exec(ctx context.Context, input CrearUsuarioDTO) (usuario.Usuario, error) {
	if err := input.Validate(); err != nil {
		return usuario.Usuario{}, err
	}

	hash, err := password.Hash(input.Password)
	if err != nil {
		return usuario.Usuario{}, err
	}

	u := usuario.Usuario{
		Nombre:   strings.TrimSpace(input.Nombre),
		Email:    strings.TrimSpace(input.Email),
		Password: hash, // siempre hasheada, nunca en texto plano
		Rol:      input.Rol,
		Activo:   true,
	}

	err = uc.db.WithContext(ctx).Create(&u).Error
	if err != nil {
		if esDuplicado(err) {
			return usuario.Usuario{}, apperr.Conflict("ya existe un usuario con ese email")
		}
		return usuario.Usuario{}, err
	}

	return u, nil
}

// Validate valida el payload y las reglas de negocio de creación de usuarios.
func (input *CrearUsuarioDTO) Validate() error {
	// Regla del spec: solo el Administrador crea usuarios.
	if !input.RolActor.EsAdministrador() {
		return apperr.Forbidden("solo un administrador puede crear usuarios")
	}
	if err := validarTextoObligatorio(input.Nombre, "nombre"); err != nil {
		return err
	}

	email := strings.TrimSpace(input.Email)
	if email == "" {
		return apperr.BadRequest("el campo email es obligatorio")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return apperr.BadRequest("el campo email debe ser un email válido")
	}

	if len(input.Password) < 6 {
		return apperr.BadRequest("el campo password debe tener al menos 6 caracteres")
	}
	if !input.Rol.Valid() {
		return apperr.BadRequest("rol inválido: use ADMINISTRADOR u OPERADOR")
	}
	return nil
}
