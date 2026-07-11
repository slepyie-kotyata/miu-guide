package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitScheduleRoutes(e *echo.Echo, sh *handlers.ScheduleHandler) {
	e.GET("/schedule/:group", sh.GetSpecificSchedule)
}