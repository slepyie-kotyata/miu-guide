import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AssistantEmotionService } from './assistant-emotion.service';
import { AssistantVisibilityService } from './assistant-visibility.service';
import { HttpClient } from '@angular/common/http';

export interface OnboardingStep {
  id: number;
  emotion: string;
  text: string;
  buttons: string[];
  canSkip?: boolean;
  comment?: string;
  highlight?: string;
}

@Injectable({ providedIn: 'root' })
export class AssistantDialogService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private emotionService = inject(AssistantEmotionService);
  private visibilityService = inject(AssistantVisibilityService);

  readonly steps = signal<OnboardingStep[]>([]);

  readonly currentStepId = signal<number>(1);
  readonly selectedDirection = signal<string>('');
  readonly isLoaded = signal<boolean>(false);
  
  // Список направлений для выпадающего списка (шаг 3)
  readonly directions = signal<string[]>([
    'Информатика и вычислительная техника',
    'Экономика',
    'Юриспруденция',
    'Дизайн',
    'Менеджмент',
    'Психология'
  ]);
  readonly currentMessage = computed<OnboardingStep | null>(() => {
  const isCompleted = localStorage.getItem('hasSeenOnboarding') === 'true';
  if (isCompleted) return null;

  const allSteps = this.steps();
  if (allSteps.length === 0) return null; // Если JSON еще не загрузился

  const step = allSteps.find(s => s.id === this.currentStepId());
  if (!step) return null;

  let processedText = step.text;
  if (step.id === 4) {
    // Подставляем выбранное на шаге 3 направление
    processedText = processedText.replace('&value', this.selectedDirection() || 'выбранное направление');
  }

  // Возвращаем объект, полностью соответствующий интерфейсу OnboardingStep
  return {
    id: step.id,
    emotion: step.emotion,
    text: processedText,
    buttons: step.buttons,
    canSkip: step.canSkip,
    comment: step.comment
  };
});

  startOnboarding(): void {
    const hasSeen = localStorage.getItem('hasSeenOnboarding') === 'true';

    if (!hasSeen) {
      this.visibilityService.setVisible(true);

      // Загружаем сценарий из папки assets
      this.http.get<OnboardingStep[]>('/assets/mascot/mascot-script-firstday.json').subscribe({
        next: (data) => {
          this.steps.set(data);
          this.isLoaded.set(true);

          // Восстанавливаем сохраненный прогресс только после успешной загрузки структуры
          const savedStep = localStorage.getItem('onboardingStepId');
          if (savedStep) {
            this.currentStepId.set(parseInt(savedStep, 10));
          } else {
            this.currentStepId.set(1);
          }

          const savedDir = localStorage.getItem('onboardingDirection');
          if (savedDir) {
            this.selectedDirection.set(savedDir);
          }

          this.updateEmotion();
        },
        error: (err) => {
          console.error('Не удалось загрузить сценарий онбординга mascot-phrases.json:', err);
        }
      });
    }
  }

  private updateEmotion(): void {
    const msg = this.currentMessage();
    if (msg) {
      this.emotionService.setEmotion(msg.emotion);
    }
  }

  // Внутри класса AssistantDialogService

goToNext(): void {
  const currentId = this.currentStepId();

  // 1. УСЛОВИЕ РАЗВЕТВЛЕНИЯ: если мы на 5 шаге, то следующий по сценарию — 9
  if (currentId === 5) {
    this.moveToStep(9);
    return;
  }

  // Стандартный поиск следующего шага по порядку в массиве JSON
  const stepsList = this.steps();
  const currentIndex = stepsList.findIndex(s => s.id === currentId);
  
  if (currentIndex !== -1 && currentIndex < stepsList.length - 1) {
    const nextStep = stepsList[currentIndex + 1];
    this.moveToStep(nextStep.id);
  } else {
    // Если шаги в сценарии совсем закончились
    this.finishOnboarding();
  }
}

goToPrev(): void {
  const currentId = this.currentStepId();

  // 2. УСЛОВИЕ ВОЗВРАТА: если мы на 9 шаге и жмем «назад», то возвращаемся на 5
  if (currentId === 9) {
    this.moveToStep(5);
    return;
  }

  // Стандартный поиск предыдущего шага
  const stepsList = this.steps();
  const currentIndex = stepsList.findIndex(s => s.id === currentId);
  
  if (currentIndex > 0) {
    const prevStep = stepsList[currentIndex - 1];
    this.moveToStep(prevStep.id);
  }
}

// Вынесем обновление шага в отдельный приватный метод, чтобы не дублировать localStorage
private moveToStep(id: number): void {
  this.currentStepId.set(id);
  localStorage.setItem('onboardingStepId', id.toString());
}

// Метод для полного завершения или пропуска онбординга
finishOnboarding(): void {
  localStorage.setItem('hasSeenOnboarding', 'true');
  localStorage.removeItem('onboardingStepId'); // очищаем прогресс
  this.currentStepId.set(1);
  this.visibilityService.setVisible(false); // скрываем кота/затемнение
}
  // Обработка клика по кнопкам "Да" / "Нет", которые рендерятся из JSON
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
    if (currentId === 2) return true; // Нельзя пройти дальше кнопкой >, нужно выбрать Да/Нет
    if (currentId === 3 && !this.selectedDirection()) return true; // Нельзя пройти, пока не выбрано направление
    return false;
  }

  completeOnboarding(): void {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.removeItem('onboardingStepId');
    localStorage.removeItem('onboardingDirection');
    this.currentStepId.set(0);
    this.visibilityService.recheckVisibility();
  }
}