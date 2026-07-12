package routes

import (
	"miu-guide/internal/handlers"

	"github.com/labstack/echo/v5"
)

func InitUserRoutes(auth *echo.Group, uh *handlers.UserHandler)