import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/schedule.model'; // Твой путь к интерфейсу

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  // Базовый URL API (пока поставим заглушку, ее нужно будет заменить на реальный адрес)
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  // Ручка GET /schedule/today?group=XXX
  getTodaySchedule(groupId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/schedule/today?group=${groupId}`);
  }

  // Ручка GET /schedule/day?group=XXX&day=XXX
getDaySchedule(groupId: string, date: string): Observable<Lesson[]> {
      return this.http.get<Lesson[]>(`${this.apiUrl}/schedule/day`, {
    params: {
      group: groupId,
      day: date
    }
  });
}
}