package main

import (
	"log"
	_ "miu-guide/docs"
	"miu-guide/internal/client"
	"miu-guide/internal/connection"
	"miu-guide/internal/handlers"
	"miu-guide/internal/routes"

	"github.com/joho/godotenv"
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
	if err := godotenv.Load(); err != nil {
        log.Println(".env not found. using system environment")
    }

	rdb, err := connection.GetRedisConnection()
    if err != nil {
        log.Fatalf("error initializing Redis: %v", err)
    }
    defer rdb.Close()

	ac, mc := client.NewScheduleAPIClient(), client.NewMIUClient()
    scheduleHandler, authHandler := handlers.NewScheduleHandler(ac, rdb), handlers.NewAuthHandler(mc)
	
	e := echo.New()

	routes.InitAuthRoutes(e, authHandler)
	routes.InitScheduleRoutes(e, scheduleHandler)

	e.GET("/swagger/*", echoSwagger.WrapHandler)
	
	if err := e.Start(":1323"); err != nil {
    	e.Logger.Error("failed to start server", "error", err)
  	}
}