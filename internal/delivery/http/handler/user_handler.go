package handler

import (
	"clean/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	repo repository.UserRepo
}

func NewUserHandler(r *gin.Engine, repo repository.UserRepo) *UserHandler {
	h := &UserHandler{repo: repo}
	return h
}

// GetProfile returns current user profile with roles and permissions
func (h *UserHandler) GetProfile(c *gin.Context) {
	// Get user_id from context (set by JWTMiddleware)
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not authenticated",
		})
		return
	}

	userID, ok := userIDInterface.(int)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user id",
		})
		return
	}

	// Get user with roles and permissions
	user, err := h.repo.GetUserWithRolesAndPermissions(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

