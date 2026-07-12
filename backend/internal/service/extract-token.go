package service

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
)

func ExtractTokenMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		
		if token == "" {
			return c.JSON(http.StatusBadRequest, map[string]any{ "code": 2 })
		}

		c.Set("token", token)
		return next(c)
	}
}