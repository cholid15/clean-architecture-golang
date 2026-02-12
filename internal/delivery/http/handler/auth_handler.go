package handler

import (
	"clean/internal/entity"
	"clean/internal/usecase"
	"clean/pkg/logger"
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
	r.POST("/forgot-password", h.ForgotPassword)
	r.POST("/reset-password", h.ResetPassword)
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req entity.RegisterParams

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.ErrorLogger.Println("Register bind error:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request: " + err.Error(),
		})
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		logger.ErrorLogger.Println("Register validation failed: missing fields")
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
		logger.ErrorLogger.Println("Register failed:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	logger.InfoLogger.Println("Register success:", req.Email)

	c.JSON(http.StatusCreated, gin.H{
		"message": "register success",
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req entity.LoginParams

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.ErrorLogger.Println("Login bind error:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	token, err := h.uc.Login(req.Email, req.Password)
	if err != nil {
		logger.ErrorLogger.Println("Login failed:", err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	logger.InfoLogger.Println("Login success:", req.Email)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req entity.ForgotPasswordParams

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.ErrorLogger.Println("ForgotPassword bind error:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if req.Email == "" {
		logger.ErrorLogger.Println("ForgotPassword validation failed: empty email")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email is required",
		})
		return
	}

	err := h.uc.ForgotPassword(req.Email)
	if err != nil {
		logger.ErrorLogger.Println("ForgotPassword failed:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	logger.InfoLogger.Println("ForgotPassword requested:", req.Email)

	c.JSON(http.StatusOK, gin.H{
		"message": "reset link sent (check server log for token)",
	})
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req entity.ResetpasswordParams

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.ErrorLogger.Println("ResetPassword bind error:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if req.Token == "" || req.NewPassword == "" {
		logger.ErrorLogger.Println("ResetPassword validation failed")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "token and new_password are required",
		})
		return
	}

	err := h.uc.ResetPassword(req.Token, req.NewPassword)
	if err != nil {
		logger.ErrorLogger.Println("ResetPassword failed:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	logger.InfoLogger.Println("ResetPassword success")

	c.JSON(http.StatusOK, gin.H{
		"message": "password updated successfully",
	})
}
