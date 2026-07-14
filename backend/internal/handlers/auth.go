package handlers

import (
	"miu-guide/internal/apperror"
	"miu-guide/internal/models"
	"net/http"

	"github.com/labstack/echo/v5"
)

// @Summary      Авторизация пользователя
// @Description  Проксирует запрос в MIU API, проверяет логин/пароль и возвращает токен и ID пользователя
// @Tags         auth
// @Accept       x-www-form-urlencoded
// @Produce      json
// @Param        login    formData  string  true  "Логин пользователя (имя пользователя)"
// @Param        password formData  string  true  "Пароль пользователя"
// @Success      200      {object}  models.AuthResponse
// @Failure      401      {object}  map[string]int  "{"code": 1} - Неверный логин или пароль"
// @Failure      500      {object}  map[string]int  "{"code": 1} - Внутренняя ошибка сервера"
// @Failure      502      {object}  map[string]int  "{"code": 1} - Ошибка MIUApi"
// @Failure      503      {object}  map[string]int  "{"code": 3} - Недоступность\таймаут MIUApi"
// @Router       /auth [post]
func (u *UserHandler) Authorize(c *echo.Context) error {
    token, err := u.miuApiClient.GetToken(models.AuthRequest{
        Login:    c.FormValue("login"), 
        Password: c.FormValue("password"),
    })
    if err != nil {
        return apperror.Send(c, err)
    }

    userId, err := u.miuApiClient.GetUserId(token)
    if err != nil {
        return apperror.Send(c, err)
    }

    return c.JSON(http.StatusOK, models.AuthResponse{
        UserId: userId,
        Token:  token,
    })
}