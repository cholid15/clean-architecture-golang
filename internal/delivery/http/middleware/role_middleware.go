package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// RoleMiddleware checks if user has required roles
func RoleMiddleware(db *sqlx.DB, requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user_id from context (set by JWTMiddleware)
		userIDInterface, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "user not authenticated",
			})
			c.Abort()
			return
		}

		userID, ok := userIDInterface.(int)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid user id",
			})
			c.Abort()
			return
		}

		// Query user roles
		query := `
			SELECT r.name 
			FROM roles r
			INNER JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = $1
		`

		var userRoles []string
		err := db.Select(&userRoles, query, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to fetch user roles",
			})
			c.Abort()
			return
		}

		// Check if user has any of the required roles
		hasRequiredRole := false
		for _, userRole := range userRoles {
			for _, requiredRole := range requiredRoles {
				if userRole == requiredRole {
					hasRequiredRole = true
					break
				}
			}
			if hasRequiredRole {
				break
			}
		}

		if !hasRequiredRole {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "insufficient permissions",
			})
			c.Abort()
			return
		}

		// Store user roles in context
		c.Set("user_roles", userRoles)
		c.Next()
	}
}
