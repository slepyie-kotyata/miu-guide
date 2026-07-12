import { Injectable, inject, signal } from '@angular/core';
import { AssistantDialogService } from './assistant-dialog.service';
import { ChatMessage } from './assistant.models';

@Injectable({ providedIn: 'root' })
export class AssistantChatService {
  private dialogService = inject(AssistantDialogService);

  readonly isChatOpen = signal<boolean>(false);
  readonly conversation = signal<ChatMessage[]>([]);

  handleCatClick(): void {
    if (this.dialogService.currentMessage()) return;

    const isOpening = !this.isChatOpen();
    this.isChatOpen.set(isOpening);
    if (isOpening && this.conversation().length === 0) {
      this.conversation.update((msgs) => [
        ...msgs,
        { text: 'Мяу! Что ты хочешь узнать?', sender: 'cat' },
      ]);
    }
  }

  closeChat(): void {
    this.isChatOpen.set(false);
    this.conversation.set([]);
  }

  sendQuestion(question: string): void {
    if (!question.trim()) return;

    this.conversation.update((msgs) => [
      ...msgs,
      { text: question, sender: 'user' },
    ]);

    setTimeout(() => {
      this.conversation.update((msgs) => [
        ...msgs,
        {
          text: 'Мяу! Я пока учусь, но скоро смогу ответить на этот вопрос.',
          sender: 'cat',
        },
      ]);
    }, 500);
  }
}
