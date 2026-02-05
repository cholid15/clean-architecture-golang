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
	h := &AuthHandler{uc: uc}

	r.POST("/register", h.Register)
	r.POST("/login", h.Login)
}

func (h *AuthHandler) Register(c *gin.Context) {
	// ✅ GUNAKAN DTO YANG BENAR - JANGAN MENERIMA ID
	var req entity.RegisterParams

	// Explicit binding to prevent extra fields
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request: " + err.Error(),
		})
		return
	}

	// Validate input manually for better error messages
	if req.Username == "" || req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "username, email, and password are required",
		})
		return
	}

	err := h.uc.Register(
		req.Username,
		req.Email,
		req.Password,
		req.RoleIds,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "register success",
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req entity.LoginParams

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	token, err := h.uc.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}
