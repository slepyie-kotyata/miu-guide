import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';


// TODO: вынести в отдельный сервис, который будет работать с реальным API
@Injectable({ providedIn: 'root' })
export class TeacherSearchService {
  private readonly mockTeachers: Record<string, string> = {
    иванов: 'Иванов Иван Иванович',
    петров: 'Петров Пётр Петрович',
    сидоров: 'Сидоров Сергей Александрович',
  };

  searchTeacher(query: string): Observable<string> {
    const normalized = query.toLowerCase().trim();

    if (normalized.length < 2) {
      return throwError(() => new Error('Слишком короткий запрос')).pipe(delay(800));
    }

    const result = this.mockTeachers[normalized];
    if (result) {
      return of(`Полное ФИО преподавателя: ${result}`).pipe(delay(1000));
    }

    return of(
      `К сожалению, я не нашла преподавателя по запросу «${query}». Попробуй уточнить фамилию или предмет.`
    ).pipe(delay(1200));
  }
}
