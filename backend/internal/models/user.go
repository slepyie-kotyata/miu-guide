package models

//TODO: получение FullName есть
//TODO: получение GroupName есть
//TODO: получение GroupId есть
//TODO: получение Major есть
//TODO: получение Specialization есть
//TODO: получение Course есть
//TODO: получение Institution есть
type UserInfo struct {
	FullName 		string 		`json:"full_name"`
	GroupName 		string 		`json:"group_name"`
	GroupId 		int 		`json:"group_id"`
	Major 			MajorType 	`json:"major"` 			//направление
	Specialization 	string 		`json:"specialization"` // профиль
	Course 			int 		`json:"course"`
	Institution 	string 		`json:"institution"` 	//формат учебы (очный/заочный и т.п.)
}