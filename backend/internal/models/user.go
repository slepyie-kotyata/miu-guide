package models

type UserInfo struct {
	FullName 		string 	`json:"full_name"`
	GroupName 		string 	`json:"group_name"`
	GroupId 		int 	`json:"group_id"`
	Major 			string 	`json:"major"` 			//направление
	Specialization 	string 	`json:"specialization"` // профиль
	Course 			int 	`json:"course"`
	Institution 	string 	`json:"institution"` 	//формат учебы (очный/заочный и т.п.)
}