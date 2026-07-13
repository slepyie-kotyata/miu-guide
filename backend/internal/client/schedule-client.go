package client

import (
	"encoding/json"
	"fmt"
	"io"
	"miu-guide/internal/env"
	"miu-guide/internal/models"
	"net/http"
	"time"
)

type ScheduleAPIClient struct {
	httpClient 	*http.Client
    BaseURL    	string
	APILogin	string
	APIPassword	string
}

type GroupId struct {
	GroupId int `json:"id"`
}

func NewScheduleAPIClient() *ScheduleAPIClient {
	return &ScheduleAPIClient{
		httpClient: &http.Client{
			Timeout: 3 * time.Second,
		},
		BaseURL: env.GetEnv(env.ScheduleBaseApiUrl),
		APILogin: env.GetEnv(env.ScheduleUsername),
		APIPassword: env.GetEnv(env.SchedulePassword),
	}
}

// разобраться с категоризацией и принятием ошибок ОБОИХ структур хэндлеров
func (s *ScheduleAPIClient) doScheduleRequest(queryUrl string, target any) error {
	apiReq, _ := http.NewRequest("GET", s.BaseURL + queryUrl, nil)
	apiReq.SetBasicAuth(s.APILogin, s.APIPassword)

	apiResp, err := s.httpClient.Do(apiReq)
	if err != nil {
		return ErrUnavaliableAPI
	}
	defer apiResp.Body.Close()

	respBody, err := io.ReadAll(apiResp.Body)
	if err != nil {
		return ErrInternal
	}

	if err := json.Unmarshal(respBody, target); err != nil {
        return ErrInternal
    }
    return nil
}

func (s *ScheduleAPIClient) FetchScheduleResponse(groupId string, scheduleDay string) ([]models.RawSchedule, error) {
	var rawSchedule []models.RawSchedule
	if err := s.doScheduleRequest(fmt.Sprintf("/schedule/group/%s?start=%s&finish=%s&lng=1", groupId, scheduleDay, scheduleDay), &rawSchedule); err != nil {
		return nil, err
	}
	return rawSchedule, nil
}

func (s *ScheduleAPIClient) GetGroupId(groupName string) (int, error) {
	var groupId []GroupId
	if err := s.doScheduleRequest(fmt.Sprintf("/search?term=%s&type=group", groupName), &groupId); err != nil {
		return 0, err
	}
	
	if len(groupId) == 0 {
		return 0, ErrNotFound
	} else {
		return groupId[0].GroupId, nil
	}
}

func (s *ScheduleAPIClient) GetLecturers(lastName string) ([]models.Lecturer, error) {
	var lecturer []models.Lecturer
	if err := s.doScheduleRequest(fmt.Sprintf("/search?term=%s&type=lecturer", lastName), &lecturer); err != nil {
		return nil, err
	}

	if len(lecturer) == 0 {
		return nil, ErrNotFound
	}
	return lecturer, nil
}