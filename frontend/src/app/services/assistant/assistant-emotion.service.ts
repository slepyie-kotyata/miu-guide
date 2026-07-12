import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AssistantEmotionService {
  private catEmotionsList: string[] = [
    'miko-sit-eclosed-mclosed',
    'miko-sit-eopen-mclosed',
  ];

  readonly currentEmotion = signal<string>(this.getRandomEmotionPath());

  randomizeEmotion(): void {
    this.currentEmotion.set(this.getRandomEmotionPath());
  }

  setEmotion(emotion: string): void {
    this.currentEmotion.set(`/assets/cat/${emotion}.webp`);
  }

  private getRandomEmotionPath(): string {
    const randomIndex = Math.floor(Math.random() * this.catEmotionsList.length);
    return `/assets/cat/${this.catEmotionsList[randomIndex]}.webp`;
  }
}
