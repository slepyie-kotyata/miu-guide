package handlers

import (
	"miu-guide/internal/apperror"
	"strings"

	"github.com/labstack/echo/v5"
)

func ExtractTokenMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		
		if token == "" {
			return apperror.Send(
				c, 
				apperror.Wrap(apperror.ErrBadRequest, 
					apperror.SourceMiddleWare, 
					"empty bearer token",
				))
		}

		c.Set("token", token)
		return next(c)
	}
}