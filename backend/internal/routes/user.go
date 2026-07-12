package routes

import (
	"miu-guide/internal/handlers"
	"time"
	"unicode"

	"github.com/labstack/echo/v5"
)

func determineCourse(groupName string, now time.Time) int {
	var enrollDigit int
	for _, char := range groupName {
		if unicode.IsDigit(char) {
			enrollDigit = int(char - '0')
			break
		}
	}

	academicYearEnd := now.Year()
	// если сейчас 1 семестр, то этот учебный год закончится в следующем календарном
	if now.Month() >= time.September {
		academicYearEnd++
	}

	return (academicYearEnd%10 - enrollDigit + 10) % 10
}

func InitUserRoutes(auth *echo.Group, uh *handlers.UserHandler)