import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Lesson} from '../models/schedule.model';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getDaySchedule(groupId: number, date: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/schedule/${groupId}`, {
      params: {
        day: date
      }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Ошибка API:', error);
        return throwError(() => new Error('Сервер недоступен или произошла ошибка'));
      })
    );
  }
}
