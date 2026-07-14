import {Component, computed, effect, ElementRef, inject, ViewChild} from '@angular/core';
import {
  AssistantChatService,
  AssistantDialogService,
  AssistantEmotionService,
  AssistantVisibilityService
} from '../../services/assistant';
import {NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs/operators';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-assistant-cat',
  standalone: true,
  imports: [],
  templateUrl: './assistant-cat.component.html',
  styleUrls: ['./assistant-cat.component.scss'],
})
export class AssistantCatComponent {
  public visibilityService = inject(AssistantVisibilityService);
  public dialogService = inject(AssistantDialogService);
  public chatService = inject(AssistantChatService);
  public emotionService = inject(AssistantEmotionService);
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  private router = inject(Router);
  private currentUrl = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => (event as NavigationEnd).urlAfterRedirects)
  ), {initialValue: this.router.url});

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
