package repository

import "clean/internal/entity"

type UserRepo interface {
	GetAll() ([]*entity.User, error)
	GetByEmail(email string) (*entity.User, error)
	GetById(id int) (*entity.User, error)
	Create(user *entity.User) error
	AssignRole(userID, roleID int) error
	GetUserWithRolesAndPermissions(userID int) (*entity.UserWithRoles, error)
}
