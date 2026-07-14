package models

import "sort"

var Majors []string

func init() {
	seen := make(map[string]struct{})

	for _, info := range MajorCodes {
		if _, ok := seen[string(info.Major)]; !ok {
			seen[string(info.Major)] = struct{}{}
			Majors = append(Majors, string(info.Major))
		}
	}
	sort.Strings(Majors)
}

type FieldInfo struct {
	Major			MajorType
	Specialization 	string
}

type MajorType string
const (
	ItSystemsAndTechnologies 	= "09.03.02 Информационные системы и технологии"
	Psychology 					= "37.03.01 Психология"
	Economy 					= "38.03.01 Экономика"
	Management 					= "38.03.02 Менеджмент"
	BusinessIt 					= "38.03.05 Бизнес-информатика"
	Jurisprudence 				= "40.03.01 Юриспруденция"
	Advertisement 				= "42.03.01 Реклама и связи с общественностью"
	Journalism 					= "42.03.02 Журналистика"
	TeacherEducation 			= "44.03.01 Педагогическое образование"
	Philology 					= "45.03.01 Филология"
	Linguistics 				= "45.03.02 Лингвистика"
	History 					= "46.03.01 История"
	Design 						= "54.03.01 Дизайн"
)

//может быть вынести это в sqlite

var MajorCodes = map[string]FieldInfo {
	"ИПС": {Major: ItSystemsAndTechnologies, Specialization: "Проектирование, разработка и сопровождение информационных систем"},
	"ППК": {Major: Psychology, Specialization: "Психологическое консультирование"},
	"ЭФЦ": {Major: Economy, Specialization: "Финансы в цифровой экономике"},
	"ЭЭП": {Major: Economy, Specialization: "Экономика предприятий и организаций"},
	"ММО": {Major: Management, Specialization: "Менеджмент организации"},
	"МПУ": {Major: Management, Specialization: "Предпринимательство и управление бизнесом"},
	"БИС": {Major: BusinessIt, Specialization: "Информационные системы и технологии в управлении бизнесом"},
	"ЮГП": {Major: Jurisprudence, Specialization: "Гражданско-правовая"},
	"ЮУП": {Major: Jurisprudence, Specialization: "Уголовно-правовая"},
	"РРК": {Major: Advertisement, Specialization: "Рекламные и маркетинговые коммуникации, PR"},
	"ЖСК": {Major: Journalism, Specialization: "Журналистика средств массовой коммуникации"},
	"ПНО": {Major: TeacherEducation, Specialization: "Начальное образование"},
	"ФМЛ": {Major: Philology, Specialization: "Мировая литература, творческое письмо и современная риторика"},
	"ЛПП": {Major: Linguistics, Specialization: "Перевод и переводоведение"},
	"ЛТМ": {Major: Linguistics, Specialization: "Теория и методика преподавания иностранных языков и культур"},
	"ИСК": {Major: History, Specialization: "Социокультурная история"},
	"ДЦД": {Major: Design, Specialization: "Цифровой дизайн"},
}