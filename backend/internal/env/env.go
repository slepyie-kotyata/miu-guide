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
)

func GetEnv(key EnvKey) string {
	return os.Getenv(string(key))
}

func GetEnvAsSlice(key EnvKey) []string {
	valStr := GetEnv(key)
	if valStr == "" {
		return []string{}
	}

	origins := strings.Split(valStr, ",")

	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}
	return origins
}