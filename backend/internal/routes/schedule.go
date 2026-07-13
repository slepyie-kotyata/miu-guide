package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitScheduleRoutes(e *echo.Echo, sh *handlers.ScheduleHandler) {
	e.GET("/schedule/:group", sh.GetSpecificSchedule)
	e.GET("/schedule/:group/today", sh.GetTodaySchedule)
	e.GET("/schedule", sh.GetLecturers)
	// /schedule?lecturer=<value>
}