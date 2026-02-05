package pgsql

import (
	"clean/internal/entity"
	"clean/internal/repository"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
)

type userRepo struct {
    db *sqlx.DB
}

func NewUserRepoPG(db *sqlx.DB) repository.UserRepo {
    return &userRepo{db: db}
}

// ========================
// GET ALL USERS
// ========================
func (r *userRepo) GetAll() ([]*entity.User, error) {
    users := []*entity.User{}
    err := r.db.Select(&users, `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
    `)
    if err != nil {
        return nil, err
    }
    return users, nil
}

// ========================
// GET BY EMAIL
// ========================
func (r *userRepo) GetByEmail(email string) (*entity.User, error) {
    user := &entity.User{}
    err := r.db.Get(user, `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
        WHERE email = $1
    `, email)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, err
        }
        return nil, err
    }
    return user, nil
}

// ========================
// GET BY ID
// ========================
func (r *userRepo) GetById(id int) (*entity.User, error) {
    user := &entity.User{}
    err := r.db.Get(user, `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
        WHERE id = $1
    `, id)
    if err != nil {
        return nil, err
    }
    return user, nil
}

// ========================
// CREATE USER - FIXED VERSION
// ========================
func (r *userRepo) Create(user *entity.User) error {
    now := time.Now()
    user.CreatedAt = now
    user.UpdatedAt = now

    query := `
        INSERT INTO users (username, email, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `
    
    // ✅ FIX: Gunakan QueryRowx untuk scan dengan struct tags
    err := r.db.QueryRowx(
        query,
        user.Username,
        user.Email,
        user.Password,
        user.CreatedAt,
        user.UpdatedAt,
    ).Scan(&user.ID)
    
    return err
}