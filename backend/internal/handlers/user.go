package handlers

import (
	"errors"
	"miu-guide/internal/apperror"
	"miu-guide/internal/client"
	"miu-guide/internal/filter"
	"miu-guide/internal/models"
	"miu-guide/internal/utils"
	"net/http"
	"strconv"
	"time"
	"unicode"

	"github.com/labstack/echo/v5"
)

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
// @Failure      400  {object}  map[string]int  "{"code": 1} - Пустой токен в Bearer/неправильный userId"
// @Failure      401  {object}  map[string]int  "{"code": 2} - Невалидный токен(истек срок)"
// @Failure      404  {object}  map[string]int  "{"code": 1} - Не найден пользователь"
// @Failure      503  {object}  map[string]int  "{"code": 3} - Недоступность API ЛК ММУ, {"code": 1} - Недоступность API Расписания"
// @Router       /access/users/{id} [get]
func (u *UserHandler) GetUserInfo(c *echo.Context) error {
    token, _ := c.Get("token").(string)
    userId, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return apperror.Send(c, apperror.Wrap(
            apperror.ErrBadRequest, 
            apperror.SourceMIU, 
            "invalid userId parameter",
            ),
        )
    }

    userInfo, err := u.miuApiClient.GetUserInfo(token, userId)
    if err != nil {
        if errors.Is(err, apperror.ErrInvalidCredentials) {
            return apperror.Send(c, err, 2)
        } else {
            return apperror.Send(c, err)
        }
    }

    groupId, err := u.scheduleApiClient.GetGroupId(userInfo.Department)
    if err != nil {
        return apperror.Send(c, err)
    }

    groupCode := string([]rune(userInfo.Department)[:3])

    return c.JSON(http.StatusOK, models.UserInfo{
        FullName: userInfo.FullName,
        GroupName: userInfo.Department,
        GroupId: groupId,
        Major: models.MajorCodes[groupCode].Major,
        Specialization: models.MajorCodes[groupCode].Specialization,
        Course: determineCourse(userInfo.Department, utils.GetTime()),
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
// @Failure      400  {object}  map[string]int  "{"code": 1} - Пустой токен в Bearer/неправильный userId"
// @Failure      401  {object}  map[string]int  "{"code": 2} - Невалидный токен(истек срок)"
// @Failure      404  {object}  map[string]int  "{"code": 1} - Не найден список предметов"
// @Failure      503  {object}  map[string]int  "{"code": 3} - Недоступность API ЛК ММУ - code: 3"
// @Router       /access/users/{id}/subjects [get]
func (u *UserHandler) GetUserSubjects(c *echo.Context) error {
    token, _ := c.Get("token").(string)
    userId, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return apperror.Send(c, apperror.Wrap(
            apperror.ErrBadRequest, 
            apperror.SourceMIU, 
            "invalid userId parameter",
            ),
        )
    }

    subjectsList, err := u.miuApiClient.GetSubjectsList(token, userId)
    if err != nil {
        if errors.Is(err, apperror.ErrInvalidCredentials) {
            return apperror.Send(c, err, 2)
        } else {
            return apperror.Send(c, err)
        }
    }

    return c.JSON(http.StatusOK, filter.MergeDuplicateSubjects(filter.FilterSubjectsBySemester(subjectsList)))
}