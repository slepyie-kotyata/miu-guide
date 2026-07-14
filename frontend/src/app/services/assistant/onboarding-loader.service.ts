import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {OnboardingStep} from './assistant.models';
import {SearchService} from '../search.service';

@Injectable({providedIn: 'root'})
export class OnboardingLoaderService {
  private readonly http = inject(HttpClient);
  private readonly searchService = inject(SearchService);

  loadScript(): Observable<OnboardingStep[]> {
    return this.http.get<OnboardingStep[]>('/assets/mascot/mascot-script-firstday.json');
  }

  loadDirections(): Observable<string[]> {
    return this.searchService.getMajors();
  }
}
