import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' // Сервис глобальный, один на всё приложение
})
export class AssistantService {
  // Твои названия файлов
  private catEmotionsList: string[] = [
    'miko-paw-eopen-mclosed_1',
    'miko-sit-eopen-mclosed'
  ];

  // BehaviorSubject хранит текущий путь к картинке и автоматически обновляет компонент
  private currentEmotionSubj = new BehaviorSubject<string>(this.getRandomEmotionPath());
  public currentEmotion$ = this.currentEmotionSubj.asObservable();

  constructor() {}

  // Метод для обновления эмоции (будем вызывать при входе на страницу)
  randomizeEmotion() {
    this.currentEmotionSubj.next(this.getRandomEmotionPath());
  }

  // Внутренняя логика рандома
  private getRandomEmotionPath(): string {
    const randomIndex = Math.floor(Math.random() * this.catEmotionsList.length);
    return `/assets/cat/${this.catEmotionsList[randomIndex]}.webp`;
  }

  // Вся логика кликов и будущих диалогов будет здесь
  handleCatClick() {
    console.log('Мяу! Логика клика теперь в сервисе.');
    // Позже здесь мы будем проверять:
    // 1. Был ли уже стартовый диалог?
    // 2. Кто этот пользователь?
    // 3. Открывать модальное окно.
  }
}