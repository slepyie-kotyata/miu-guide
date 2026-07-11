package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"miu-guide/internal/env"
	"miu-guide/internal/filter"
	"miu-guide/internal/models"
	"net/http"

	"github.com/labstack/echo/v5"
)

//TODO: 1) принимаем id группы и день (da)
//TODO: 2) распаковка json (da)
//TODO: 3) фильтр по disciplineOid, lessonNumberStart (da)
//TODO: 4) структура ответа (da)
//TODO: 5) обработка "неправильных" ответов
//TODO: 6) работа с redis (если нет -> запрос к апи и кэшируем, если есть -> вытаскиваем)
//TODO: 7) проверка на формат даты

func GetSpecificSchedule(c *echo.Context) error {
	groupId, scheduleDay := c.Param("group"), c.QueryParam("day")
	client := &http.Client{} // вынести это в структуру

	// тут должна быть проверка на корректность параметров (проверка на число в groupId, проверка на дату scheduleDay)

	urlRequest := fmt.Sprintf("%s/schedule/group/%s?start=%s&finish=%s&lng=1", env.GetEnv(env.ScheduleBaseApiUrl), groupId, scheduleDay, scheduleDay)
    apiReq, _ := http.NewRequest("GET", urlRequest, nil)
    apiReq.SetBasicAuth(env.GetEnv(env.ScheduleUsername), env.GetEnv(env.SchedulePassword))

	fmt.Printf("%s\n", urlRequest) // убрать потом

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
	fmt.Println(result)
	return c.JSON(http.StatusOK, result)
}