package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitAuthRoutes(e *echo.Echo, uh *handlers.UserHandler) {
	e.POST("/auth", uh.Authorize)
}