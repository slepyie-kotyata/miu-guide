import {Injectable, signal} from '@angular/core';

const STORAGE_KEYS = {
  SEEN: 'hasSeenOnboarding',
  STEP_ID: 'onboardingStepId',
  MAJOR: 'major',
} as const;

@Injectable({providedIn: 'root'})
export class OnboardingPersistenceService {
  readonly hasSeenOnboarding = signal<boolean>(
    localStorage.getItem(STORAGE_KEYS.SEEN) === 'true'
  );

  setSeenOnboarding(seen: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SEEN, String(seen));
    this.hasSeenOnboarding.set(seen);
  }

  getSavedStepId(): number | null {
    const raw = localStorage.getItem(STORAGE_KEYS.STEP_ID);
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  saveStepId(id: number): void {
    localStorage.setItem(STORAGE_KEYS.STEP_ID, id.toString());
  }

  clearStepId(): void {
    localStorage.removeItem(STORAGE_KEYS.STEP_ID);
  }

  getSavedDirection(): string | null {
    return localStorage.getItem(STORAGE_KEYS.MAJOR);
  }

  saveDirection(direction: string): void {
    localStorage.setItem(STORAGE_KEYS.MAJOR, direction);
  }
}
