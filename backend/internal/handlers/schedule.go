package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"miu-guide/internal/client"
	"miu-guide/internal/filter"
	"miu-guide/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
)

//TODO: 1) принимаем id группы и день (da)
//TODO: 2) распаковка json (da)
//TODO: 3) фильтр по disciplineOid, lessonNumberStart (da)
//TODO: 4) структура ответа (da)
//TODO: 5) обработка "неправильных" ответов (da)
//TODO: 6) работа с redis (если нет -> запрос к апи и кэшируем, если есть -> вытаскиваем) (da)
//TODO: 7) проверка на формат даты (da)
//TODO: 8) определение дня по time zone (da)

var layout = "2006.01.02"

func validateDate(date string) bool {
	_, err := time.Parse(layout, date)
	return err == nil
}

func getDate() string {
	loc, err := time.LoadLocation("Europe/Moscow")
	if err != nil {
		fmt.Println("error loading location:", err)
		return time.Now().Format(layout)
	}

	moscowTime := time.Now().In(loc)
	return moscowTime.Format(layout)
}

type ScheduleHandler struct {
    apiClient 	*client.ScheduleAPIClient
	redisClient *redis.Client
}

func NewScheduleHandler(ac *client.ScheduleAPIClient, rdb *redis.Client) *ScheduleHandler {
    return &ScheduleHandler{
        apiClient: ac,
		redisClient: rdb,
    }
}

func (s *ScheduleHandler) getSchedule(c *echo.Context, groupId string, scheduleDay string) error {
	key := groupId + ":" + scheduleDay

	ctx, cancel := context.WithTimeout(c.Request().Context(), 2 * time.Second)
	defer cancel()

	//1. проверяем redis
	thisSchedule, err := s.redisClient.Get(ctx, key).Result()
	if err == nil {
        return c.JSONBlob(http.StatusOK, []byte(thisSchedule))
    }

	if !errors.Is(err, redis.Nil) {
        if errors.Is(err, context.DeadlineExceeded) {
            return c.JSON(http.StatusServiceUnavailable, map[string]any{
				"code": 2,
			})
        }
        return c.JSON(http.StatusInternalServerError, map[string]any{
			"code": 2,
		})
    }

	//2. если нет запрашиваем у api и кэшируем
	apiResp, err := s.apiClient.FetchData(groupId, scheduleDay)
	if err != nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]any{
			"code": 1,
		})
	}

	var schedule []models.RawSchedule
	
	defer apiResp.Body.Close()

	body, err := io.ReadAll(apiResp.Body)
	if err := json.Unmarshal(body, &schedule); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"code": 1,
		})
	}

	result := filter.FilterSchedule(schedule)

	if resultBytes, err := json.Marshal(result); err == nil {
        s.redisClient.Set(ctx, key, resultBytes, 24 * time.Hour)
    }

    return c.JSON(http.StatusOK, result)
}


// @Summary Расписание на сегодня
// @Description Возвращает расписание для указанной группы на текущий день.
// @Tags schedule
// @Produce json
// @Param group path int true "ID Группы (число)"
// @Success 200 {array} models.Schedule "Успешный ответ (данные из кэша или API)"
// @Failure 400 {object} ErrorResponse "Невалидный ID группы (code: 1)"
// @Failure 500 {object} ErrorResponse "Внутренняя ошибка сервера (code: 1 - ошибка парсинга ответа API, code: 2 - ошибка Redis)"
// @Failure 503 {object} ErrorResponse "Сервис недоступен (code: 1 - недоступность API расписания, code: 2 - недоступность\таймаут Redis)"
// @Router /schedule/{group}/today [get]
func (s *ScheduleHandler) GetTodaySchedule(c *echo.Context) error {
	groupId := c.Param("group")
	if _, err := strconv.Atoi(groupId); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code": 1,
		})
	}

	return s.getSchedule(c, groupId, getDate())
}

// @Summary Расписание на конкретный день
// @Description Возвращает расписание для указанной группы на выбранный день.
// @Tags schedule
// @Produce json
// @Param group path int true "ID Группы (число)"
// @Param day query string true "Дата расписания (формат: YYYY.MM.DD)"
// @Success 200 {array} models.Schedule "Успешный ответ (данные из кэша или API)"
// @Failure 400 {object} ErrorResponse "Невалидный ID группы (code: 1)"
// @Failure 500 {object} ErrorResponse "Внутренняя ошибка сервера (code: 1 - ошибка парсинга ответа API, code: 2 - ошибка Redis)"
// @Failure 503 {object} ErrorResponse "Сервис недоступен (code: 1 - недоступность API расписания, code: 2 - недоступность\таймаут Redis)"
// @Router /schedule/{group} [get]
func (s *ScheduleHandler) GetSpecificSchedule(c *echo.Context) error {
	groupId, scheduleDay := c.Param("group"), c.QueryParam("day")
	if _, err := strconv.Atoi(groupId); err != nil || !validateDate(scheduleDay) {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code": 1,
		})
	}

	return s.getSchedule(c, groupId, scheduleDay)
}