import {inject, Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  searchLecturer(query: string) {
    return this.http.get<string[]>(`${this.apiUrl}/search`, {
      params: {lecturer: query}
    });
  }

  getMajors() {
    return this.http.get<string[]>(`${this.apiUrl}/majors`);
  }

  getMajorEvents(major: string) {
    return this.http.get<string[]>(`${this.apiUrl}/events`, {
      params: {major}
    });
  }
}
