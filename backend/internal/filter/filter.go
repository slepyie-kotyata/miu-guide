package filter

import (
	"miu-guide/internal/models"
	"miu-guide/internal/service"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
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
			LessonNumberStart: first.LessonNumberStart,
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
	
	sort.Slice(result, func(i, j int) bool {
    	return result[i].LessonNumberStart < result[j].LessonNumberStart
	})

	return result
}

var coursePattern = regexp.MustCompile(`(?i)(весна|осень)\s+(\d{4})/(\d{2})`)

func expectedSemesterInfo(t time.Time) (string, int, int) {
	var (
		startYear int
		endYear int
		expectedSeason string
	)
	thisMonth, thisYear := t.Month(), t.Year()

	if thisMonth >= time.September && thisMonth < time.February {
		startYear = thisYear
		expectedSeason = "осень"
	} else {
		startYear = thisYear - 1
		expectedSeason = "весна"
	}

	endYear = startYear + 1
	return expectedSeason, startYear, endYear
}

func IsCurrentSubject(shortname string, currentTime time.Time) bool {
	matches := coursePattern.FindStringSubmatch(shortname)
	if len(matches) < 4 {
		return false
	}

	parsedSeason := matches[1]
	parsedStartYear, _ := strconv.Atoi(matches[2])
	parsedEndYear, _ := strconv.Atoi(matches[3])

	expectedSeason, expStartYear, expEndYear := expectedSemesterInfo(currentTime)

	return parsedSeason == expectedSeason && parsedStartYear == expStartYear && parsedEndYear + 2000 == expEndYear
}

func FilterSubjectsList(subjects []models.Subjects) []string {
	filteredSubjects := make([]string, 0)
	for _, subject := range subjects {
		if IsCurrentSubject(subject.ShortName, service.GetTime()) {
			filteredSubjects = append(filteredSubjects, subject.FullName)
		}
	}
	return filteredSubjects
}