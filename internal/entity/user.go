package entity

import "time"

type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"password" db:"password"`
	ResetToken *string 	`db:"reset_token"`
	ResetTokenExpiry *time.Time 	`db:"reset_token_expiry"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// parameter register - ONLY accepts these fields
type RegisterParams struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	RoleIds  []int  `json:"role_ids" binding:""` // Optional: assign roles during registration
}

// parameter login - ONLY accepts these fields
type LoginParams struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}


// parameter lupa password dan reset password
type ForgotPasswordParams struct {
	Email string `json:"email"`
}

type ResetpasswordParams struct {
	Token string `json:"token"`
	NewPassword string `json:"new_password"`
}

