package connection

import (
	"fmt"
	"miu-guide/internal/env"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func GetRedisConnection() (*redis.Client, error) {
	opt, err := redis.ParseURL(env.GetEnv(env.RedisUrl))
	if err != nil {
		return nil, fmt.Errorf("error parsing URL Redis: %w", err)
	}

	return redis.NewClient(opt), nil
}

func GetSqliteConnection() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(env.GetEnv(env.SqlitePath)), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect sqlite: %w", err)
	}
	
	return db, nil
}