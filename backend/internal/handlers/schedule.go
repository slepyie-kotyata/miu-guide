package handlers

import (
	"context"
	"log"
	"miu-guide/internal/client"
	"miu-guide/internal/filter"
	"miu-guide/internal/service"
	"miu-guide/internal/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v5"
)

type ScheduleHandler struct {
    apiClient 		*client.ScheduleAPIClient
	scheduleService *service.ScheduleService
}

func NewScheduleHandler(ac *client.ScheduleAPIClient, s *service.ScheduleService) *ScheduleHandler {
    return &ScheduleHandler{
        apiClient: ac,
		scheduleService: s,
    }
}

// @Summary Расписание на сегодня
// @Description Возвращает расписание для указанной группы на текущий день.
// @Tags schedule
// @Produce json
// @Param group path int true "ID Группы (число)"
// @Success 200 {array} 	models.Schedule "Успешный ответ"
// @Failure 400 {object} 	map[string]int 	"{"code": 1} - Невалидный ID группы"
// @Failure 500 {object} 	map[string]int 	"{"code": 1} - ошибка парсинга ответа API, {"code": 2} - ошибка Redis"
// @Failure 503 {object} 	map[string]int 	"{"code": 1} - Недоступность API Расписания, {"code": 2} - недоступность\таймаут Redis"
// @Router /schedule/{group}/today [get]
func (s *ScheduleHandler) GetTodaySchedule(c *echo.Context) error {
	groupId := c.Param("group")
	if _, err := strconv.Atoi(groupId); err != nil {
		log.Printf("err: %s", err)
		return c.JSON(http.StatusBadRequest, map[string]any{ "code": 1 })
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 2 * time.Second)
    defer cancel()
	schedule, err := s.scheduleService.GetSchedule(ctx, groupId, utils.GetDate())
	if err != nil {
		return handleAPIError(c, err, SourceSchedule)
	}

	return c.JSON(http.StatusOK, schedule)
}

// @Summary Расписание на конкретный день
// @Description Возвращает расписание для указанной группы на выбранный день.
// @Tags schedule
// @Produce json
// @Param group path int true "ID Группы (число)"
// @Param day query string true "Дата расписания (формат: YYYY.MM.DD)"
// @Success 200 {array} 	models.Schedule "Успешный ответ"
// @Failure 400 {object} 	map[string]int 	"{"code": 1} - Невалидный ID группы"
// @Failure 500 {object} 	map[string]int 	"{"code": 1} - ошибка парсинга ответа API, {"code": 2} - ошибка Redis"
// @Failure 503 {object} 	map[string]int 	"{"code": 1} - Недоступность API Расписания, {"code": 2} - недоступность\таймаут Redis"
// @Router /schedule/{group} [get]
func (s *ScheduleHandler) GetSpecificSchedule(c *echo.Context) error {
	groupId, scheduleDay := c.Param("group"), c.QueryParam("day")
	if _, err := strconv.Atoi(groupId); err != nil || !utils.ValidateDate(scheduleDay) {
		log.Printf("err: %s", err)
		return c.JSON(http.StatusBadRequest, map[string]any{ "code": 1 })
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 2 * time.Second)
    defer cancel()
	schedule, err := s.scheduleService.GetSchedule(ctx, groupId, scheduleDay)
	if err != nil {
		return handleAPIError(c, err, SourceSchedule)
	}

	return c.JSON(http.StatusOK, schedule)
}

// @Summary Имена преподавателей
// @Description Возвращает найденные ФИО преподавателей
// @Tags search
// @Produce json
// @Param lecturer query string true "Фамилия преподавателя"
// @Success 200 {array} 	[]string 		"Успешный ответ"
// @Failure 400 {object}  	map[string]int  "{"code": 2} - Пустой параметр lecturer"
// @Failure 404 {object}  	map[string]int  "{"code": 1} - Не найдены ФИО преподавателей"
// @Failure 503 {object}  	map[string]int  "{"code": 1} - Недоступность API Расписания"
// @Router /search [get]
func (s *ScheduleHandler) GetLecturers(c *echo.Context) error {
	lecturerName := c.QueryParam("lecturer")
	if lecturerName == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{ "code": 2 })
	}
	apiResp, err := s.apiClient.GetLecturers(lecturerName)
	if err != nil {
		return handleAPIError(c, err, SourceSchedule)
	}

	return c.JSON(http.StatusOK, filter.GetUniqueLabels(apiResp))
}