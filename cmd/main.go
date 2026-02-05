package main

import (
	"clean/internal/delivery/http/handler"
	"clean/internal/delivery/http/middleware"
	"clean/internal/infrastructure/pgsql"
	"clean/internal/usecase"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// load env
	_ = godotenv.Load()
	log.Println("Env Variable loaded successfully")

	// init db
	db, err := pgsql.Init()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	log.Println("Database initialized successfully")

	// gin
	r := gin.Default()

	// ===== WIRING (BENAR) =====
	userRepo := pgsql.NewUserRepoPG(db)

	jwtSecret := os.Getenv("JWT_SECRET")
	authUC := usecase.NewAuthUsecase(userRepo, jwtSecret)

	// Auth routes (public)
	handler.NewAuthHandler(r, authUC)

	// User routes (protected)
	userHandler := handler.NewUserHandler(r, userRepo)
	r.GET("/profile", middleware.JWTMiddleware(jwtSecret), userHandler.GetProfile)
	// =========================

	log.Println("Starting the server on port 8080...")
	r.Run(":8080")
}

