package main

import (
	"log"
	_ "miu-guide/docs"
	"miu-guide/internal/client"
	"miu-guide/internal/connection"
	"miu-guide/internal/handlers"
	"miu-guide/internal/routes"
	"miu-guide/internal/service"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
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

	sc, mc := client.NewScheduleAPIClient(), client.NewMIUClient()
    scheduleHandler, userHandler := handlers.NewScheduleHandler(sc, rdb), handlers.NewUserHandler(mc, sc)
	
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:8100"},
      	AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
    	AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
  	}))
	access := e.Group("/access", service.ExtractTokenMiddleware)

	routes.InitScheduleRoutes(e, scheduleHandler)
	routes.InitAuthRoutes(e, userHandler)
	routes.InitUserRoutes(access, userHandler)

	e.GET("/swagger/*", echoSwagger.WrapHandler)
	
	if err := e.Start(":1323"); err != nil {
    	e.Logger.Error("failed to start server", "error", err)
  	}
}