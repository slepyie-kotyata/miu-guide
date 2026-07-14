import {Injectable, signal} from '@angular/core';
import {EMOTION} from './assistant.models';

@Injectable({providedIn: 'root'})
export class AssistantEmotionService {
  private readonly sitEmotions = [
    EMOTION.SIT_ECLOSED_MCLOSED,
    EMOTION.SIT_EOPEN_MCLOSED,
  ];

  readonly currentEmotion = signal<string>(this.getRandomSitEmotionPath());

  setEmotion(emotion: string): void {
    this.currentEmotion.set(`/assets/cat/miko-${emotion}.webp`);
  }

  private getRandomSitEmotionPath(): string {
    const randomIndex = Math.floor(Math.random() * this.sitEmotions.length);
    return `/assets/cat/miko-${this.sitEmotions[randomIndex]}.webp`;
  }
}
