import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = false;

  login(username: string, pass: string) {
    if (username === 'student' && pass === '123') {
      this.isAuthenticated = true;
      return true;
    }
    return false;
  }

  loginAsGuest() {
    this.isAuthenticated = true;
  }
}