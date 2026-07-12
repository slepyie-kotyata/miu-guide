package handlers

import (
	"errors"
	"miu-guide/internal/client"
	"miu-guide/internal/models"
	"miu-guide/internal/service"
	"net/http"
	"strconv"
	"time"
	"unicode"

	"github.com/labstack/echo/v5"
)

// get /me -> get /access/users/:id
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

// потом это нормально вынести куда-нибудь в нормальное место (refactor)
type APISource string
const (
	SourceMIU       APISource   = "MIU_API"
	SourceSchedule  APISource   = "SCHEDULE_API"
    SourceRedis     APISource   = "REDIS"
)

// желательно отделить как-нибудь от ручки
func (u *UserHandler) handleAPIError(c *echo.Context, err error, source APISource) error {
	switch {
	case errors.Is(err, client.ErrUnavaliableAPI):
        var code int

        switch(source){
        case SourceMIU:
            code = 3
        case SourceSchedule:
            code = 1
        case SourceRedis:
            code = 2
        default:
            code = 0 
        }
		return c.JSON(http.StatusServiceUnavailable, map[string]any{"code": code})
	case errors.Is(err, client.ErrInternal):
		return c.JSON(http.StatusInternalServerError, map[string]any{"code": 1})

	default:
		return c.JSON(http.StatusInternalServerError, map[string]any{"code": 1})
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

	return (academicYearEnd%10 - enrollDigit + 10) % 10
}

func (u *UserHandler) GetUserInfo(c *echo.Context) error {
    token, _ := c.Get("token").(string)
    userId, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]any{ "code": 1 })
    }

    // получаем часть данных из API ЛК ММУ
    userInfo, err := u.miuApiClient.GetUserInfo(token, userId)
    if err != nil {
        if errors.Is(err, client.ErrInvalidToken) {
            return c.JSON(http.StatusUnauthorized, map[string]any{ "code": 2 })
        }
        return u.handleAPIError(c, err, SourceMIU)
    }

    // получаем айди группы из API расписания ММУ
    groupId, err := u.scheduleApiClient.GetGroupId(userInfo.Department)
    if err != nil {
        return u.handleAPIError(c, err, SourceSchedule)
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

