import {Component, computed, effect, ElementRef, inject, ViewChild} from '@angular/core';
import {
  AssistantChatService,
  AssistantDialogService,
  AssistantEmotionService,
  AssistantVisibilityService
} from '../../services/assistant';
import {ONBOARDING_DARK_BACKDROP, ONBOARDING_STEPS} from '../../services/assistant/assistant.models';
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
  private visibilityService = inject(AssistantVisibilityService);
  private dialogService = inject(AssistantDialogService);
  private chatService = inject(AssistantChatService);
  private emotionService = inject(AssistantEmotionService);
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  private router = inject(Router);

  private currentUrl = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => (event as NavigationEnd).urlAfterRedirects)
  ), {initialValue: this.router.url});

  readonly isVisible = computed(() => this.visibilityService.isVisible());
  readonly currentMessage = computed(() => this.dialogService.currentMessage());
  readonly currentStepId = computed(() => this.dialogService.currentStepId());
  readonly isNextDisabled = computed(() => this.dialogService.isNextDisabled());
  readonly selectedDirection = computed(() => this.dialogService.selectedDirection());
  readonly directions = computed(() => this.dialogService.directions());
  readonly isChatOpen = computed(() => this.chatService.isChatOpen());
  readonly conversation = computed(() => this.chatService.conversation());
  readonly isTyping = computed(() => this.chatService.isTyping());
  readonly suggestedQuestions = computed(() => this.chatService.suggestedQuestions());
  readonly currentEmotion = computed(() => this.emotionService.currentEmotion());

  readonly isSchedulePage = computed(() => this.currentUrl().includes('/schedule'));
  readonly darkBackdropMin = ONBOARDING_DARK_BACKDROP.MIN;
  readonly darkBackdropMax = ONBOARDING_DARK_BACKDROP.MAX;
  readonly stepAuthChoice = ONBOARDING_STEPS.AUTH_CHOICE;
  readonly stepDirectionChoice = ONBOARDING_STEPS.DIRECTION_CHOICE;
  readonly stepFirst = ONBOARDING_STEPS.AUTH_CHOICE - 1;

  constructor() {
    effect(() => {
      const conversation = this.conversation();
      if (conversation.length > 0) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  onSkip(): void {
    this.dialogService.finishOnboarding();
  }

  onPrev(): void {
    this.dialogService.goToPrev();
  }

  onNext(): void {
    this.dialogService.goToNext();
  }

  onStep2Choice(choice: string): void {
    this.dialogService.handleStep2Choice(choice);
  }

  onSelectDirection(value: string): void {
    this.dialogService.selectDirection(value);
  }

  onCatClick(): void {
    this.chatService.handleCatClick();
  }

  onCloseChat(): void {
    this.chatService.closeChat();
  }

  onSuggestedQuestion(question: string): void {
    this.chatService.selectSuggestedQuestion(question);
  }

  onSendMessage(text: string): void {
    if (!text.trim()) return;
    this.chatService.sendQuestion(text);
    setTimeout(() => this.scrollToBottom(), 100);
    setTimeout(() => this.scrollToBottom(), 550);
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatScrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {
    }
  }
}
