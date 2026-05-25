package main

import (
	"clean/internal/delivery/http/handler"
	"clean/internal/delivery/http/middleware"
	"clean/internal/infrastructure/pgsql"
	"clean/internal/usecase"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"clean/pkg/logger"
)

func main() {
	// 1. Initialize Logger
	logger.Init()
	logger.InfoLogger.Println("Application starting...")

	// 2. Load Environment Variables
	if err := godotenv.Load(); err != nil {
		logger.ErrorLogger.Println("Failed to load .env file")
	} else {
		logger.InfoLogger.Println("Env Variable loaded successfully")
	}

	// 3. Initialize Database
	db, err := pgsql.Init()
	if err != nil {
		logger.ErrorLogger.Fatalf("Failed to initialize database: %v", err)
	}
	logger.InfoLogger.Println("Database initialized successfully")

	// 4. Initialize Gin Engine
	r := gin.Default()

	// 5. GLOBAL MIDDLEWARE
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggerMiddleware())

	// 6. Setup Repositories & Usecases
	userRepo := pgsql.NewUserRepoPG(db)
	jwtSecret := os.Getenv("JWT_SECRET")
	authUC := usecase.NewAuthUsecase(userRepo, jwtSecret)

	// 7. PUBLIC ROUTES
	handler.NewAuthHandler(r, authUC)

	// 8. PROTECTED ROUTES
	userHandler := handler.NewUserHandler(r, userRepo)
	r.GET("/profile",
		middleware.JWTMiddleware(jwtSecret),
		userHandler.GetProfile,
	)

	// =========================
	// ROOM MODULE
	// =========================
	roomRepo := pgsql.NewRoomRepo(db)
	roomUC := usecase.NewRoomUsecase(roomRepo)
	roomHandler := handler.NewRoomHandler(roomUC)

	// =========================
	// BOOKING MODULE
	// =========================
	bookingRepo := pgsql.NewBookingRepo(db)
	bookingUC := usecase.NewBookingUsecase(bookingRepo)
	bookingHandler := handler.NewBookingHandler(bookingUC)

	// =========================
	// PUBLIC ROUTES FOR DISPLAY (Tanpa JWT)
	// =========================
	r.GET("/display/rooms", roomHandler.GetAllDisplay)
	r.GET("/display/bookings", bookingHandler.GetAll)
	r.POST("/logs", handler.HandleFrontendLog) 

	// =========================
	// PROTECTED ROOM ROUTES
	// =========================
	room := r.Group("/rooms", middleware.JWTMiddleware(jwtSecret))
	{
		room.POST("", roomHandler.Create)
		room.GET("all", roomHandler.GetAll)
		room.PUT("/:id", roomHandler.Update)
		room.DELETE("/:id", roomHandler.Delete)
	}

	// =========================
	// PROTECTED BOOKING ROUTES
	// =========================
	booking := r.Group("/bookings", middleware.JWTMiddleware(jwtSecret))
	{
		booking.POST("", bookingHandler.Create)
		booking.GET("all", bookingHandler.GetAll)
		booking.PUT("/:id", bookingHandler.Update)
		booking.DELETE("/:id", bookingHandler.Delete)
		booking.POST("/refresh-status", bookingHandler.RefreshStatus)
	}

	// 9. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	logger.InfoLogger.Println("Starting the server on port " + port + "...")
	if err := r.Run(":" + port); err != nil {
		logger.ErrorLogger.Fatalf("Server failed to start: %v", err)
	}
}