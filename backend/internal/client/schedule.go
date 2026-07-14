package client

import (
	"encoding/json"
	"fmt"
	"io"
	"miu-guide/internal/apperror"
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

func (s *ScheduleAPIClient) doScheduleRequest(queryUrl string, target any) error {
	apiReq, _ := http.NewRequest("GET", s.BaseURL + queryUrl, nil)
	apiReq.SetBasicAuth(s.APILogin, s.APIPassword)

	apiResp, err := s.httpClient.Do(apiReq)
	if err != nil {
		return apperror.Wrap(apperror.ErrUnavailableAPI, apperror.SourceSchedule, err.Error())
	}
	defer apiResp.Body.Close()

	respBody, err := io.ReadAll(apiResp.Body)
	if err != nil {
		return apperror.Wrap(apperror.ErrInternal, apperror.SourceSchedule, err.Error())
	}

	if err := json.Unmarshal(respBody, target); err != nil {
		return apperror.Wrap(apperror.ErrInternal, apperror.SourceSchedule, err.Error())
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
		return 0, apperror.Wrap(
			apperror.ErrNotFound, 
			apperror.SourceSchedule, 
			fmt.Sprintf("couldn't find group %s id", groupName),
		)
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
		return nil, apperror.Wrap(
			apperror.ErrNotFound, 
			apperror.SourceSchedule, 
			fmt.Sprintf("couldn't find lecturer %s info", lastName),
		)
	}
	return lecturer, nil
}