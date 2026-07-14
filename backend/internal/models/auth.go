package models

type AuthRequest struct {
	Login		string	`json:"login"`
	Password	string	`json:"password"`
}

type AuthResponse struct {
	UserId	int		`json:"user_id"`
	Token	string	`json:"token"`
}