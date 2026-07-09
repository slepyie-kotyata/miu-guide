package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

func InitAuthRoutes(e *echo.Echo) {
	e.GET("/test", func(c *echo.Context) error {
    	return c.JSON(http.StatusOK, map[string]string{"message": "success"})
  	})
}