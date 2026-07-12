package client

import (
	"encoding/json"
	"fmt"
	"miu-guide/internal/env"
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

func (s *ScheduleAPIClient) FetchScheduleResponse(groupId string, scheduleDay string) (*http.Response, error) {
	apiReq, _ := http.NewRequest("GET", s.BaseURL + fmt.Sprintf(
		"/schedule/group/%s?start=%s&finish=%s&lng=1", 
		groupId, 
		scheduleDay, 
		scheduleDay), nil)

	apiReq.SetBasicAuth(s.APILogin, s.APIPassword)

	return s.httpClient.Do(apiReq)
}

func (s *ScheduleAPIClient) GetGroupId(groupName string) (int, error) {
	apiReq, _ := http.NewRequest("GET", s.BaseURL + fmt.Sprintf("/search?term=%s&type=group", groupName), nil)
	apiReq.SetBasicAuth(s.APILogin, s.APIPassword)

	apiResp, err := s.httpClient.Do(apiReq)
	if err != nil {
		return 0, ErrUnavaliableAPI
	}
	defer apiResp.Body.Close()

	var result []GroupId
	_ = json.NewDecoder(apiResp.Body).Decode(&result)

	return result[0].GroupId, nil
}