package handler

import (
	"clean/internal/entity"
	"clean/internal/usecase"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	uc usecase.AuthUsecase
}

func NewAuthHandler(r *gin.Engine, uc usecase.AuthUsecase) { 
	h := &AuthHandler{uc}

	r.POST("/register", h.Register)
	r.POST("/login", h.Login)
}


// Register User
func (h *AuthHandler) Register(c *gin.Context) {
	var params entity.RegisterParams

	err := c.ShouldBindBodyWithJSON(&params)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	 }

	 err = h.uc.Register(params.Username, params.Email, params.Password) 
	 if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	 }

	 c.JSON(http.StatusCreated, gin.H{"message": "user registered successfully"})
}


// Login User
func (h *AuthHandler) Login(c *gin.Context) {
	var params entity.LoginParams

	err := c.ShouldBindBodyWithJSON(&params)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	 }

	 token, err := h.uc.Login(params.Email, params.Password) 
	 if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	 }

	 c.JSON(http.StatusOK, gin.H{"token": token})
}
