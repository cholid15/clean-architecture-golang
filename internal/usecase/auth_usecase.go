package usecase

import (
	"clean/internal/entity"
	"clean/internal/repository"
	"clean/pkg/logger"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	Login(email, password string) (string, error)
	Register(username, email, password string, roleIds []int) error
	ForgotPassword(email string) error
	ResetPassword(token, newPassword string) error
}

type authUseCase struct {
	repo      repository.UserRepo
	jwtSecret string
}

func NewAuthUsecase(repo repository.UserRepo, jwtSecret string) AuthUsecase {
	return &authUseCase{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (uc *authUseCase) Login(email string, password string) (string, error) {
	user, err := uc.repo.GetByEmail(email)
	if err != nil {
		return "", errors.New(err.Error())
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	); err != nil {
		return "", errors.New("invalid password")
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(uc.jwtSecret))
	if err != nil {
		return "", errors.New("failed to sign token")
	}

	return signedToken, nil
}

func (uc *authUseCase) Register(username, email, password string, roleIds []int) error {
	// Validate inputs are not empty
	if username == "" || email == "" || password == "" {
		return errors.New("username, email, and password cannot be empty")
	}

	// Check if user already exists
	existingUser, err := uc.repo.GetByEmail(email)
	if err == nil && existingUser != nil {
		return errors.New("email already exists")
	}

	// Generate password hash
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return errors.New("failed to hash password")
	}

	// Create user object - NO ID, let database generate it
	user := &entity.User{
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
		// ID is NOT set - database will auto-generate via SERIAL
		// CreatedAt and UpdatedAt are set by database DEFAULT
	}

	if err := uc.repo.Create(user); err != nil {
		return err
	}

	// Assign roles to the newly created user
	if len(roleIds) > 0 {
		for _, roleID := range roleIds {
			if err := uc.repo.AssignRole(user.ID, roleID); err != nil {
				return errors.New("failed to assign role: " + err.Error())
			}
		}
	}

	return nil
}


// lupa password

func generateRandomToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (uc *authUseCase) ForgotPassword(email string) error {
	user, err := uc.repo.GetByEmail(email)
	if err != nil {
		return err
	}

	token, err := generateRandomToken()
	if err != nil {
		return err
	}

	expiry := time.Now().Add(15 * time.Minute)

	err = uc.repo.SaveResetToken(user.ID, token, expiry)
	if err != nil {
		return err
	}

	logger.InfoLogger.Println("Reset token for", email, ":", token)

	return nil
}

func (uc *authUseCase) ResetPassword(token string, newPassword string) error {
	user, err := uc.repo.GetByResetToken(token)
	if err != nil {
		return err
	}

	if user.ResetTokenExpiry == nil || time.Now().After(*user.ResetTokenExpiry) {
		return errors.New("token expired")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	err = uc.repo.UpdatePassword(user.ID, string(hashed))
	if err != nil {
		return err
	}

	return uc.repo.ClearResetToken(user.ID)
}
