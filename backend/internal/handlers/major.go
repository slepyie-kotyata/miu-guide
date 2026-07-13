package handlers

import (
	"miu-guide/internal/models"
	"net/http"

	"github.com/labstack/echo/v5"
)

// @Summary Список направлений 
// @Description Возвращает список направлений
// @Tags major
// @Produce json
// @Success 200 {array} []string "Успешный ответ"
// @Router /majors [get]
func GetMajors(c *echo.Context) error {
	return c.JSON(http.StatusOK, models.Majors)
}