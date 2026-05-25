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
	InfoLogger     *log.Logger
	ErrorLogger    *log.Logger
	FrontendLogger *log.Logger // tambah ini

	currentDate string
	logFile     *os.File
	mutex       sync.Mutex
)

func Init() {
	file := getLogFile()

	InfoLogger = log.New(file, "[BACKEND] INFO: ", log.Ldate|log.Ltime)
	ErrorLogger = log.New(file, "[BACKEND] ERROR: ", log.Ldate|log.Ltime)
	FrontendLogger = log.New(file, "[FRONTEND] ", log.Ldate|log.Ltime) // tambah ini
}

func getLogFile() *os.File {
	mutex.Lock()
	defer mutex.Unlock()

	now := time.Now()
	date := now.Format("2006-01-02")

	if logFile != nil && date == currentDate {
		return logFile
	}

	if logFile != nil {
		logFile.Close()
	}

	currentDate = date

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