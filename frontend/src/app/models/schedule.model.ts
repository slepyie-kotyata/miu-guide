export interface Lesson {
  beginLesson: string;
  date: string;
  dayOfWeekString: string;
  discipline: string;
  endLesson: string;
  kindOfWork: string;
  lessonNumberStart: number;
  listOfLecturers: Lecturer[];
}

export interface Lecturer {
  lecturer: string;
  auditorium: string;
}

export interface WeekDay {
  name: string;
  date: Date;
}
