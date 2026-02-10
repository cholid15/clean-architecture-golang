package pgsql

import (
	"clean/internal/entity"
	"clean/internal/repository"

	"github.com/jmoiron/sqlx"
)

type bookingRepo struct {
	db *sqlx.DB
}

func NewBookingRepo(db *sqlx.DB) repository.BookingRepo {
	return &bookingRepo{db: db}
}

func (b *bookingRepo) GetAll() ([]*entity.Booking, error) {
	var bookings []*entity.Booking
	err := b.db.Select(&bookings, `SELECT * FROM bookings ORDER BY start_time`)
	return bookings, err
}


func (b *bookingRepo) GetById(id int) (*entity.Booking, error) {
    var booking entity.Booking
    err := b.db.Get(&booking, `SELECT * FROM bookings WHERE id=$1`, id)
    return &booking, err
}

func (b *bookingRepo) Create(booking *entity.Booking) error {
	return b.db.QueryRow(`
		INSERT INTO bookings
		(room_id, department, participant_count, start_time, end_time)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id
	`,
		booking.RoomID,
		booking.Department,
		booking.ParticipantCount,
		booking.StartTime,
		booking.EndTime,
	).Scan(&booking.ID)
}


func (b *bookingRepo) Update(booking *entity.Booking) error {
	_, err := b.db.Exec(`
		UPDATE bookings
		SET room_id=$1,
		    department=$2,
		    participant_count=$3,
		    start_time=$4,
		    end_time=$5
		WHERE id=$6
	`,
		booking.RoomID,
		booking.Department,
		booking.ParticipantCount,
		booking.StartTime,
		booking.EndTime,
		booking.ID,
	)
	return err
}

func (b *bookingRepo) Delete(id int) error {
	_, err := b.db.Exec(`DELETE FROM bookings WHERE id=$1`, id)
	return err
}