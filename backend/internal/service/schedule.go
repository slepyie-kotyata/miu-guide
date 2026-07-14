package service

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"miu-guide/internal/apperror"
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

func (s *ScheduleService) GetScheduleTest(ctx context.Context, groupId, scheduleDay string) ([]models.Schedule, error) {
	key := groupId + ":" + scheduleDay

	rawSchedule, apiErr := s.apiClient.FetchScheduleResponse(groupId, scheduleDay)
	
	if apiErr == nil {
		schedule := filter.FilterSchedule(rawSchedule)
		scheduleBytes, _ := json.Marshal(schedule)

		go func(data []byte) {
			cacheCtx, cacheCancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
			defer cacheCancel()

			if err := s.redisClient.Set(cacheCtx, key, data, 24*time.Hour).Err(); err != nil {
				slog.Warn(
					"error saving cache",
					slog.String("source", string(apperror.SourceRedis)),
					slog.String("error", err.Error()),
				)
			}
		}(scheduleBytes)
		return schedule, nil
	}

	slog.Warn(
		"api failed, falling back to redis",
		slog.String("error", apiErr.Error()),
	)

	thisSchedule, redisErr := s.redisClient.Get(ctx, key).Result()
	
	if redisErr != nil {
		if errors.Is(redisErr, redis.Nil) {
			return nil, apperror.Wrap(
				apperror.ErrUnavailableAPI, 
				apperror.SourceSchedule, 
				"api is unresponsive, no saved cashe",
			)
		}
		return nil, apperror.Wrap(
			apperror.ErrUnavailableAPI, 
			apperror.SourceRedis, 
			redisErr.Error(),
		)
	}

	var schedule []models.Schedule
	if err := json.Unmarshal([]byte(thisSchedule), &schedule); err != nil {
		return nil, apperror.Wrap(
			apperror.ErrInternal, 
			apperror.SourceRedis, 
			err.Error(),
		)
	}
	return schedule, nil
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
		slog.Warn(
			"error fetching cache",
        	slog.String("source", string(apperror.SourceRedis)),
        	slog.String("error", err.Error()),
    	)
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
			slog.Warn(
				"error saving cache",
        		slog.String("source", string(apperror.SourceRedis)),
        		slog.String("error", err.Error()),
    		)
    	}
	}(scheduleBytes)

    return schedule, nil
}