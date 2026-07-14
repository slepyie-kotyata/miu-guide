package connection

import (
	"context"
	"errors"
	"fmt"
	"miu-guide/internal/apperror"
	"miu-guide/internal/env"
	"time"

	"github.com/redis/go-redis/v9"
)

func GetRedisConnection() (*redis.Client, error) {
	redisURL := env.GetEnv(env.RedisUrl)
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, apperror.Wrap(fmt.Errorf("error parsing Redis URL (%s)", redisURL), apperror.SourceInit, err.Error())
	}

	client := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 2 * time.Second)
	defer cancel()
	
	if err := client.Ping(ctx).Err(); err != nil {
		return client, apperror.Wrap(errors.New("failed to connect to Redis"), apperror.SourceInit, err.Error())
	}

	return client, nil
}