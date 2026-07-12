package handlers

import (
	"errors"
	"miu-guide/internal/client"
	"miu-guide/internal/models"
	"net/http"

	"github.com/labstack/echo/v5"
)

type AuthHandler struct {
	apiClient	*client.MIUClient
}

func NewAuthHandler(mc *client.MIUClient) *AuthHandler {
    return &AuthHandler{
        apiClient: mc,
    }
}

// @Summary      Авторизация пользователя
// @Description  Проксирует запрос в MIU API, проверяет логин/пароль и возвращает токен и ID пользователя
// @Tags         auth
// @Accept       x-www-form-urlencoded
// @Produce      json
// @Param        login    formData  string  true  "Логин пользователя (имя пользователя)"
// @Param        password formData  string  true  "Пароль пользователя"
// @Success      200      {object}  models.AuthResponse
// @Failure      401      {object}  map[string]int  "Неверный логин или пароль (code: 1)"
// @Failure      500      {object}  map[string]int  "Внутренняя ошибка сервера (code: 1)"
// @Failure      502      {object}  map[string]int  "Ошибка MIUApi (code: 1)"
// @Failure      503      {object}  map[string]int  "Сервис недоступен (code: 3 - недоступность\таймаут MIUApi)"
// @Router       /auth [post]
func (a *AuthHandler) Authorize(c *echo.Context) error {
    //получаем Token
    token, err := a.apiClient.GetToken(models.AuthRequest{
        Login:    c.FormValue("login"), 
        Password: c.FormValue("password"),
    })
    
    if err != nil {
        if errors.Is(err, client.ErrInvalidLogin) {
            return c.JSON(http.StatusUnauthorized, map[string]any{ "code": 1 })
        }
        return a.handleAPIError(c, err)
    }

    // получаем UserID
    userId, err := a.apiClient.GetUserId(token)
    if err != nil {
        if errors.Is(err, client.ErrExternalFailure) {
            return c.JSON(http.StatusBadGateway, map[string]any{ "code": 1 })
        }
        return a.handleAPIError(c, err)
    }

    return c.JSON(http.StatusOK, models.AuthResponse{
        UserId: userId,
        Token:  token,
    })
}

func (a *AuthHandler) handleAPIError(c *echo.Context, err error) error {
    switch {
    case errors.Is(err, client.ErrUnavaliableAPI):
        return c.JSON(http.StatusServiceUnavailable, map[string]any{ "code": 3 })
        
    case errors.Is(err, client.ErrInternal):
        return c.JSON(http.StatusInternalServerError, map[string]any{ "code": 1 })
        
    default:
        return c.JSON(http.StatusInternalServerError, map[string]any{ "code": 1 })
    }
}