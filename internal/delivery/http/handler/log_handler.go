package handler

import (
	"clean/pkg/logger"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LogRequest struct {
	Level   string `json:"level"`   // "info", "warn", "error"
	Message string `json:"message"`
	Data    string `json:"data"`    // opsional, detail tambahan
}

func HandleFrontendLog(c *gin.Context) {
	var req LogRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Format pesan: "INFO: User login | data: herda@gmail.com"
	msg := req.Message
	if req.Data != "" {
		msg = fmt.Sprintf("%s | data: %s", req.Message, req.Data)
	}

	switch req.Level {
	case "error":
		logger.FrontendLogger.Println("ERROR: " + msg)
	case "warn":
		logger.FrontendLogger.Println("WARN:  " + msg)
	default:
		logger.FrontendLogger.Println("INFO:  " + msg)
	}

	c.JSON(http.StatusOK, gin.H{"message": "log recorded"})
}