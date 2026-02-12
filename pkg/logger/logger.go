package logger

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
)

var (
	InfoLogger  *log.Logger
	ErrorLogger *log.Logger

	currentDate string
	logFile     *os.File
	mutex       sync.Mutex
)

func Init() {
	file := getLogFile()

	InfoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime)
	ErrorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime)
}

func getLogFile() *os.File {
	mutex.Lock()
	defer mutex.Unlock()

	now := time.Now()
	date := now.Format("2006-01-02")

	// Kalau masih hari yang sama, pakai file lama
	if logFile != nil && date == currentDate {
		return logFile
	}

	// Tutup file lama kalau sudah beda hari
	if logFile != nil {
		logFile.Close()
	}

	currentDate = date

	// Path: internal/writable/logs/
	logDir := filepath.Join("internal", "writable", "logs")
	err := os.MkdirAll(logDir, os.ModePerm)
	if err != nil {
		log.Fatalf("failed to create log directory: %v", err)
	}

	fileName := fmt.Sprintf("log-%s.log", date)
	fullPath := filepath.Join(logDir, fileName)

	file, err := os.OpenFile(fullPath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatalf("failed to open log file: %v", err)
	}

	logFile = file
	return logFile
}
