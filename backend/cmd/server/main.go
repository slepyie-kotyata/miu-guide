package main

import (
	"miu-guide/internal/routes"
	_ "miu-guide/docs"
	"github.com/labstack/echo/v5"
	echoSwagger "github.com/swaggo/echo-swagger/v2"
)

// @title MIU-Guide API
// @version 1.0
// @description <Это документация к API MIU-Guide!>
// @contact.name Команда "Слепые Котята"
// @contact.url https://github.com/slepyie-kotyata/miu-guide
// @license.name MIT License
// @BasePath /
func main() {
	e := echo.New()

	routes.InitAuthRoutes(e)
	e.GET("/swagger/*", echoSwagger.WrapHandler)
	
	if err := e.Start(":1323"); err != nil {
    	e.Logger.Error("failed to start server", "error", err)
  	}
}