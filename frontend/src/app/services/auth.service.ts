import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = false;

  login(username: string, pass: string) {
    // Твоя логика проверки "в лоб" или запрос к API
    if (username === 'student' && pass === '123') {
      this.isAuthenticated = true;
      return true;
    }
    return false;
  }

  loginAsGuest() {
    this.isAuthenticated = true;
    // Гость не требует пароля
  }
}