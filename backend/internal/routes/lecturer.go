package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitSearchRoutes(e *echo.Echo, sh *handlers.ScheduleHandler) {
	e.GET("/search", sh.GetLecturers)
}