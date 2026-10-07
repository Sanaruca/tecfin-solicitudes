// Package auth implementa la sesión de la aplicación con JWT (HS256).
//
// El token viaja en `Authorization: Bearer <token>` y contiene solo los datos
// necesarios para autorizar (id y rol del usuario); la contraseña jamás sale
// del servidor.
package auth

import (
	"fmt"
	"strconv"
	"time"

	"api/models/usuario"

	"github.com/golang-jwt/jwt/v5"
)

const (
	// Issuer identifica a esta API dentro del token.
	Issuer = "solicitudes"
	// Duracion es la vigencia del token de sesión.
	Duracion = 24 * time.Hour
)

// Claims son los datos de sesión que viajan dentro del JWT.
type Claims struct {
	UsuarioID int    `json:"uid"`
	Rol       string `json:"rol"`
	jwt.RegisteredClaims
}

// Firmar genera el token de sesión de un usuario.
func Firmar(secret []byte, u *usuario.Usuario) (string, error) {
	now := time.Now()
	claims := Claims{
		UsuarioID: u.ID,
		Rol:       string(u.Rol),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    Issuer,
			Subject:   strconv.Itoa(u.ID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(Duracion)),
		},
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
	if err != nil {
		return "", fmt.Errorf("error al firmar el token: %w", err)
	}
	return token, nil
}

// Parsear valida la firma y la expiración del token y devuelve sus claims.
func Parsear(secret []byte, token string) (*Claims, error) {
	claims := &Claims{}
	_, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		// Solo se acepta HS256: evita ataques de confusión de algoritmo.
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma no soportado: %v", t.Header["alg"])
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	return claims, nil
}
