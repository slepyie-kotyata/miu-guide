import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated by default', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should authenticate with correct credentials', () => {
    const result = service.login('student', '123');
    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should not authenticate with wrong credentials', () => {
    const result = service.login('wrong', 'wrong');
    expect(result).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should not be authenticated after logout', () => {
    service.login('student', '123');
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });
});
