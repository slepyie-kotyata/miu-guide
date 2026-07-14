import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _isAuthenticated = signal(!!localStorage.getItem('token'));

  isAuthenticated() {
    return this._isAuthenticated();
  }

  login(credentials: { login: string, password: string }): Observable<any> {
    const formData = new FormData();
    formData.append('login', credentials.login);
    formData.append('password', credentials.password);
    return this.http.post<{ token: string, user_id: number }>(`${this.apiUrl}/auth`, formData).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_id', response.user_id.toString());
        this._isAuthenticated.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    this._isAuthenticated.set(false);
  }
}
