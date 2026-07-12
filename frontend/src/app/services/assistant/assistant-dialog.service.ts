import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AssistantEmotionService } from './assistant-emotion.service';
import { AssistantVisibilityService } from './assistant-visibility.service';
import { DialogMessage } from './assistant.models';

@Injectable({ providedIn: 'root' })
export class AssistantDialogService {
  private router = inject(Router);
  private emotionService = inject(AssistantEmotionService);
  private visibilityService = inject(AssistantVisibilityService);

  readonly currentMessage = signal<DialogMessage | null>(null);

  private messageQueue: DialogMessage[] = [];

  startOnboarding(): void {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');

    if (!hasSeen) {
      this.visibilityService.setVisible(true);
      this.playDialog([
        {
          text: 'Привет, я, Мико!<br>У тебя уже есть данные от личного кабинета?',
          emotion: 'sit-eopen-mclosed',
          buttons: [
            {
              text: 'Да, войти',
              action: () => {
                this.closeDialog();
                this.router.navigate(['/login']);
              },
            },
            {
              text: 'Нет, выбрать направление',
              action: () => {
                this.playDialog([
                  {
                    text: 'Отлично! Тогда давай я помогу тебе определиться. Какое направление тебе ближе?',
                    emotion: 'paw-eopen-mclosed_1',
                    buttons: [],
                  },
                  {
                    text: 'Обучение завершено! Теперь я буду жить на карте.',
                    emotion: 'sit-eopen-mclosed',
                    buttons: [
                      {
                        text: 'Понятно',
                        action: () => {
                          localStorage.setItem('hasSeenOnboarding', 'true');
                          this.closeDialog();
                          this.visibilityService.recheckVisibility();
                        },
                      },
                    ],
                  },
                ]);
              },
            },
          ],
        },
      ]);
    }
  }

  playDialog(messages: DialogMessage[]): void {
    this.messageQueue = messages;
    this.showNextMessage();
  }

  showNextMessage(): void {
    if (this.messageQueue.length > 0) {
      const nextMsg = this.messageQueue.shift()!;
      this.currentMessage.set(nextMsg);
      this.emotionService.setEmotion(nextMsg.emotion);
    } else {
      this.closeDialog();
    }
  }

  closeDialog(): void {
    this.currentMessage.set(null);
  }

  handleScreenTap(): void {
    const current = this.currentMessage();
    if (current && (!current.buttons || current.buttons.length === 0)) {
      this.showNextMessage();
    }
  }
}
