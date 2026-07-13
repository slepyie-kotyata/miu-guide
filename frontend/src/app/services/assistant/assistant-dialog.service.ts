import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AssistantEmotionService } from './assistant-emotion.service';
import { AssistantVisibilityService } from './assistant-visibility.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

export interface OnboardingStep {
  id: number;
  emotion: string;
  text: string;
  buttons: string[];
  canSkip?: boolean;
  comment?: string;
  highlight?: string;
  mapFloor?: number;
}

@Injectable({ providedIn: 'root' })
export class AssistantDialogService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private emotionService = inject(AssistantEmotionService);
  private visibilityService = inject(AssistantVisibilityService);
  private authService = inject(AuthService);
  readonly steps = signal<OnboardingStep[]>([]);

  readonly currentStepId = signal<number>(1);
  readonly selectedDirection = signal<string>('');
  readonly isLoaded = signal<boolean>(false);
  readonly highlightId = signal<string | null>(null);
  
  readonly directions = signal<string[]>([
    'Информационные системыи и базы данных',
    'Экономика',
    'Юриспруденция',
    'Дизайн',
    'Менеджмент',
    'Психология'
  ]);
constructor() {
    effect(() => {
      const step = this.currentMessage(); 
      if (step && step.emotion) {
        this.emotionService.setEmotion(step.emotion); 
      }
    });
  }
  


  readonly currentMessage = computed<OnboardingStep | null>(() => {
  const isCompleted = localStorage.getItem('hasSeenOnboarding') === 'true';
  if (isCompleted) return null;

  const allSteps = this.steps();
  if (allSteps.length === 0) return null; 

  const step = allSteps.find(s => s.id === this.currentStepId());
  if (!step) return null;

  let processedText = step.text;
  if (step.id === 4) {
    processedText = processedText.replace('&value', this.selectedDirection() || 'выбранное направление');
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

startOnboarding(forcedStepId: number = 0): void {
  const hasSeen = localStorage.getItem('hasSeenOnboarding') === 'true';

  if (!hasSeen) {
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

        const savedDir = localStorage.getItem('onboardingDirection');
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
}
  readonly currentFloor = computed<number>(() => {
  const msg = this.currentMessage();
  return msg?.mapFloor ?? 1; 
});
readonly isDarkBackdrop = computed(() => {
    const msg = this.currentMessage();
    if (!msg) return false;
    
    return msg.id < 19 || msg.id > 55;
  });

  private updateEmotion(): void {
    const msg = this.currentMessage();
    if (msg) {
      this.emotionService.setEmotion(msg.emotion);
    }
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

finishOnboarding(): void {
  localStorage.setItem('hasSeenOnboarding', 'true');
  localStorage.removeItem('onboardingStepId');
  localStorage.removeItem('onboardingDirection');
  
  this.currentStepId.set(0); 
  this.highlightId.set(null);
  this.visibilityService.setVisible(false);

  
  if (!this.authService.isAuthenticated) { 
    this.router.navigate(['/login']);
  }
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
    localStorage.setItem('onboardingDirection', direction);
  }

  isNextDisabled(): boolean {
    const currentId = this.currentStepId();
    if (currentId === 2) return true; 
    if (currentId === 3 && !this.selectedDirection()) return true; 
    return false;
  }

completeOnboarding(): void {
  localStorage.setItem('hasSeenOnboarding', 'true');
  localStorage.removeItem('onboardingStepId');
  localStorage.removeItem('onboardingDirection');
  this.currentStepId.set(0);
  this.highlightId.set(null);
  this.visibilityService.recheckVisibility();
}
}