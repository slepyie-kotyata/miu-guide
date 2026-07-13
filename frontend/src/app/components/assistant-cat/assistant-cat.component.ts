import { Component, computed, ViewChild, ElementRef, effect, inject } from '@angular/core';
import { AssistantEmotionService } from '../../services/assistant/assistant-emotion.service';
import { AssistantDialogService } from '../../services/assistant/assistant-dialog.service';
import { AssistantChatService } from '../../services/assistant/assistant-chat.service';
import { AssistantVisibilityService } from '../../services/assistant/assistant-visibility.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private router = inject(Router);
  private currentUrl = toSignal(this.router.events.pipe(
  filter(event => event instanceof NavigationEnd),
  map(event => (event as NavigationEnd).urlAfterRedirects)
), { initialValue: this.router.url });

readonly isSchedulePage = computed(() => this.currentUrl().includes('/schedule'));
  constructor() {
    effect(() => {
      const conversation = this.chatService.conversation();
      if (conversation.length > 0) {
        setTimeout(() => this.scrollToBottom(), 0);
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
