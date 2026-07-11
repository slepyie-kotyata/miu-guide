package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"miu-guide/internal/env"
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
//TODO: 7) проверка на формат даты

var layout = "2006.01.02"

func validateDate(date string) bool {
	_, err := time.Parse(layout, date)
	return err == nil
}

func GetSpecificSchedule(c *echo.Context) error {
	groupId, scheduleDay := c.Param("group"), c.QueryParam("day")
	if _, err := strconv.Atoi(groupId); err != nil || !validateDate(scheduleDay) {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code": 1,
		})
	}
	client := &http.Client{} // вынести это в структуру

	urlRequest := fmt.Sprintf("%s/schedule/group/%s?start=%s&finish=%s&lng=1", env.GetEnv(env.ScheduleBaseApiUrl), groupId, scheduleDay, scheduleDay)
    apiReq, _ := http.NewRequest("GET", urlRequest, nil)
    apiReq.SetBasicAuth(env.GetEnv(env.ScheduleUsername), env.GetEnv(env.SchedulePassword))

	apiResp, err := client.Do(apiReq)
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