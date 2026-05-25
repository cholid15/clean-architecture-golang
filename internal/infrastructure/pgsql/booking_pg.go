package pgsql

import (
	"clean/internal/entity"
	"clean/internal/repository"
	"time"

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
	now := time.Now()
	if now.Before(booking.StartTime) {
		booking.Status = "upcoming"
	} else if now.After(booking.EndTime) {
		booking.Status = "done"
	} else {
		booking.Status = "ongoing"
	}

	return b.db.QueryRow(`
		INSERT INTO bookings
		(room_id, department, participant_count, start_time, end_time, status)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id
	`,
		booking.RoomID,
		booking.Department,
		booking.ParticipantCount,
		booking.StartTime,
		booking.EndTime,
		booking.Status,
	).Scan(&booking.ID)
}

func (b *bookingRepo) Update(booking *entity.Booking) error {
	now := time.Now()
	if now.Before(booking.StartTime) {
		booking.Status = "upcoming"
	} else if now.After(booking.EndTime) {
		booking.Status = "done"
	} else {
		booking.Status = "ongoing"
	}

	_, err := b.db.Exec(`
		UPDATE bookings
		SET room_id=$1,
			department=$2,
			participant_count=$3,
			start_time=$4,
			end_time=$5,
			status=$6
		WHERE id=$7
	`,
		booking.RoomID,
		booking.Department,
		booking.ParticipantCount,
		booking.StartTime,
		booking.EndTime,
		booking.Status,
		booking.ID,
	)
	return err
}

func (b *bookingRepo) Delete(id int) error {
	_, err := b.db.Exec(`DELETE FROM bookings WHERE id=$1`, id)
	return err
}

func (b *bookingRepo) RefreshAllStatus() error {
	now := time.Now()
	_, err := b.db.Exec(`
		UPDATE bookings SET status = CASE
			WHEN $1 < start_time THEN 'upcoming'
			WHEN $1 > end_time   THEN 'done'
			ELSE 'ongoing'
		END
	`, now)
	return err
}

// IsConflict cek apakah ruangan sudah dibooking di waktu yang sama
// excludeID dipakai saat Update agar tidak konflik dengan dirinya sendiri
func (b *bookingRepo) IsConflict(roomID int, start, end time.Time, excludeID int) (bool, error) {
	var count int
	err := b.db.Get(&count, `
		SELECT COUNT(*) FROM bookings
		WHERE room_id = $1
		AND id != $2
		AND start_time < $4
		AND end_time > $3
	`, roomID, excludeID, start, end)
	return count > 0, err
}