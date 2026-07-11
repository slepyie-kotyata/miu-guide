package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

// @Summary      Тестовый эндпоинт
// @Description  Возвращает успешное сообщение для проверки работоспособности API
// @Tags         test
// @Produce      json
// @Success      200  {object}  map[string]string  "Успешное выполнение"
// @Router       /test [get]
func InitAuthRoutes(e *echo.Echo) {
	e.GET("/test", func(c *echo.Context) error {
    	return c.JSON(http.StatusOK, map[string]string{"message": "success"})
  	})
	// post auth/
}