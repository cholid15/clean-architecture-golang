package pgsql

import (
	"clean/internal/entity"
	"clean/internal/repository"

	"github.com/jmoiron/sqlx"
)

type roomRepo struct {
	db *sqlx.DB
}

func NewRoomRepo(db *sqlx.DB) repository.RoomRepo {
	return &roomRepo{db: db}
}

func (r *roomRepo) GetAll() ([]*entity.Room, error) {
	var rooms []*entity.Room
	err := r.db.Select(&rooms, `SELECT * FROM rooms ORDER BY created_at DESC`)
	return rooms, err
}


func (r *roomRepo) GetById(id int) (*entity.Room, error) {
	var room entity.Room
	err := r.db.Get(&room, `SELECT * FROM rooms WHERE id = $1`, id)
	return &room, err
}


func (r *roomRepo) Create(room *entity.Room) error {
	return r.db.QueryRow(`
		INSERT INTO rooms (name, capacity)
		VALUES ($1,$2)
		RETURNING id
	`, room.Name, room.Capacity).Scan(&room.ID)
}

func (r *roomRepo) Update(room *entity.Room) error {
	_, err := r.db.Exec(`
		UPDATE rooms SET name=$1, capacity=$2 WHERE id=$3
	`, room.Name, room.Capacity, room.ID)
	return err
}


func (r *roomRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM rooms WHERE id=$1`, id)
	return err
}