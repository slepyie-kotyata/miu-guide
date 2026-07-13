package client

import (
	"encoding/json"
	"fmt"
	"io"
	"miu-guide/internal/env"
	"miu-guide/internal/models"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type MIUClient struct {
	httpClient 			*http.Client
	MIUApiLoginUrl		string
	MIUApiAccountUrl	string
}

func NewMIUClient() *MIUClient {
	return &MIUClient{
		httpClient: &http.Client{
			Timeout: 3 * time.Second,
		},
		MIUApiLoginUrl: env.GetEnv(env.MIUApiLoginUrl),
		MIUApiAccountUrl: env.GetEnv(env.MIUApiAccountUrl),
	}
}

type UserInfoResponse struct {
	FullName 	string `json:"fullname"`
	Department 	string `json:"department"`
	Institution string `json:"institution"`
	ErrorCode 	string `json:"errorcode,omitempty"`
}

const (
	InvalidTokenCode = "invalidtoken"
	InvalidLoginCode = "invalidlogin"
)

type MIUApiErrorResponse struct {
	Exception 	string 	`json:"exception"`
    Errorcode 	string	`json:"errorcode"`
    Message 	string	`json:"message"`
}

func parseErrorMessage(errorMessage MIUApiErrorResponse) error {
	switch(errorMessage.Errorcode){
	case InvalidTokenCode:
		return fmt.Errorf("(MIU-Main-API) %w: %v", ErrInvalidToken, errorMessage.Message)
	case InvalidLoginCode:
		return fmt.Errorf("(MIU-Main-API) %w: %v", ErrInvalidLogin, errorMessage.Message)
	default:
		return fmt.Errorf("(MIU-Main-API) %w: %v", ErrExternalFailure, errorMessage.Message)
	}
}

func (m *MIUClient) doAccountRequest(data url.Values, target any) error {
	apiReq, _ := http.NewRequest(http.MethodPost, m.MIUApiLoginUrl, strings.NewReader(data.Encode()))
	apiReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	apiResp, err := m.httpClient.Do(apiReq)

	if err != nil {
		return fmt.Errorf("(MIU-Main-API) %w: %v", ErrUnavaliableAPI, err)
	}
	defer apiResp.Body.Close()

	respBody, err := io.ReadAll(apiResp.Body)
    if err != nil {
        return fmt.Errorf("(MIU-Main-API) failed to read body %w: %v", ErrInternal, err)
    }

	var errorMessage MIUApiErrorResponse
    if err := json.Unmarshal(respBody, &errorMessage); err == nil && errorMessage.Errorcode != "" {
        return parseErrorMessage(errorMessage)
    }

    if err := json.Unmarshal(respBody, target); err != nil {
        return fmt.Errorf("(MIU-Main-API) %w: %v", ErrInternal, err)
    }
    return nil
}

func (m *MIUClient) GetToken(authReq models.AuthRequest) (string, error) {
	data := url.Values{}
	data.Set("username", authReq.Login)
	data.Set("password", authReq.Password)
	data.Set("service", "moodle_mobile_app")

	var token struct{Token string}
	if err := m.doAccountRequest(data, &token); err != nil {
		return "", err
	}

	return token.Token, nil
}

func (m *MIUClient) GetUserId(token string) (int, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_webservice_get_site_info")
	data.Set("moodlewsrestformat", "json")

	var id struct{ UserId int }
	if err := m.doAccountRequest(data, &id); err != nil {
		return 0, err
	}
	return id.UserId, nil
}

func (m *MIUClient) GetUserInfo(token string, userId int) (*UserInfoResponse, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_user_get_users_by_field")
	data.Set("moodlewsrestformat", "json")
	data.Set("field", "id")
	data.Set("values[0]", strconv.Itoa(userId))

	var userInfo []UserInfoResponse
	if err := m.doAccountRequest(data, &userInfo); err != nil {
		return nil, err
	}

	if len(userInfo) == 0 {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrNotFound, fmt.Sprintf("couldn't find any info about user %d", userId))
	}

	return &userInfo[0], nil
}

func (m *MIUClient) GetSubjectsList(token string, userId int) ([]models.Subjects, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_enrol_get_users_courses")
	data.Set("moodlewsrestformat", "json")
	data.Set("userid", strconv.Itoa(userId))

	var subjectsList []models.Subjects
	if err := m.doAccountRequest(data, &subjectsList); err != nil {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrInvalidToken, "this token is invalid")
	}

	if len(subjectsList) == 0 {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrNotFound, fmt.Sprintf("couldn't find any user's %d subjects", userId))
	}

	return subjectsList, nil
}