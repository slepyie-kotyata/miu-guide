package utils

import (
	"log/slog"
	"time"
)

const layout = "2006.01.02"
var mskLoc *time.Location

func init() {
	var err error
	mskLoc, err = time.LoadLocation("Europe/Moscow")
	if err != nil {
		slog.Warn("error loading timezone location, using system time", "err", err.Error())
		mskLoc = time.Local
	}
}

func ValidateDate(date string) bool {
	_, err := time.Parse(layout, date)
	return err == nil
}

func GetTime() time.Time {
	return time.Now().In(mskLoc)
}

func GetDate() string {
	return GetTime().Format(layout)
}
