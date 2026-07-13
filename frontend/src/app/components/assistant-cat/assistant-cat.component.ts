import { Component, ViewChild, ElementRef, effect, inject, OnInit } from '@angular/core';
import { AssistantEmotionService } from '../../services/assistant/assistant-emotion.service';
import { AssistantDialogService } from '../../services/assistant/assistant-dialog.service';
import { AssistantChatService } from '../../services/assistant/assistant-chat.service';
import { AssistantVisibilityService } from '../../services/assistant/assistant-visibility.service';

@Component({
  selector: 'app-assistant-cat',
  standalone: true,
  imports: [],
  templateUrl: './assistant-cat.component.html',
  styleUrls: ['./assistant-cat.component.scss'],
})
export class AssistantCatComponent {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  public visibilityService = inject(AssistantVisibilityService);
  public dialogService = inject(AssistantDialogService);
  public chatService = inject(AssistantChatService);
  public emotionService = inject(AssistantEmotionService);

  constructor() {
    effect(() => {
      const message = this.dialogService.currentMessage();
      
      // Если сообщения нет (сценарий завершен или закрыт) — гасим всё
      if (!message) {
        this.applyHighlight(null);
        return;
      }

      // Ищем, должна ли быть подсветка для текущего ID сообщения
      // Если шага нет в нашей карте, запишется null
      const activeId = message.highlight || null;
      this.applyHighlight(activeId);

    });
    effect(() => {
      const conversation = this.chatService.conversation();
      if (conversation.length > 0) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  private applyHighlight(activeId: string | null): void {
    
    setTimeout(() => {
      const svgElement = document.querySelector('.map-container svg');
      
      if (!svgElement) {
        console.warn('SVG не найден в DOM');
        return;
      }

      // Всегда сначала очищаем абсолютно ВСЮ прошлую активную подсветку
      svgElement.querySelectorAll('.place-active').forEach((el) => {
        el.classList.remove('place-active');
      });

      // Если для текущего шага есть activeId — зажигаем его
      if (activeId) {
        const target = svgElement.querySelector(`#${activeId}_place`);
        if (target) {
          target.classList.add('place-active');
          console.log(`Подсветка применена к: ${activeId}_place`);
        } else {
          console.error(`Элемент с ID ${activeId}_place не найден в SVG!`);
        }
      }
    });
  }

  onSendMessage(text: string) {
    if (!text.trim()) return;

    this.chatService.sendQuestion(text);

    setTimeout(() => this.scrollToBottom(), 100);
    setTimeout(() => this.scrollToBottom(), 550);
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatScrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {
      console.error('Не удалось прокрутить чат', err);
    }
  }
}
