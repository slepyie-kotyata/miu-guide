import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of, shareReplay} from "rxjs";
import {environment} from "../../environments/environment";
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

    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      return of(null);
    }

    this.inflight$ = this.http.get<User>(`${this.apiUrl}/access/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      tap((userInfo) => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userInfo));
        this.user.set(userInfo);
      }),
      shareReplay(1),
    );

    this.inflight$.subscribe({
      next: () => { this.inflight$ = null; },
      error: (err) => {
        console.error('Ошибка при получении информации о пользователе:', err);
        this.inflight$ = null;
      },
    });

    return this.inflight$;
  }

  clearUser() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.user.set(null);
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
