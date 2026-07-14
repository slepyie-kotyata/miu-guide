package main

import (
	"errors"
	"log"
	"log/slog"
	_ "miu-guide/docs"
	"miu-guide/internal/apperror"
	"miu-guide/internal/client"
	"miu-guide/internal/connection"
	"miu-guide/internal/env"
	"miu-guide/internal/handlers"
	"miu-guide/internal/routes"
	"miu-guide/internal/service"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	echoSwagger "github.com/swaggo/echo-swagger/v2"
)

func init() {
    if err := godotenv.Load(); err != nil {
        log.Printf("(INIT) .env not found, using system environment\n")
    }

    logLevel := slog.LevelInfo
    envLogLevel := env.GetEnv(env.LogLevel) 

    if envLogLevel != "" {
        var parsedLevel slog.Level
        err := parsedLevel.UnmarshalText([]byte(envLogLevel))
        if err == nil {
            logLevel = parsedLevel
        } else {
            log.Printf("(INIT) Invalid log level '%s', defaulting to INFO\n", envLogLevel)
        }
    }

    opts := &slog.HandlerOptions{
        Level: logLevel,
    }
    handler := slog.NewJSONHandler(os.Stdout, opts)
    slog.SetDefault(slog.New(handler))
}

// @title MIU-Guide API
// @version 1.0
// @description <Это документация к API MIU-Guide!>
// @contact.name Команда "Слепые Котята"
// @contact.url https://github.com/slepyie-kotyata/miu-guide
// @license.name MIT License
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Вставьте токен в формате: Bearer {ваш_токен}
func main() {
	rdb, err := connection.GetRedisConnection()
    if err != nil {
		var appErr *apperror.AppError
		errors.As(err, &appErr)

		slog.Error(
			"error initializing Redis",
        	slog.String("source", string(appErr.Source)),
        	slog.String("error", err.Error()),
    	)
    }
    defer rdb.Close()

	sc, mc := client.NewScheduleAPIClient(), client.NewMIUClient()
	s := service.NewScheduleService(sc, rdb)
    scheduleHandler, userHandler := handlers.NewScheduleHandler(sc, s), handlers.NewUserHandler(mc, sc)
	
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: env.GetEnvAsSlice(env.AllowOrigins),
      	AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
    	AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete, http.MethodOptions},
  	}))
	access := e.Group("/access", service.ExtractTokenMiddleware)

	routes.InitMajorRoutes(e)
	routes.InitScheduleRoutes(e, scheduleHandler)
	routes.InitSearchRoutes(e, scheduleHandler)
	routes.InitAuthRoutes(e, userHandler)
	routes.InitUserRoutes(access, userHandler)

	e.GET("/swagger/*", echoSwagger.WrapHandler)
	
	if err := e.Start(":1323"); err != nil {
    	e.Logger.Error("failed to start server", "error", err)
  	}
}