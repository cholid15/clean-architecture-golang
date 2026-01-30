package main

import (
	"clean/internal/infrastructure/pgsql"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Application entry point

	err := godotenv.Load()

	if err != nil {
		log.Println("Env Variable failed to load")
	}

	log.Println("Env Variable loaded successfully")

	pgdb, err := pgsql.Init()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	if pgdb != nil {
		log.Println("Database initialized successfully")
	}

	r := gin.Default();

	log.Println("Starting the server on port 8080...")
	r.Run(":8080")
	
}