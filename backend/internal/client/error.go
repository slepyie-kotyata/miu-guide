package client

import "errors"

var (
	ErrInvalidLogin		= errors.New("invalid login or password")
	ErrInvalidToken		= errors.New("invalid moodle token")
	ErrUnavaliableAPI	= errors.New("unavaliable api error")
	ErrInternal			= errors.New("internal error")
	ErrExternalFailure	= errors.New("failure in api error")
)