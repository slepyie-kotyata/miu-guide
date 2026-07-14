import {WeekDay} from '../models/schedule.model';

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function formatDateStr(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

export function generateWeekDays(baseDate: Date): WeekDay[] {
  const dateCopy = new Date(baseDate.getTime());
  const day = dateCopy.getDay();
  const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(dateCopy.setDate(diff));

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday.getTime());
    nextDay.setDate(monday.getDate() + i);
    days.push({name: DAY_NAMES[i], date: nextDay});
  }
  return days;
}

export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getMondayFromWeek(days: WeekDay[]): Date | null {
  return days.length > 0 ? days[0].date : null;
}

export function getSundayFromWeek(days: WeekDay[]): Date | null {
  return days.length > 0 ? days[6].date : null;
}
