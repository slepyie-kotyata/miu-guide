import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAuthenticated = signal(false);
  readonly isAuthenticated = computed(() => this._isAuthenticated());

  login(username: string, pass: string): boolean {
    if (username === 'student' && pass === '123') {
      this._isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    this._isAuthenticated.set(false);
  }
}
