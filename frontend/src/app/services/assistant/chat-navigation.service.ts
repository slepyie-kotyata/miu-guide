import {inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';

export type ScheduleTargetDay = 'today' | 'tomorrow' | 'current';

export interface NavigationRequest {
  route: string;
  queryParams?: Record<string, string>;
}

@Injectable({providedIn: 'root'})
export class ChatNavigationService {
  private router = inject(Router);

  readonly pendingScheduleDay = signal<ScheduleTargetDay | null>(null);

  private readonly intentActions: Record<string, NavigationRequest> = {
    schedule_today: {
      route: '/tabs/schedule',
      queryParams: {day: 'today'},
    },
    schedule_tomorrow: {
      route: '/tabs/schedule',
      queryParams: {day: 'tomorrow'},
    },
    schedule_week: {
      route: '/tabs/schedule',
      queryParams: {day: 'current'},
    },
    next_class_location: {
      route: '/tabs/schedule',
      queryParams: {day: 'today'},
    },
  };

  hasNavigation(intent: string): boolean {
    return intent in this.intentActions;
  }

  executeNavigation(intent: string): void {
    const action = this.intentActions[intent];
    if (!action) return;

    const day = action.queryParams?.['day'] as ScheduleTargetDay | undefined;
    if (day) {
      this.pendingScheduleDay.set(day);
    }

    this.router.navigate([action.route], {
      queryParams: action.queryParams,
    });
  }

  consumePendingScheduleDay(): ScheduleTargetDay | null {
    const day = this.pendingScheduleDay();
    this.pendingScheduleDay.set(null);
    return day;
  }
}
