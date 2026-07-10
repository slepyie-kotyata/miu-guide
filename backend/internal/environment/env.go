package environment

import "os"

type EnvKey string

const (
	ScheduleBaseApiUrl = "MUI_SCHEDULE_BASE_API_URL"
	ScheduleUsername = "MIU_SCHEDULE_API_USERNAME"
	SchedulePassword = "MIU_SCHEDULE_API_PASSWORD"
)

func GetEnv(key EnvKey) string {
	return os.Getenv(string(key))
}