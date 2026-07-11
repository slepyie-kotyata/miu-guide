package models

type RawLecturerInfo struct {
	Lecturer string `json:"lecturer"`
}

type RawSchedule struct {
	Auditorium        	string        		`json:"auditorium"`
	BeginLesson       	string        		`json:"beginLesson"`
	Date			  	string				`json:"date"`
	DayOfWeekString		string				`json:"dayOfWeekString"`
	Discipline        	string        		`json:"discipline"`
	EndLesson         	string        		`json:"endLesson"`
	KindOfWork        	string       		`json:"kindOfWork"`
	ListOfLecturers   	[]RawLecturerInfo 	`json:"listOfLecturers"` 
	DisciplineOid     	int           		`json:"disciplineOid"` // для фильтрации
	LessonNumberStart 	int           		`json:"lessonNumberStart"` // для фильтрации
}

type Schedule struct {
	BeginLesson       	string        	`json:"beginLesson"`
	Date			  	string			`json:"date"`
	DayOfWeekString		string			`json:"dayOfWeekString"`
	Discipline        	string        	`json:"discipline"`
	EndLesson         	string        	`json:"endLesson"`
	KindOfWork        	string       	`json:"kindOfWork"`
	ListOfLecturers 	[]LecturerInfo 	`json:"listOfLecturers"`
	LessonNumberStart 	int           	`json:"lessonNumberStart"`
}

type LecturerInfo struct {
	Lecturer   string `json:"lecturer"`
	Auditorium string `json:"auditorium"`
}