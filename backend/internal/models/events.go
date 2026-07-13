package models

var (
	firstDateStream1 = []string{
		"09:00 - 09:30 — Регистрация",
		"09:30 - 10:30 — Поздравительный концерт",
		"10:30 - 12:00 — Welcome-тренинг",
		"12:00 - 12:15 — Совместное фото в атриуме",
	}

	firstDateStream2 = []string{
		"12:30 - 13:00 — Регистрация",
		"13:00 - 14:00 — Поздравительный концерт",
		"14:00 - 15:30 — Welcome-тренинг",
		"15:30 - 15:45 — Совместное фото в атриуме",
	}

	firstDateStream3 = []string{
		"16:00 - 16:30 — Регистрация",
		"16:30 - 17:30 — Поздравительный концерт",
		"17:30 - 19:00 — Welcome-тренинг",
		"19:00 - 19:10 — Совместное фото в атриуме",
	}
)

var FirstDayEventByMajor = map[string][]string{
	Jurisprudence: 				firstDateStream1,
	Advertisement: 				firstDateStream2,
	Linguistics:              	firstDateStream2,
	Economy:                  	firstDateStream2,
	Psychology:               	firstDateStream2,
	ItSystemsAndTechnologies: 	firstDateStream2,
	BusinessIt:               	firstDateStream2,
	Journalism: 				firstDateStream3,
	Management: 				firstDateStream3,
	Philology:  				firstDateStream3,
}