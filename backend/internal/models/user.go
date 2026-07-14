package models

type UserInfo struct {
	FullName 		string 		`json:"full_name"`
	GroupName 		string 		`json:"group_name"`
	GroupId 		int 		`json:"group_id"`
	Major 			MajorType 	`json:"major"`
	Specialization 	string 		`json:"specialization"`
	Course 			int 		`json:"course"`
	Institution 	string 		`json:"institution"`
}