package repository

import "clean/internal/entity"

type RoomRepo interface {
	GetAll() ([]*entity.Room, error)
	GetById(id int) (*entity.Room, error)
	Create(*entity.Room) error
	Update(*entity.Room) error
	Delete(id int) error
}