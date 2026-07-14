import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AssistantEmotionService} from './assistant-emotion.service';
import {AssistantVisibilityService} from './assistant-visibility.service';
import {HttpClient} from '@angular/common/http';
import {SearchService} from "../search.service";
import {UserService} from "../user.service";
import {OnboardingStep} from "./assistant.models";

@Injectable({providedIn: 'root'})
export class AssistantDialogService {
  readonly steps = signal<OnboardingStep[]>([]);
  readonly currentStepId = signal<number>(1);
  readonly selectedDirection = signal<string>('');
  readonly isLoaded = signal<boolean>(false);
  readonly highlightId = signal<string | null>(null);
  readonly hasSeenOnboarding = signal<boolean>(
    localStorage.getItem('hasSeenOnboarding') === 'true'
  );
  readonly directions = signal<string[]>([]);
  private router = inject(Router);
  private http = inject(HttpClient);
  private emotionService = inject(AssistantEmotionService);
  private visibilityService = inject(AssistantVisibilityService);
  private userService = inject(UserService);
  readonly currentMessage = computed<OnboardingStep | null>(() => {
    if (this.hasSeenOnboarding()) return null;

    const allSteps = this.steps();
    if (allSteps.length === 0) return null;

    const step = allSteps.find(s => s.id === this.currentStepId());
    if (!step) return null;

    let processedText = step.text;
    if (step.id === 4) {
      processedText = processedText.replace('&value', this.selectedDirection().split(' ').slice(1).join(' ') || 'выбранное направление');
    }

    if (step.id === 7) {
      processedText = processedText.replace('&value', this.userService.userSignal()?.full_name.split(' ')[1] || 'студент');
    }

    return {
      id: step.id,
      emotion: step.emotion,
      text: processedText,
      buttons: step.buttons,
      canSkip: step.canSkip,
      comment: step.comment,
      highlight: step.highlight,
      mapFloor: step.mapFloor,
    };
  });
  readonly currentFloor = computed<number>(() => {
    const msg = this.currentMessage();
    return msg?.mapFloor ?? 1;
  });
  readonly isDarkBackdrop = computed(() => {
    const msg = this.currentMessage();
    if (!msg) return false;

    return msg.id < 19 || msg.id > 55;
  });
  private searchService = inject(SearchService);

  constructor() {
    this.searchService.getMajors().subscribe(majors => {
      this.directions.set(majors);
    })

    effect(() => {
      const step = this.currentMessage();
      if (step && step.emotion) {
        this.emotionService.setEmotion(step.emotion);
      }
    });
  }

  restartFromStep(stepId: number): void {
    localStorage.setItem('hasSeenOnboarding', 'false');
    this.hasSeenOnboarding.set(false);
    this.currentStepId.set(stepId);
    localStorage.setItem('onboardingStepId', stepId.toString());
    this.visibilityService.setVisible(true);

    const step = this.steps().find(s => s.id === stepId);
    const highlight = step?.highlight ?? null;
    this.highlightId.set(highlight);

    if (highlight && !this.router.url.includes('/tabs/map')) {
      this.router.navigate(['/tabs/map']);
    }

    this.updateEmotion();
  }

  startOnboarding(forcedStepId: number = 0): void {
    if (this.hasSeenOnboarding()) return;

    this.visibilityService.setVisible(true);

    this.http.get<OnboardingStep[]>('/assets/mascot/mascot-script-firstday.json').subscribe({
      next: (data) => {
        this.steps.set(data);
        this.isLoaded.set(true);

        if (forcedStepId > 0) {
          this.currentStepId.set(forcedStepId);
          localStorage.setItem('onboardingStepId', forcedStepId.toString());
        } else {
          const savedStep = localStorage.getItem('onboardingStepId');
          if (savedStep) {
            this.currentStepId.set(parseInt(savedStep, 10));
          } else {
            this.currentStepId.set(1);
          }
        }

        const savedDir = localStorage.getItem('major');
        if (savedDir) {
          this.selectedDirection.set(savedDir);
        }

        const currentStep = data.find(s => s.id === this.currentStepId());
        const highlight = currentStep?.highlight ?? null;
        this.highlightId.set(highlight);

        if (highlight && !this.router.url.includes('/tabs/map')) {
          this.router.navigate(['/tabs/map']);
        }

        this.updateEmotion();
      },
      error: (err) => {
        console.error('Ошибка загрузки сценария:', err);
      }
    });
  }

  goToNext(): void {
    const currentId = this.currentStepId();

    if (currentId === 5) {
      this.moveToStep(9);
      return;
    }

    const stepsList = this.steps();
    const currentIndex = stepsList.findIndex(s => s.id === currentId);

    if (currentIndex !== -1 && currentIndex < stepsList.length - 1) {
      const nextStep = stepsList[currentIndex + 1];
      this.moveToStep(nextStep.id);
    } else {
      this.finishOnboarding();
    }
  }

  goToPrev(): void {
    const currentId = this.currentStepId();

    if (currentId === 9) {
      this.moveToStep(5);
      return;
    }

    const stepsList = this.steps();
    const currentIndex = stepsList.findIndex(s => s.id === currentId);

    if (currentIndex > 0) {
      const prevStep = stepsList[currentIndex - 1];
      this.moveToStep(prevStep.id);
    }
  }

  finishOnboarding(): void {
    localStorage.setItem('hasSeenOnboarding', 'true');
    this.hasSeenOnboarding.set(true);
    localStorage.removeItem('onboardingStepId');

    this.currentStepId.set(0);
    this.highlightId.set(null);
  }

  handleStep2Choice(choice: string): void {
    if (choice === 'Да') {
      this.router.navigate(['/login']);
    } else if (choice === 'Нет') {
      this.router.navigate(['/profile']);
      this.currentStepId.set(3);
      localStorage.setItem('onboardingStepId', '3');
      this.updateEmotion();
    }
  }

  selectDirection(direction: string): void {
    this.selectedDirection.set(direction);
    localStorage.setItem('major', direction);
  }

  isNextDisabled(): boolean {
    const currentId = this.currentStepId();
    if (currentId === 2) return true;
    if (currentId === 3 && !this.selectedDirection()) return true;
    return false;
  }

  private updateEmotion(): void {
    const msg = this.currentMessage();
    if (msg) {
      this.emotionService.setEmotion(msg.emotion);
    }
  }

  private moveToStep(id: number): void {
    this.currentStepId.set(id);
    localStorage.setItem('onboardingStepId', id.toString());

    const step = this.steps().find(s => s.id === id);
    const highlight = step?.highlight ?? null;
    this.highlightId.set(highlight);

    if (highlight && !this.router.url.includes('/tabs/map')) {
      this.router.navigate(['/tabs/map']);
    }
  }
}
