package client

import (
	"encoding/json"
	"fmt"
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

type TokenResponse struct {
	Token 		string `json:"token"`
	ErrorCode 	string `json:"errorcode,omitempty"`
}

type UserIdResponse struct {
	UserId 		int 	`json:"userid"`
	ErrorCode 	string `json:"errorcode,omitempty"`
}

type UserInfoResponse struct {
	FullName 	string `json:"fullname"`
	Department 	string `json:"department"`
	Institution string `json:"institution"`
	ErrorCode 	string `json:"errorcode,omitempty"`
}

const InvalidTokenCode = "invalidtoken"
const InvalidLoginCode = "invalidlogin"

func (m *MIUClient) GetToken(authReq models.AuthRequest) (string, error) {
	data := url.Values{}
	data.Set("username", authReq.Login)
	data.Set("password", authReq.Password)
	data.Set("service", "moodle_mobile_app")

	apiReq, _ := http.NewRequest(http.MethodPost, m.MIUApiLoginUrl, strings.NewReader(data.Encode()))
	apiReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	apiResp, err := m.httpClient.Do(apiReq)
	if err != nil {
		return "", fmt.Errorf("(MIU-Main-API) %w: %v", ErrUnavaliableAPI, err)
	}
	defer apiResp.Body.Close()

	var result TokenResponse
	if err := json.NewDecoder(apiResp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("(MIU-Main-API) %w: %v", ErrInternal, err)
	}

	if result.ErrorCode == InvalidLoginCode {
		return "", fmt.Errorf("(MIU-Main-API) %w: %v", ErrInvalidLogin, result.ErrorCode)
	}

	return result.Token, nil
}

func (m *MIUClient) GetUserId(token string) (int, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_webservice_get_site_info")
	data.Set("moodlewsrestformat", "json")

	apiReq, _ := http.NewRequest(http.MethodPost, m.MIUApiAccountUrl, strings.NewReader(data.Encode()))
	apiReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	apiResp, err := m.httpClient.Do(apiReq)
	if err != nil {
		return 0, fmt.Errorf("(MIU-Main-API) %w: %v", ErrUnavaliableAPI, err)
	}
	defer apiResp.Body.Close()

	var result UserIdResponse
	if err := json.NewDecoder(apiResp.Body).Decode(&result); err != nil {
		return 0, fmt.Errorf("(MIU-Main-API) %w: %v", ErrInternal, err)
	}

	if result.ErrorCode == InvalidTokenCode {
		return 0, fmt.Errorf("(MIU-Main-API) %w: %v", ErrInvalidToken, result.ErrorCode)
	}

	return result.UserId, nil
}

func (m *MIUClient) GetUserInfo(token string, userId int) (*UserInfoResponse, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_user_get_users_by_field")
	data.Set("moodlewsrestformat", "json")
	data.Set("field", "id")
	data.Set("values[0]", strconv.Itoa(userId))

	apiReq, _ := http.NewRequest(http.MethodPost, m.MIUApiAccountUrl, strings.NewReader(data.Encode()))
	apiReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	apiResp, err := m.httpClient.Do(apiReq)
	if err != nil {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrUnavaliableAPI, err)
	}
	defer apiResp.Body.Close()

	var result []UserInfoResponse
	if err := json.NewDecoder(apiResp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrInvalidToken, "this token is invalid")
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrNotFound, fmt.Sprintf("couldn't find any info about user %d", userId))
	}

	return &result[0], nil
}

func (m *MIUClient) GetSubjectsList(token string, userId int) ([]models.Subjects, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_enrol_get_users_courses")
	data.Set("moodlewsrestformat", "json")
	data.Set("userid", strconv.Itoa(userId))

	apiReq, _ := http.NewRequest(http.MethodPost, m.MIUApiAccountUrl, strings.NewReader(data.Encode()))
	apiReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	apiResp, err := m.httpClient.Do(apiReq)
	if err != nil {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrUnavaliableAPI, err)
	}
	defer apiResp.Body.Close()

	var result []models.Subjects
	if err := json.NewDecoder(apiResp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrInvalidToken, "this token is invalid")
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("(MIU-Main-API) %w: %v", ErrNotFound, fmt.Sprintf("couldn't find any user's %d subjects", userId))
	}

	return result, nil
}