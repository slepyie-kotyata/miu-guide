import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AssistantEmotionService {
  private catEmotionsList: string[] = [
    'eclosed-mclosed',
    'eopen-mclosed',
  ];

  readonly currentEmotion = signal<string>(this.getRandomEmotionPath());

  setEmotion(emotion: string): void {
    this.currentEmotion.set(`/assets/cat/miko-${emotion}.webp`);
  }

  private getRandomEmotionPath(): string {
    const randomIndex = Math.floor(Math.random() * this.catEmotionsList.length);
    return `/assets/cat/miko-sit-${this.catEmotionsList[randomIndex]}.webp`;
  }
}
