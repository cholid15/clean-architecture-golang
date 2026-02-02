package repository

import "clean/internal/entity"

type UserRepo interface {
    GetAll() ([]*entity.User, error)           // Return harus dalam ()
    GetByEmail(string) (*entity.User, error)   // Tambah nama parameter
    GetById(string) (*entity.User, error)      // Tambah nama parameter  
    Create(*entity.User) error                 // Hanya return error
}