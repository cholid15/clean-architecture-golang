package entity

import "time"

type Booking struct {
	ID               int       `db:"id" json:"id"`
	RoomID           int       `db:"room_id" json:"room_id"`
	Department       string    `db:"department" json:"department"`
	ParticipantCount int       `db:"participant_count" json:"participant_count"`
	StartTime        time.Time `db:"start_time" json:"start_time"`
	EndTime          time.Time `db:"end_time" json:"end_time"`
	CreatedAt        time.Time `db:"created_at" json:"created_at"`
}
