package repository

import "clean/internal/entity"

type BookingRepo interface {
	GetAll() ([]*entity.Booking, error)
	GetById(id int) (*entity.Booking, error)
	Create(*entity.Booking) error
	Update(*entity.Booking) error
	Delete(id int) error
}