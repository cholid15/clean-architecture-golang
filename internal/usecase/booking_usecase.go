package usecase

import (
	"clean/internal/entity"
	"clean/internal/repository"
	"errors"
)

type BookingUsecase struct {
	repo repository.BookingRepo
}

func NewBookingUsecase (r repository.BookingRepo) *BookingUsecase {
	return &BookingUsecase{repo: r}
}

func (u *BookingUsecase) Create(b *entity.Booking) error {
	if b.StartTime.After(b.EndTime) {
		return errors.New("start_time harus sebelum end_time")
	}
	return u.repo.Create(b)
}

func (u *BookingUsecase) Update(b *entity.Booking) error {
	if b.StartTime.After(b.EndTime) {
		return errors.New("start_time harus sebelum end_time")
	}

	return u.repo.Update(b)
}

func (u *BookingUsecase) Delete(id int) error {
	return u.repo.Delete(id)
}

func (u *BookingUsecase) GetAll() ([]*entity.Booking, error) {
	return u.repo.GetAll()
}