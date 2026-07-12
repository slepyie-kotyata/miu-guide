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


func (a *AuthHandler) Authorize(c *echo.Context) error {
    //получаем Token
    token, err := a.apiClient.GetToken(models.AuthRequest{
        Login:    c.FormValue("login"), 
        Password: c.FormValue("password"),
    })
    
    if err != nil {
        if errors.Is(err, client.ErrInvalidLogin) {
            return c.JSON(http.StatusUnauthorized, map[string]any{ "code": 2 })
        }
        return a.handleAPIError(c, err)
    }

    // получаем UserID
    userId, err := a.apiClient.GetUserId(token)
    if err != nil {
        if errors.Is(err, client.ErrExternalFailure) {
            return c.JSON(http.StatusBadGateway, map[string]any{ "code": 3 })
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