package handlers

import (
	"errors"
	"log"
	"miu-guide/internal/client"
	"net/http"

	"github.com/labstack/echo/v5"
)

// потом это нормально вынести куда-нибудь в нормальное место (refactor)
type APISource string
const (
	SourceMIU       APISource   = "MIU_API"
	SourceSchedule  APISource   = "SCHEDULE_API"
    SourceRedis     APISource   = "REDIS"
)
var sourceErrorCodes = map[APISource]int{
    SourceMIU:      3,
    SourceSchedule: 1,
    SourceRedis:    2,
}

// желательно отделить как-нибудь от ручки
func handleAPIError(c *echo.Context, err error, source APISource) error {
    log.Printf("[ERROR] %v", err)
	switch {
	case errors.Is(err, client.ErrUnavailableAPI):
        code := sourceErrorCodes[source]
        return c.JSON(http.StatusServiceUnavailable, map[string]any{"code": code})
	case errors.Is(err, client.ErrInternal):
		return c.JSON(http.StatusInternalServerError, map[string]any{"code": 1})
    case errors.Is(err, client.ErrNotFound):
        return c.JSON(http.StatusNotFound, map[string]any{ "code": 1 })
	default:
		return c.JSON(http.StatusInternalServerError, map[string]any{"code": 1})
	}
}