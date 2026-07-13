import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AssistantEmotionService {
  private catEmotionsList: string[] = [
    'eclosed-mclosed',
    'eopen-mclosed',
  ];
  private emotionKey = signal<string>('default');
  readonly currentDialogEmotion = computed(() => {
    return `/assets/cat/miko-${this.emotionKey()}.webp`;
  });
  setDialogEmotion(key: string): void {
    if (key) {
      this.emotionKey.set(key);
    }
  }

  readonly currentEmotion = signal<string>(this.getRandomEmotionPath());

  setEmotion(emotion: string): void {
    this.currentEmotion.set(`/assets/cat/miko-${emotion}.webp`);
  }

  private getRandomEmotionPath(): string {
    const randomIndex = Math.floor(Math.random() * this.catEmotionsList.length);
    return `/assets/cat/${this.catEmotionsList[randomIndex]}.webp`;
  }
}
