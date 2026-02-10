package handler

import (
	"net/http"
	"strconv"

	"clean/internal/entity"
	"clean/internal/usecase"

	"github.com/gin-gonic/gin"
)

type RoomHandler struct {
	uc *usecase.RoomUsecase
}

func NewRoomHandler(u *usecase.RoomUsecase) *RoomHandler {
	return &RoomHandler{uc: u}
}

// =====================
// CREATE ROOM
// =====================
func (h *RoomHandler) Create(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Capacity int    `json:"capacity"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.Create(req.Name, req.Capacity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "room created"})
}

// =====================
// GET ALL ROOMS
// =====================
func (h *RoomHandler) GetAll(c *gin.Context) {
	rooms, err := h.uc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rooms)
}

// =====================
// UPDATE ROOM
// =====================
func (h *RoomHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req entity.Room
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ID = id

	if err := h.uc.Update(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "room updated"})
}

// =====================
// DELETE ROOM
// =====================
func (h *RoomHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "room deleted"})
}
