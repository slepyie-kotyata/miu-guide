package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"miu-guide/internal/client"
	"miu-guide/internal/filter"
	"miu-guide/internal/models"
	"time"

	"github.com/redis/go-redis/v9"
)

type ScheduleService struct {
    apiClient   *client.ScheduleAPIClient
    redisClient *redis.Client
}

func NewScheduleService(ac *client.ScheduleAPIClient, rc *redis.Client) *ScheduleService {
	return &ScheduleService{
		apiClient: ac,
		redisClient: rc,
	}
}

func (s *ScheduleService) GetSchedule(ctx context.Context, groupId, scheduleDay string) ([]models.Schedule, error) {
	key := groupId + ":" + scheduleDay
	thisSchedule, err := s.redisClient.Get(ctx, key).Result()
	if err == nil {
		var schedule []models.Schedule
		_ = json.Unmarshal([]byte(thisSchedule), &schedule)
        return schedule, nil
    }

	if !errors.Is(err, redis.Nil) {
        if errors.Is(err, context.DeadlineExceeded) {
            return nil, client.ErrUnavailableAPI
        }
        return nil, client.ErrInternal
    }

	rawSchedule, err := s.apiClient.FetchScheduleResponse(groupId, scheduleDay)
	if err != nil {
		return nil, err
	}

	schedule := filter.FilterSchedule(rawSchedule)

	scheduleBytes, _ := json.Marshal(schedule)

	go func(data []byte) {
    	cacheCtx, cacheCancel := context.WithTimeout(context.Background(), 500 * time.Millisecond)
    	defer cacheCancel()
    
    	if err := s.redisClient.Set(cacheCtx, key, data, 24 * time.Hour).Err(); err != nil {
        	log.Printf("error saving cache: %s\n", err.Error())
    	}
	}(scheduleBytes)

    return schedule, nil
}