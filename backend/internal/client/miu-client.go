package client

import (
	"encoding/json"
	"errors"
	"miu-guide/internal/env"
	"miu-guide/internal/models"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type MIUClient struct {
	httpClient 			*http.Client
	MIUApiLoginUrl		string
	MIUApiAccountUrl	string
}

var (
	ErrInvalidLogin		= errors.New("invalid login or password")
	ErrInvalidToken		= errors.New("invalid moodle token")
	ErrUnavaliableAPI	= errors.New("unavaliable api error")
	ErrInternal			= errors.New("internal error")
	ErrExternalFailure	= errors.New("failure in api error")
)

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
		return "", ErrUnavaliableAPI
	}
	defer apiResp.Body.Close()

	var result TokenResponse
	if err := json.NewDecoder(apiResp.Body).Decode(&result); err != nil {
		return "", ErrInternal
	}

	if result.ErrorCode == InvalidLoginCode {
		return "", ErrInvalidLogin
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
		return 0, ErrUnavaliableAPI
	}
	defer apiResp.Body.Close()

	var result UserIdResponse
	if err := json.NewDecoder(apiResp.Body).Decode(&result); err != nil {
		return 0, ErrInternal
	}

	if result.ErrorCode == InvalidTokenCode {
		return 0, ErrExternalFailure
	}

	return result.UserId, nil
}