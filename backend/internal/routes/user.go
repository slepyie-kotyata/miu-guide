package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitUserRoutes(auth *echo.Group, uh *handlers.UserHandler) {
	auth.GET("/users/:id", uh.GetUserInfo)
	auth.GET("/users/:id/subjects", uh.GetUserSubjects)
}