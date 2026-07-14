package client

import (
	"encoding/json"
	"fmt"
	"miu-guide/internal/apperror"
	"miu-guide/internal/env"
	"miu-guide/internal/models"
	"net/url"
	"strconv"
	"time"
	"github.com/imroc/req/v3"
)

type MIUClient struct {
	httpClient 			*req.Client
	MIUApiLoginUrl		string
	MIUApiAccountUrl	string
}

func NewMIUClient() *MIUClient {
	client := req.C().
		SetTimeout(3 * time.Second).
		SetTLSFingerprintChrome().
		SetCommonHeaders(map[string]string{
			"User-Agent":   "MoodleMobile",
			"Content-Type": "application/x-www-form-urlencoded",
		})
	return &MIUClient{
		httpClient:       client,
		MIUApiLoginUrl:   env.GetEnv(env.MIUApiLoginUrl),
		MIUApiAccountUrl: env.GetEnv(env.MIUApiAccountUrl),
	}
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
	if errorMessage.Errorcode == InvalidTokenCode || errorMessage.Errorcode == InvalidLoginCode {
		return apperror.Wrap(apperror.ErrInvalidCredentials, apperror.SourceMIU, errorMessage.Message)
	}
	return apperror.Wrap(apperror.ErrExternalFailure, apperror.SourceMIU, errorMessage.Message)
}

func (m *MIUClient) doAccountRequest(baseUrl string, data url.Values, target any) error {
	data.Set("service", "moodle_mobile_app")
	data.Set("moodlewsrestformat", "json")

	resp, err := m.httpClient.R().
		SetBodyString(data.Encode()).
		Post(baseUrl)

	if err != nil {
		return apperror.Wrap(apperror.ErrUnavailableAPI, apperror.SourceMIU, err.Error())
	}

	respBody := resp.Bytes()
	
	var errorMessage MIUApiErrorResponse
	if err := json.Unmarshal(respBody, &errorMessage); err == nil && errorMessage.Errorcode != "" {
		return parseErrorMessage(errorMessage)
	}

	if err := json.Unmarshal(respBody, target); err != nil {
		return apperror.Wrap(apperror.ErrInternal, apperror.SourceMIU, err.Error())
	}
	return nil
}

func (m *MIUClient) GetToken(authReq models.AuthRequest) (string, error) {
	data := url.Values{}
	data.Set("username", authReq.Login)
	data.Set("password", authReq.Password)

	var token struct{Token string}
	if err := m.doAccountRequest(m.MIUApiLoginUrl, data, &token); err != nil {
		return "", err
	}

	return token.Token, nil
}

func (m *MIUClient) GetUserId(token string) (int, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_webservice_get_site_info")

	var id struct{ UserId int }
	if err := m.doAccountRequest(m.MIUApiAccountUrl, data, &id); err != nil {
		return 0, err
	}
	return id.UserId, nil
}

type UserInfoResponse struct {
	FullName 	string `json:"fullname"`
	Department 	string `json:"department"`
	Institution string `json:"institution"`
}

func (m *MIUClient) GetUserInfo(token string, userId int) (*UserInfoResponse, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_user_get_users_by_field")
	data.Set("field", "id")
	data.Set("values[0]", strconv.Itoa(userId))

	var userInfo []UserInfoResponse
	if err := m.doAccountRequest(m.MIUApiAccountUrl, data, &userInfo); err != nil {
		return nil, err
	}

	if len(userInfo) == 0 {
		return nil, apperror.Wrap(
			apperror.ErrNotFound, 
			apperror.SourceMIU, 
			fmt.Sprintf("couldn't find any info about user %d", userId),
		)
	}

	return &userInfo[0], nil
}

func (m *MIUClient) GetSubjectsList(token string, userId int) ([]models.Subjects, error) {
	data := url.Values{}
	data.Set("wstoken", token)
	data.Set("wsfunction", "core_enrol_get_users_courses")
	data.Set("userid", strconv.Itoa(userId))

	var subjectsList []models.Subjects
	if err := m.doAccountRequest(m.MIUApiAccountUrl, data, &subjectsList); err != nil {
		return nil, err
	}

	if len(subjectsList) == 0 {
		return nil, apperror.Wrap(
			apperror.ErrNotFound, 
			apperror.SourceMIU, 
			fmt.Sprintf("couldn't find any user's %d subjects", userId),
		)
	}

	return subjectsList, nil
}