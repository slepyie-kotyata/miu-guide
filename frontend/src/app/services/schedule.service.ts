import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/schedule.model'; // Твой путь к интерфейсу

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  // Базовый URL API (пока поставим заглушку, ее нужно будет заменить на реальный адрес)
private apiUrl = 'https://miu-api.enjine.ru';


  constructor(private http: HttpClient) {}

getDaySchedule(groupId: number, date: string): Observable<Lesson[]> {
      return this.http.get<Lesson[]>(`${this.apiUrl}/schedule/${groupId}`, {
    params: {
      day: date
    }
  });
}
}