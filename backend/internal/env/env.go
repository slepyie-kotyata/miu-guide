package env

import (
	"os"
	"strings"
)

type EnvKey string

const (
	ScheduleBaseApiUrl = "MIU_SCHEDULE_BASE_API_URL"
	ScheduleUsername = "MIU_SCHEDULE_API_USERNAME"
	SchedulePassword = "MIU_SCHEDULE_API_PASSWORD"
	MIUApiLoginUrl = "MIU_API_LOGIN_URL"
	MIUApiAccountUrl = "MIU_API_ACCOUNT_URL"
	RedisUrl = "REDIS_CONNECTION_URL"
	AllowOrigins = "ALLOW_ORIGINS"
	LogLevel = "LOG_LEVEL"
)

func GetEnv(key EnvKey) string {
	return os.Getenv(string(key))
}

func GetEnvAsSlice(key EnvKey) []string {
	valuesStr := GetEnv(key)
	if valuesStr == "" {
		return []string{}
	}

	values := strings.Split(valuesStr, ",")

	for i := range values {
		values[i] = strings.TrimSpace(values[i])
	}
	return values
}