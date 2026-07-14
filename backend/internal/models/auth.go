package models

type AuthRequest struct {
	Login		string	`json:"login"`
	Password	string	`login:"password"`
}

type AuthResponse struct {
	UserId	int		`json:"user_id"`
	Token	string	`json:"token"`
}