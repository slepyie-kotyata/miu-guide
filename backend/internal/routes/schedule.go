package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitScheduleRoutes(e *echo.Echo) {
	e.GET("/schedule/:group", handlers.GetSpecificSchedule)
}