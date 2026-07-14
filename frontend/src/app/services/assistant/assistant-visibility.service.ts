import {inject, Injectable, signal} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AssistantVisibilityService {
  private router = inject(Router);

  private allowedPages = ['/tabs/map', '/tabs/schedule'];

  readonly isVisible = signal<boolean>(false);
  readonly isOverlayActive = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkVisibility(event.urlAfterRedirects);
      });
  }

  setVisible(visible: boolean): void {
    this.isVisible.set(visible);
  }

  setOverlayActive(active: boolean): void {
    this.isOverlayActive.set(active);
  }

  private checkVisibility(currentUrl: string): void {
    const hasSeen = localStorage.getItem('hasSeenOnboarding') === 'true';
    if (!hasSeen) {
      this.isVisible.set(true);
    } else {
      const isAllowed = this.allowedPages.some((page) => currentUrl.includes(page));
      this.isVisible.set(isAllowed);
    }
  }
}
