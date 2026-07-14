package logger

import (
	"log"
	"log/slog"
	"miu-guide/internal/env"
	"os"

	"github.com/joho/godotenv"
)

func Init() {
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