package env

import "os"

type EnvKey string

const (
	ScheduleBaseApiUrl = "MIU_SCHEDULE_BASE_API_URL"
	ScheduleUsername = "MIU_SCHEDULE_API_USERNAME"
	SchedulePassword = "MIU_SCHEDULE_API_PASSWORD"
	RedisUrl = "REDIS_CONNECTION_URL"
	SqlitePath = "SQLITE_PATH"
)

func GetEnv(key EnvKey) string {
	return os.Getenv(string(key))
}