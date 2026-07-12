package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitAuthRoutes(e *echo.Echo, ah *handlers.AuthHandler) {
	e.POST("/auth", ah.Authorize)
}