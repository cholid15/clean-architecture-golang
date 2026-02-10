package handler

import (
	"net/http"
	"strconv"

	"clean/internal/entity"
	"clean/internal/usecase"

	"github.com/gin-gonic/gin"
)

type BookingHandler struct {
	uc *usecase.BookingUsecase
}

func NewBookingHandler(u *usecase.BookingUsecase) *BookingHandler {
	return &BookingHandler{uc: u}
}

func (h *BookingHandler) GetAll(c *gin.Context) {
	bookings, err := h.uc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, bookings)
}



func (h *BookingHandler) Create(c *gin.Context) {
	var req entity.Booking

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.Create(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "booking created"})
}

func (h *BookingHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req entity.Booking
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ID = id

	if err := h.uc.Update(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "booking updated"})
}

func (h *BookingHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "booking deleted"})
}
