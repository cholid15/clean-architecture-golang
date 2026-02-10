package usecase

import (
	"clean/internal/entity"
	"clean/internal/repository"
	"errors"
)

type RoomUsecase struct {
	repo repository.RoomRepo
}

func NewRoomUsecase(r repository.RoomRepo) *RoomUsecase {
	return &RoomUsecase{repo: r}
}

// =====================
// CREATE
// =====================
func (u *RoomUsecase) Create(name string, capacity int) error {
	if capacity <= 0 {
		return errors.New("capacity harus lebih dari 0")
	}

	return u.repo.Create(&entity.Room{
		Name:     name,
		Capacity: capacity,
	})
}

// =====================
// READ
// =====================
func (u *RoomUsecase) GetAll() ([]*entity.Room, error) {
	return u.repo.GetAll()
}

// =====================
// UPDATE
// =====================
func (u *RoomUsecase) Update(room *entity.Room) error {
	if room.ID <= 0 {
		return errors.New("invalid room id")
	}
	if room.Capacity <= 0 {
		return errors.New("capacity harus lebih dari 0")
	}

	return u.repo.Update(room)
}

// =====================
// DELETE
// =====================
func (u *RoomUsecase) Delete(id int) error {
	if id <= 0 {
		return errors.New("invalid room id")
	}

	return u.repo.Delete(id)
}
