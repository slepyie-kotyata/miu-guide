package apperror

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/labstack/echo/v5"
)

type Source string

const (
    SourceMIU      	    Source = "MIU_API"
    SourceSchedule 	    Source = "SCHEDULE_API"
    SourceRedis    	    Source = "REDIS"
    SourceInit     	    Source = "INIT"
	SourceMock		    Source = "MOCK"
    SourceMiddleWare    Source = "MIDDLEWARE"
)

var (
	ErrInvalidCredentials	= errors.New("invalid credentials")
	ErrUnavailableAPI  		= errors.New("unavailable api") 
	ErrInternal				= errors.New("internal error")
	ErrExternalFailure 		= errors.New("external api failure")
	ErrNotFound				= errors.New("not found")
	ErrBadRequest			= errors.New("invalid parameters")
)

type AppError struct {
    Source 	Source
    Err    	error
	Message	string
}

func (e *AppError) Error() string { return fmt.Sprintf("%v: %s", e.Err, e.Message) }
func (e *AppError) Unwrap() error { return e.Err }

func Wrap(err error, src Source, msg string) *AppError {
    return &AppError{Source: src, Err: err, Message: msg}
}

var sourceUnavailableCodes = map[Source]int{
    SourceMIU:      3,
    SourceRedis:    2,
    SourceSchedule: 1,
	SourceMock:		0,
}

func Send(c *echo.Context, err error, respCode ...int) error {
    var appErr *AppError
    errors.As(err, &appErr)
    src, msg := appErr.Source, appErr.Message

    httpStatus := http.StatusInternalServerError
    code := 1

    switch {
	case errors.Is(err, ErrInvalidCredentials):
		httpStatus = http.StatusUnauthorized
	case errors.Is(err, ErrBadRequest):
		httpStatus = http.StatusBadRequest
    case errors.Is(err, ErrUnavailableAPI):
        httpStatus = http.StatusServiceUnavailable
        code = sourceUnavailableCodes[src]
    case errors.Is(err, ErrNotFound):
        httpStatus = http.StatusNotFound
    case errors.Is(err, ErrInternal):
		httpStatus = http.StatusInternalServerError
    }

    if len(respCode) > 0 && httpStatus != http.StatusServiceUnavailable {
        code = respCode[0]
	}

    slog.Error("request failed",
        slog.String("source", string(src)),
        slog.Int("status", httpStatus),
        slog.Int("code", code),
        slog.String("error", msg),
    )

    return c.JSON(httpStatus, map[string]any{"code": code})
}