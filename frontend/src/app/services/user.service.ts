import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of, shareReplay} from "rxjs";
import {environment} from 'src/environments/environment';
import {User} from "../models/user.model";
import {AuthService} from "./auth.service";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private auth = inject(AuthService);

  private readonly STORAGE_KEY = 'user_info';

  private user = signal<User | null>(this.readFromStorage());
  readonly userSignal = this.user.asReadonly();
  private userSubjects = signal<string[]>([]);
  readonly userSubjectsSignal = this.userSubjects.asReadonly();

  private inflight$: Observable<User> | null = null;

  loadUser(force = false): Observable<User | null> {
    if (!this.auth.isAuthenticated()) {
      return of(null);
    }

    if (!force && this.user()) {
      return of(this.user()!);
    }

    if (this.inflight$) {
      return this.inflight$;
    }

    const userId = this.auth.getUserId();
    if (!userId) {
      return of(null);
    }

    this.inflight$ = this.http.get<User>(`${this.apiUrl}/access/users/${userId}`).pipe(
      tap((userInfo) => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userInfo));
        this.user.set(userInfo);
      }),
      shareReplay(1),
    );

    this.inflight$.subscribe({
      next: () => {
        this.inflight$ = null;
      },
      error: (err) => {
        console.error('Ошибка при получении информации о пользователе:', err);
        this.inflight$ = null;
      },
    });

    return this.inflight$;
  }

  loadUserSubjects(force = false): Observable<string[]> {
    if (!this.auth.isAuthenticated()) {
      return of([]);
    }

    if (!force && this.userSubjects().length > 0) {
      return of(this.userSubjects());
    }

    const userId = this.auth.getUserId();
    if (!userId) {
      return of([]);
    }

    return this.http.get<string[]>(`${this.apiUrl}/access/users/${userId}/subjects`).pipe(
      tap((subjects) => {
        this.userSubjects.set(subjects);
      }),
      shareReplay(1),
    );
  }

  clearUser() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.user.set(null);
    this.userSubjects.set([]);
  }

  getMajor(): string {
    return this.user()?.major || localStorage.getItem('major') || '';
  }

  private readFromStorage(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}
