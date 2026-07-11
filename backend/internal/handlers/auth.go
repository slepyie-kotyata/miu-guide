package handlers

// import (
// 	"miu-guide/internal/client"
// 	"miu-guide/internal/models"
// 	"net/http"

// 	"github.com/labstack/echo/v5"
// )

// type AuthHandler struct {
// 	apiClient	*client.MIUClient
// }

// func NewAuthHandler(mc *client.MIUClient) *AuthHandler {
//     return &AuthHandler{
//         apiClient: mc,
//     }
// }

// // func (a *AuthHandler) Authorize(c *echo.Context) error {
// // 	token, err := a.apiClient.GetToken(models.AuthRequest{Login: c.FormValue("login"), Password: c.FormValue("password")})
// // 	switch(err){
// // 	case client.ErrUnavaliableAPI:
// // 		return c.JSON(http.StatusServiceUnavailable, map[string]any{
// // 			"code": 3,
// // 		})
// // 	case client.ErrInternal:
// // 		return c.JSON(http.StatusInternalServerError, map[string]any{
// // 			"code": 1,
// // 		})
// // 	case client.ErrInvalidLogin:
// // 		return c.JSON(http.StatusUnauthorized, map[string]any{
// // 			"code": 1,
// // 		})
// // 	}
// // }