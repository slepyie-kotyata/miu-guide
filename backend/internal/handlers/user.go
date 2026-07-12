package handlers

import (
	"errors"
	"miu-guide/internal/client"
	"net/http"

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

func (u *UserHandler) handleAPIError(c *echo.Context, err error) error {
    switch {
    case errors.Is(err, client.ErrUnavaliableAPI):
        return c.JSON(http.StatusServiceUnavailable, map[string]any{ "code": 3 })
        
    case errors.Is(err, client.ErrInternal):
        return c.JSON(http.StatusInternalServerError, map[string]any{ "code": 1 })
        
    default:
        return c.JSON(http.StatusInternalServerError, map[string]any{ "code": 1 })
    }
}

func (u *UserHandler) GetUserInfo(c *echo.Context) error

