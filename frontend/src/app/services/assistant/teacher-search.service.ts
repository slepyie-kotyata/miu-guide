import {inject, Injectable} from '@angular/core';
import {map, Observable, of, throwError} from 'rxjs';
import {catchError, delay} from 'rxjs/operators';
import {SearchService} from "../search.service";


@Injectable({ providedIn: 'root' })
export class TeacherSearchService {
  private searchService = inject(SearchService);

  searchTeacher(query: string): Observable<string> {
    const normalized = query.toLowerCase().trim();

    if (normalized.length < 2) {
      return throwError(() => new Error('Слишком короткий запрос')).pipe(delay(800));
    }

    return this.searchService.searchLecturer(normalized).pipe(
      map((results: string[]) => {
        if (results.length > 0) {
          return `Вот что я нашла: ${results.join(', ')}.`;
        } else {
          return `К сожалению, я не нашла преподавателя по запросу «${query}». Попробуй уточнить фамилию или предмет.`;
        }
      }),
      catchError((error) => {
        console.error('Ошибка при поиске преподавателя:', error);
        return of('Произошла ошибка при поиске преподавателя. Попробуй позже.');
      })
    );
  }
}
