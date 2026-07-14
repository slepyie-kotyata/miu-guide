import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AssistantEmotionService} from './assistant-emotion.service';
import {AssistantVisibilityService} from './assistant-visibility.service';
import {UserService} from '../user.service';
import {ONBOARDING_DARK_BACKDROP, ONBOARDING_STEPS, OnboardingStep} from './assistant.models';
import {OnboardingLoaderService} from './onboarding-loader.service';
import {OnboardingPersistenceService} from './onboarding-persistence.service';

const DEFAULT_STEP_ID = 1;

@Injectable({providedIn: 'root'})
export class AssistantDialogService {
  readonly steps = signal<OnboardingStep[]>([]);
  readonly currentStepId = signal<number>(DEFAULT_STEP_ID);
  readonly selectedDirection = signal<string>('');
  readonly isLoaded = signal<boolean>(false);
  readonly highlightId = signal<string | null>(null);
  readonly hasSeenOnboarding = computed(() => this.persistence.hasSeenOnboarding());
  readonly directions = signal<string[]>([]);

  private endStepId: number | null = null;

  readonly currentMessage = computed<OnboardingStep | null>(() => {
    if (this.hasSeenOnboarding()) return null;

    const allSteps = this.steps();
    if (allSteps.length === 0) return null;

    const step = allSteps.find(s => s.id === this.currentStepId());
    if (!step) return null;

    let processedText = step.text;
    if (step.id === ONBOARDING_STEPS.DIRECTION_CONFIRM) {
      processedText = processedText.replace('&value', this.selectedDirection().split(' ').slice(1).join(' ') || 'выбранное направление');
    }

    if (step.id === ONBOARDING_STEPS.NAME_GREETING) {
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
    return msg.id < ONBOARDING_DARK_BACKDROP.MIN || msg.id > ONBOARDING_DARK_BACKDROP.MAX;
  });

  private readonly router = inject(Router);
  private readonly emotionService = inject(AssistantEmotionService);
  private readonly visibilityService = inject(AssistantVisibilityService);
  private readonly userService = inject(UserService);
  private readonly loader = inject(OnboardingLoaderService);
  private readonly persistence = inject(OnboardingPersistenceService);

  constructor() {
    this.loader.loadDirections().subscribe({
      next: (majors) => this.directions.set(majors),
      error: (err) => console.error('Ошибка загрузки направлений:', err),
    });

    effect(() => {
      const step = this.currentMessage();
      this.visibilityService.setOverlayActive(step !== null);
      if (step?.emotion) {
        this.emotionService.setEmotion(step.emotion);
      }
    });
  }

  startOnboarding(forcedStepId: number = 0): void {
    if (this.persistence.hasSeenOnboarding()) return;

    this.visibilityService.setVisible(true);

    this.loader.loadScript().subscribe({
      next: (data) => {
        this.steps.set(data);
        this.isLoaded.set(true);

        if (forcedStepId > 0) {
          this.applyStep(forcedStepId);
        } else {
          const savedStep = this.persistence.getSavedStepId();
          this.applyStep(savedStep ?? DEFAULT_STEP_ID);
        }

        const savedDir = this.persistence.getSavedDirection();
        if (savedDir) {
          this.selectedDirection.set(savedDir);
        }
      },
      error: (err) => console.error('Ошибка загрузки сценария:', err),
    });
  }

  restartFromStep(stepId: number, endStepId?: number): void {
    this.persistence.setSeenOnboarding(false);
    this.visibilityService.setVisible(true);
    this.endStepId = endStepId ?? null;

    if (this.steps().length === 0) {
      this.startOnboarding(stepId);
    } else {
      this.applyStep(stepId);
    }
  }

  goToNext(): void {
    const currentId = this.currentStepId();

    if (this.endStepId !== null && currentId === this.endStepId) {
      this.endStepId = null;
      this.finishOnboarding();
      return;
    }

    if (currentId === ONBOARDING_STEPS.AUTH_REDIRECT) {
      this.moveToStep(ONBOARDING_STEPS.POST_AUTH);
      return;
    }

    const stepsList = this.steps();
    const currentIndex = stepsList.findIndex(s => s.id === currentId);

    if (currentIndex !== -1 && currentIndex < stepsList.length - 1) {
      this.moveToStep(stepsList[currentIndex + 1].id);
    } else {
      this.finishOnboarding();
    }
  }

  goToPrev(): void {
    const currentId = this.currentStepId();

    if (currentId === ONBOARDING_STEPS.POST_AUTH) {
      this.moveToStep(ONBOARDING_STEPS.AUTH_REDIRECT);
      return;
    }

    const stepsList = this.steps();
    const currentIndex = stepsList.findIndex(s => s.id === currentId);

    if (currentIndex > 0) {
      this.moveToStep(stepsList[currentIndex - 1].id);
    }
  }

  finishOnboarding(): void {
    this.persistence.setSeenOnboarding(true);
    this.persistence.clearStepId();
    this.currentStepId.set(0);
    this.highlightId.set(null);
    this.endStepId = null;
  }

  handleStep2Choice(choice: string): void {
    if (choice === 'Да') {
      this.router.navigate(['/login']);
    } else if (choice === 'Нет') {
      this.router.navigate(['/profile']);
      this.applyStep(ONBOARDING_STEPS.DIRECTION_CHOICE);
    }
  }

  selectDirection(direction: string): void {
    this.selectedDirection.set(direction);
    this.persistence.saveDirection(direction);
  }

  isNextDisabled(): boolean {
    const currentId = this.currentStepId();
    if (currentId === ONBOARDING_STEPS.AUTH_CHOICE) return true;
    if (currentId === ONBOARDING_STEPS.DIRECTION_CHOICE && !this.selectedDirection()) return true;
    return false;
  }

  private moveToStep(id: number): void {
    this.applyStep(id);
  }

  private applyStep(id: number): void {
    this.currentStepId.set(id);
    this.persistence.saveStepId(id);

    const step = this.steps().find(s => s.id === id);
    const highlight = step?.highlight ?? null;
    this.highlightId.set(highlight);

    if (highlight && !this.router.url.includes('/tabs/map')) {
      this.router.navigate(['/tabs/map']);
    }
  }
}
