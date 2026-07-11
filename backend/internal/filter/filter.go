package filter

import (
	"miu-guide/internal/models"
	"strings"
)

type GroupKey struct {
	DisciplineOid     int
	LessonNumberStart int
	BeginLesson       string
}

func FilterSchedule(rawLessons []models.RawSchedule) []models.Schedule {
	if len(rawLessons) == 0 {
		return []models.Schedule{}
	}
	
	groupedLessons := make(map[GroupKey][]models.RawSchedule)

	for _, lesson := range rawLessons {
		key := GroupKey{
			DisciplineOid:     lesson.DisciplineOid,
			LessonNumberStart: lesson.LessonNumberStart,
			BeginLesson:       lesson.BeginLesson,
		}
		groupedLessons[key] = append(groupedLessons[key], lesson)
	}

	var result []models.Schedule

	for _, lessonsGroup := range groupedLessons {
		first := lessonsGroup[0]
		
		schedule := models.Schedule {
			BeginLesson: first.BeginLesson,
			Date: first.Date,
	   		DayOfWeekString: first.DayOfWeekString,
			Discipline: first.Discipline,
			EndLesson: first.EndLesson,
			KindOfWork: first.KindOfWork,
		}

		auditoriumMap := make(map[string][]string)

		for _, lesson := range lessonsGroup {
			for _, lect := range lesson.ListOfLecturers {
				auditoriumMap[lesson.Auditorium] = append(auditoriumMap[lesson.Auditorium], lect.Lecturer)
			}
		}

		for aud, lecturers := range auditoriumMap {
			schedule.ListOfLecturers = append(schedule.ListOfLecturers, models.LecturerInfo{
				Auditorium: aud,
				Lecturer:   strings.Join(lecturers, ", "),
			})
		}
		result = append(result, schedule)
	}
	return result
}