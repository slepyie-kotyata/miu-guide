package handlers

import (
	"errors"
	"log"
	"miu-guide/internal/client"
	"miu-guide/internal/filter"
	"miu-guide/internal/models"
	"miu-guide/internal/service"
	"net/http"
	"strconv"
	"time"
	"unicode"

	"github.com/labstack/echo/v5"
)

// get /me -> get /access/users/:id (есть)
// get /subjects -> get /access/users/:id/subjects

type UserHandler struct {
	miuApiClient	*client.MIUClient
	scheduleApiClient *client.ScheduleAPIClient
}

func NewUserHandler(mc *client.MIUClient, sc *client.ScheduleAPIClient) *UserHandler {
    return &UserHandler{
        miuApiClient: mc,
		scheduleApiClient: sc,
    }
}

func determineCourse(groupName string, now time.Time) int {
	var enrollDigit int
	for _, char := range groupName {
		if unicode.IsDigit(char) {
			enrollDigit = int(char - '0')
			break
		}
	}

	academicYearEnd := now.Year()
	// если сейчас 1 семестр, то этот учебный год закончится в следующем календарном
	if now.Month() >= time.September {
		academicYearEnd++
	}

	return (academicYearEnd % 10 - enrollDigit + 10) % 10
}

// @Summary      Получение информации о пользователе
// @Description  Получение данных о студенте
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "ID пользователя"
// @Success      200  {object}  models.UserInfo "Успешный ответ"
// @Failure      400  {object}  map[string]int  "{"code": 1} - Пустой токен в Bearer"
// @Failure      401  {object}  map[string]int  "{"code": 1} - Неправильные данные пользователя, {"code": 2} - Невалидный токен(истек срок)"
// @Failure      404  {object}  map[string]int  "{"code": 1} - Не найден пользователь"
// @Failure      503  {object}  map[string]int  "{"code": 3} - Недоступность API ЛК ММУ - code: 3, Недоступность API Расписания - code: 1"
// @Router       /access/users/{id} [get]
func (u *UserHandler) GetUserInfo(c *echo.Context) error {
    token, _ := c.Get("token").(string)
    userId, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusUnauthorized, map[string]any{ "code": 1 })
    }

    // получаем часть данных из API ЛК ММУ
    userInfo, err := u.miuApiClient.GetUserInfo(token, userId)
    if err != nil {
        if errors.Is(err, client.ErrInvalidToken) {
            log.Printf("[ERROR] %v", err)
            return c.JSON(http.StatusUnauthorized, map[string]any{ "code": 2 })
        } else {
            return handleAPIError(c, err, SourceMIU)
        }
    }

    // получаем айди группы из API расписания ММУ
    // учитывать здесь NotFound
    groupId, err := u.scheduleApiClient.GetGroupId(userInfo.Department)
    if err != nil {
        return handleAPIError(c, err, SourceSchedule)
    }

    groupCode := string([]rune(userInfo.Department)[:3])

    return c.JSON(http.StatusOK, models.UserInfo{
        FullName: userInfo.FullName,
        GroupName: userInfo.Department,
        GroupId: groupId,
        Major: models.MajorCodes[groupCode].Major,
        Specialization: models.MajorCodes[groupCode].Specialization,
        Course: determineCourse(userInfo.Department, service.GetTime()),
        Institution: userInfo.Institution,
    })
}

// @Summary      Получение списка предметов
// @Description  Получение списка предметов на текущий семестр
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "ID пользователя"
// @Success      200  {object}  []string "Успешный ответ"
// @Failure      400  {object}  map[string]int  "Неверный формат ID - code: 1, Пустой токен в Bearer - code: 2"
// @Failure      401  {object}  map[string]int  "{"code": 2} - Невалидный токен(истек срок)"
// @Failure      404  {object}  map[string]int  "{"code": 1} - Не найден список предметов"
// @Failure      503  {object}  map[string]int  "{"code": 3} - Недоступность API ЛК ММУ - code: 3"
// @Router       /access/users/{id}/subjects [get]
func (u *UserHandler) GetUserSubjects(c *echo.Context) error {
    token, _ := c.Get("token").(string)
    userId, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]any{ "code": 1 })
    }

    subjectsList, err := u.miuApiClient.GetSubjectsList(token, userId)
    if err != nil {
        if errors.Is(err, client.ErrInvalidToken) {
            log.Printf("[ERROR] %v", err)
            return c.JSON(http.StatusUnauthorized, map[string]any{ "code": 2 })
        } else {
            return handleAPIError(c, err, SourceMIU)
        }
    }

    return c.JSON(http.StatusOK, filter.MergeDuplicateSubjects(filter.FilterSubjectsBySemester(subjectsList)))
}