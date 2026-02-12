package repository

import (
	"clean/internal/entity"
	"time"
)

type UserRepo interface {
	GetAll() ([]*entity.User, error)
	GetByEmail(email string) (*entity.User, error)
	GetById(id int) (*entity.User, error)
	Create(user *entity.User) error
	AssignRole(userID, roleID int) error
	GetUserWithRolesAndPermissions(userID int) (*entity.UserWithRoles, error)

	// reset password
	GetByResetToken(token string) (*entity.User, error)
	UpdatePassword(userID int, hashedPassword string) error
	SaveResetToken(userID int, token string, expiry time.Time) error
	ClearResetToken(userID int) error
}
