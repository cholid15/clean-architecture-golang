package entity

import "time"
type User struct {
	ID string `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Email string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`	
}

// parameter register
type RegisterParams struct {
	Username string `json:"username"`
	Email string `json:"email"`
	Password string `json:"password"`
}

// parameter login
type LoginParams struct {
	Email string `json:"email"`
	Password string `json:"password"`
}



