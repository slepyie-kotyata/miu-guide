package handlers

import (
	"fmt"
	"miu-guide/internal/apperror"
	"miu-guide/internal/models"
	"net/http"

	"github.com/labstack/echo/v5"
)

// @Summary Список направлений
// @Description Возвращает список направлений (моковые значения)
// @Tags mock
// @Produce json
// @Success 200 {array} []string "Успешный ответ"
// @Router /majors [get]
func GetMajors(c *echo.Context) error {
	return c.JSON(http.StatusOK, models.Majors)
}

// @Summary Расписание на 1 сентября 
// @Description Возвращает расписание на 1 сентября учитывая направление (моковые данные)
// @Tags mock
// @Produce json
// @Param major query string true "Название направления"
// @Success 200 {array} []string "Успешный ответ"
// @Failure 404 {object}  map[string]int "{"code": 1} - Не найдено расписание"
// @Router /events [get]
func GetFirstDayEventSchedule(c *echo.Context) error {
	majorName := c.QueryParam("major")
	eventSchedule, ok := models.FirstDayEventByMajor[majorName]
	if !ok {
		apperror.Send(c, apperror.Wrap(
			apperror.ErrNotFound, 
			apperror.SourceMock, 
			fmt.Sprintf("couldn't schedule for %s", majorName),
			),
		)
	}
	return c.JSON(http.StatusOK, eventSchedule)
}