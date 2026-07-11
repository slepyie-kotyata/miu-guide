package env

import "os"

type EnvKey string

const (
	ScheduleBaseApiUrl = "MIU_SCHEDULE_BASE_API_URL"
	ScheduleUsername = "MIU_SCHEDULE_API_USERNAME"
	SchedulePassword = "MIU_SCHEDULE_API_PASSWORD"
	MIUApiLoginUrl = "MIU_API_LOGIN_URL"
	MIUApiAccountUrl = "MIU_API_ACCOUNT_URL"
	RedisUrl = "REDIS_CONNECTION_URL"
)

func GetEnv(key EnvKey) string {
	return os.Getenv(string(key))
}