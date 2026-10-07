package usuario

import "time"

// Rol define los roles de usuario del sistema.
type Rol string

const (
	RolAdministrador Rol = "ADMINISTRADOR"
	RolOperador      Rol = "OPERADOR"
)

// Valid indica si el rol tiene un valor permitido.
func (r Rol) Valid() bool {
	return r == RolAdministrador || r == RolOperador
}

// EsAdministrador devuelve true si el rol es Administrador.
// Solo el administrador puede crear y eliminar usuarios.
func (r Rol) EsAdministrador() bool {
	return r == RolAdministrador
}

// Usuario representa un usuario del sistema (login y autorización).
// Espejo del model `Usuario` de prisma/schema.prisma (tabla SQLite "Usuario").
//
// Los tags `not null` / `default` reproducen el schema que genera Prisma:
// así `AutoMigrate` no "corrige" (reconstruye) las tablas al arrancar.
type Usuario struct {
	ID            int       `json:"id" gorm:"column:id;primaryKey;autoIncrement" db:"id"`
	Nombre        string    `json:"nombre" gorm:"column:nombre;not null" db:"nombre"`
	Email         string    `json:"email" gorm:"column:email;not null;uniqueIndex:Usuario_email_key" db:"email"`
	Password      string    `json:"-" gorm:"column:password;not null" db:"password"` // hash; nunca se expone en JSON
	Rol           Rol       `json:"rol" gorm:"column:rol;not null;default:'OPERADOR';index:Usuario_rol_idx" db:"rol"`
	Activo        bool      `json:"activo" gorm:"column:activo;not null;default:true" db:"activo"`
	CreadoEn      time.Time `json:"createdAt" gorm:"column:createdAt;not null;default:CURRENT_TIMESTAMP;autoCreateTime" db:"createdAt"`
	ActualizadoEn time.Time `json:"updatedAt" gorm:"column:updatedAt;not null;autoUpdateTime" db:"updatedAt"`
}

// TableName usa el mismo nombre de tabla que prisma/schema.prisma.
// Sin esto GORM crearía una tabla `usuarios` distinta a la de Prisma.
func (Usuario) TableName() string {
	return "Usuario"
}

// UsuarioCreateInput es el payload para crear usuarios (solo Administrador).
type UsuarioCreateInput struct {
	Nombre   string `json:"nombre" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Rol      Rol    `json:"rol" validate:"required,oneof=ADMINISTRADOR OPERADOR"`
}

// LoginInput es el payload para el login.
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}
