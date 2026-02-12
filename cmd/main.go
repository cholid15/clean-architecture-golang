package main

import (
	"clean/internal/delivery/http/handler"
	"clean/internal/delivery/http/middleware"
	"clean/internal/infrastructure/pgsql"
	"clean/internal/usecase"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	// logger
	"clean/pkg/logger"
)

func main() {
	// init logger
	logger.Init()
	logger.InfoLogger.Println("Application starting...")

	// load env
	if err := godotenv.Load(); err != nil {
		logger.ErrorLogger.Println("Failed to load .env file")
	} else {
		logger.InfoLogger.Println("Env Variable loaded successfully")
	}

	// init db
	db, err := pgsql.Init()
	if err != nil {
		logger.ErrorLogger.Fatalf("Failed to initialize database: %v", err)
	}
	logger.InfoLogger.Println("Database initialized successfully")

	// gin
	r := gin.Default()

	// =========================
	// USER & AUTH (EXISTING)
	// =========================
	userRepo := pgsql.NewUserRepoPG(db)

	jwtSecret := os.Getenv("JWT_SECRET")
	authUC := usecase.NewAuthUsecase(userRepo, jwtSecret)

	// Auth routes (public)
	handler.NewAuthHandler(r, authUC)

	// User routes (protected)
	userHandler := handler.NewUserHandler(r, userRepo)
	r.GET("/profile",
		middleware.JWTMiddleware(jwtSecret),
		userHandler.GetProfile,
	)

	// =========================
	// ROOM
	// =========================
	roomRepo := pgsql.NewRoomRepo(db)
	roomUC := usecase.NewRoomUsecase(roomRepo)
	roomHandler := handler.NewRoomHandler(roomUC)

	room := r.Group("/rooms", middleware.JWTMiddleware(jwtSecret))
	{
		room.POST("", roomHandler.Create)
		room.GET("all", roomHandler.GetAll)
		room.PUT("/:id", roomHandler.Update)
		room.DELETE("/:id", roomHandler.Delete)
	}

	// =========================
	// BOOKING
	// =========================
	bookingRepo := pgsql.NewBookingRepo(db)
	bookingUC := usecase.NewBookingUsecase(bookingRepo)
	bookingHandler := handler.NewBookingHandler(bookingUC)

	booking := r.Group("/bookings", middleware.JWTMiddleware(jwtSecret))
	{
		booking.POST("", bookingHandler.Create)
		booking.GET("all", bookingHandler.GetAll)
		booking.PUT("/:id", bookingHandler.Update)
		booking.DELETE("/:id", bookingHandler.Delete)
	}

	logger.InfoLogger.Println("Starting the server on port 8080...")
	if err := r.Run(":8080"); err != nil {
		logger.ErrorLogger.Fatalf("Server failed to start: %v", err)
	}
}
