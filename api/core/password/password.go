// Package password centraliza el hash de contraseñas.
//
// Regla del proyecto: las contraseñas NUNCA se guardan en texto plano.
// En el seed se generan hashes bcrypt ($2b$), así que aquí se verifican
// y se generan con el mismo algoritmo.
package password

import "golang.org/x/crypto/bcrypt"

// Hash devuelve el hash bcrypt de la contraseña en texto plano.
func Hash(plain string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// Verify compara una contraseña en texto plano con su hash bcrypt.
func Verify(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
