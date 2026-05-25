package entity

import "time"

type Room struct {
	ID        int       `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Capacity  int       `db:"capacity" json:"capacity"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}