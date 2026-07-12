import { Injectable, inject, signal } from '@angular/core';
import { AssistantDialogService } from './assistant-dialog.service';
import { ChatMatchingService } from './chat-matching.service';
import { ChatNavigationService } from './chat-navigation.service';
import { MascotDataService } from './mascot-data.service';
import { AssistantEmotionService } from './assistant-emotion.service';
import { TeacherSearchService } from './teacher-search.service';
import { ChatMessage, ChatMode } from './assistant.models';

@Injectable({ providedIn: 'root' })
export class AssistantChatService {
  private dialogService = inject(AssistantDialogService);
  private matchingService = inject(ChatMatchingService);
  private navigationService = inject(ChatNavigationService);
  private mascotData = inject(MascotDataService);
  private emotionService = inject(AssistantEmotionService);
  private teacherSearch = inject(TeacherSearchService);

  readonly isChatOpen = signal<boolean>(false);
  readonly conversation = signal<ChatMessage[]>([]);
  readonly suggestedQuestions = signal<string[]>([]);
  readonly isTyping = signal<boolean>(false);

  private mode: ChatMode = 'default';

  private readonly minDelay = 800;
  private readonly maxDelay = 3000;
  private readonly delayPerChar = 30;

  handleCatClick(): void {
    if (this.dialogService.currentMessage()) return;

    if (this.isChatOpen()) {
      this.closeChat();
      return;
    }

    this.isChatOpen.set(true);
    this.mode = 'default';
    this.isTyping.set(false);
    this.conversation.set([]);

    const greeting = this.mascotData.getGreeting();
    this.emotionService.setEmotion(greeting.emotion);
    this.conversation.set([
      { text: greeting.text, sender: 'cat', emotion: greeting.emotion, showSuggestions: true },
    ]);
    this.suggestedQuestions.set(this.mascotData.getSuggestedQuestions());
  }

  closeChat(): void {
    this.isChatOpen.set(false);
    this.isTyping.set(false);
    this.mode = 'default';
    this.conversation.set([]);
    this.suggestedQuestions.set([]);
  }

  sendQuestion(question: string): void {
    const trimmed = question.trim();
    if (!trimmed) return;
    if (this.isTyping()) return;

    if (!navigator.onLine) {
      this.handleOfflineError();
      return;
    }

    this.suggestedQuestions.set([]);
    this.conversation.update((msgs) => [
      ...msgs,
      { text: trimmed, sender: 'user' },
    ]);

    if (this.mode === 'awaiting_teacher_input') {
      this.handleTeacherSearch(trimmed);
      return;
    }

    this.handleDefaultMatch(trimmed);
  }

  selectSuggestedQuestion(question: string): void {
    this.sendQuestion(question);
  }

  private handleDefaultMatch(input: string): void {
    try {
      const matched = this.matchingService.matchIntent(input);
      const answer = this.mascotData.getAnswerByIntent(matched.intent);
      const responseText = answer?.text ?? matched.answer;
      const responseEmotion = answer?.emotion ?? 'sit-eopen-mopen';

      this.startTyping(responseText, () => {
        this.emotionService.setEmotion(responseEmotion);
        this.conversation.update((msgs) => [
          ...msgs,
          { text: responseText, sender: 'cat', emotion: responseEmotion },
        ]);

        if (matched.intent === 'find_teacher') {
          this.mode = 'awaiting_teacher_input';
          return;
        }

        if (this.navigationService.hasNavigation(matched.intent)) {
          this.navigationService.executeNavigation(matched.intent);
          this.closeChat();
        }
      });
    } catch {
      this.handleError();
    }
  }

  private handleTeacherSearch(query: string): void {
    this.isTyping.set(true);
    this.emotionService.setEmotion('sit-eopen-mopen');

    this.teacherSearch.searchTeacher(query).subscribe({
      next: (result) => {
        const delay = this.computeDelay(result);
        setTimeout(() => {
          this.isTyping.set(false);
          this.mode = 'default';
          this.emotionService.setEmotion('paw-eopen-mopen');
          this.conversation.update((msgs) => [
            ...msgs,
            { text: result, sender: 'cat', emotion: 'paw-eopen-mopen' },
          ]);
        }, delay);
      },
      error: () => {
        this.mode = 'default';
        this.handleError();
      },
    });
  }

  private startTyping(responseText: string, onComplete: () => void): void {
    this.isTyping.set(true);
    this.emotionService.setEmotion('sit-eopen-mopen');

    const delay = this.computeDelay(responseText);
    setTimeout(() => {
      this.isTyping.set(false);
      onComplete();
    }, delay);
  }

  private handleOfflineError(): void {
    const error = this.mascotData.getErrorMessage();
    this.emotionService.setEmotion(error.emotion);
    this.conversation.update((msgs) => [
      ...msgs,
      { text: error.text, sender: 'cat', emotion: error.emotion, isError: true },
    ]);
  }

  private handleError(): void {
    this.isTyping.set(false);
    const error = this.mascotData.getErrorMessage();
    this.emotionService.setEmotion(error.emotion);
    this.conversation.update((msgs) => [
      ...msgs,
      { text: error.text, sender: 'cat', emotion: error.emotion, isError: true },
    ]);
  }

  private computeDelay(text: string): number {
    return Math.min(this.maxDelay, this.minDelay + text.length * this.delayPerChar);
  }
}
