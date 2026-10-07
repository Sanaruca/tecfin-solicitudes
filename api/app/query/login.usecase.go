package query

import (
	"api/core/apperr"
	"api/core/auth"
	"api/core/password"
	"api/core/usecase"
	"api/models/usuario"
	"context"
	"errors"
	"net/mail"
	"strings"

	"gorm.io/gorm"
)

// LoginDTO es el payload del login.
type LoginDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginOutput es la respuesta del login: token de sesión + usuario.
// `user` no incluye la contraseña (json:"-" en el modelo).
type LoginOutput struct {
	Token string          `json:"token"`
	User  usuario.Usuario `json:"user"`
}

type Login usecase.Handler[context.Context, LoginDTO, LoginOutput]

type login struct {
	db     *gorm.DB
	secret []byte
}

// NewLogin crea el caso de uso de login. `secret` es la clave con la que se
// firman los JWT (JWT_SECRET).
func NewLogin(db *gorm.DB, secret []byte) Login {
	return &login{db: db, secret: secret}
}

func (uc *login) Exec(ctx context.Context, input LoginDTO) (LoginOutput, error) {
	if err := input.Validate(); err != nil {
		return LoginOutput{}, err
	}

	var u usuario.Usuario
	err := uc.db.WithContext(ctx).Where("email = ?", strings.TrimSpace(input.Email)).First(&u).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Mismo mensaje que contraseña incorrecta: no se revela si el email existe.
		return LoginOutput{}, apperr.Unauthorized("email o contraseña incorrectos")
	}
	if err != nil {
		return LoginOutput{}, err
	}

	if !u.Activo {
		return LoginOutput{}, apperr.Forbidden("la cuenta está desactivada")
	}

	if !password.Verify(u.Password, input.Password) {
		return LoginOutput{}, apperr.Unauthorized("email o contraseña incorrectos")
	}

	token, err := auth.Firmar(uc.secret, &u)
	if err != nil {
		return LoginOutput{}, err
	}

	return LoginOutput{Token: token, User: u}, nil
}

// Validate valida el payload del login.
func (input *LoginDTO) Validate() error {
	if strings.TrimSpace(input.Email) == "" {
		return apperr.BadRequest("el campo email es obligatorio")
	}
	if _, err := mail.ParseAddress(strings.TrimSpace(input.Email)); err != nil {
		return apperr.BadRequest("el campo email debe ser un email válido")
	}
	if input.Password == "" {
		return apperr.BadRequest("el campo password es obligatorio")
	}
	return nil
}
