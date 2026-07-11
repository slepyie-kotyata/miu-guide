package handlers

import (
	"encoding/json"
	"io"
	"miu-guide/internal/client"
	"miu-guide/internal/filter"
	"miu-guide/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v5"
)

//TODO: 1) принимаем id группы и день (da)
//TODO: 2) распаковка json (da)
//TODO: 3) фильтр по disciplineOid, lessonNumberStart (da)
//TODO: 4) структура ответа (da)
//TODO: 5) обработка "неправильных" ответов (da)
//TODO: 6) работа с redis (если нет -> запрос к апи и кэшируем, если есть -> вытаскиваем)
//TODO: 7) проверка на формат даты (da)

var layout = "2006.01.02"

func validateDate(date string) bool {
	_, err := time.Parse(layout, date)
	return err == nil
}

type ScheduleHandler struct {
    apiClient *client.ScheduleAPIClient
}

func NewScheduleHandler(apiClient *client.ScheduleAPIClient) *ScheduleHandler {
    return &ScheduleHandler{
        apiClient: apiClient,
    }
}

func (s *ScheduleHandler) GetSpecificSchedule(c *echo.Context) error {
	groupId, scheduleDay := c.Param("group"), c.QueryParam("day")
	if _, err := strconv.Atoi(groupId); err != nil || !validateDate(scheduleDay) {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code": 1,
		})
	}

	apiResp, err := s.apiClient.FetchData(groupId, scheduleDay)
	if err != nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]any{
			"code": 1,
		})
	}

	var schedule []models.RawSchedule

	body, err := io.ReadAll(apiResp.Body)
	if err := json.Unmarshal(body, &schedule); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"code": 1,
		})
	}

	result := filter.FilterSchedule(schedule)
	return c.JSON(http.StatusOK, result)
}