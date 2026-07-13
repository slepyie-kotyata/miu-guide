package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitMajorRoutes(e *echo.Echo) {
	e.GET("/majors", handlers.GetMajors)
	e.GET("/events", handlers.GetFirstDayEventSchedule)
}