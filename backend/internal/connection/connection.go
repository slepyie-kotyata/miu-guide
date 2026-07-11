package connection

import (
	"fmt"
	"miu-guide/internal/env"

	"github.com/redis/go-redis/v9"
)

func GetRedisConnection() (*redis.Client, error) {
	opt, err := redis.ParseURL(env.GetEnv(env.RedisUrl))
	if err != nil {
		return nil, fmt.Errorf("error parsing URL Redis: %w", err)
	}

	return redis.NewClient(opt), nil
}