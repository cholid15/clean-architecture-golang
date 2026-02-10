package entity

import "time"

type Room struct {
	ID int `db:"id"`
	Name string `db:"name"`
	Capacity int `db:"capacity"`
	CreatedAt time.Time `db:"created_at"`
}