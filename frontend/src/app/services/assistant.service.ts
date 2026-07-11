import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router'; 
import { filter } from 'rxjs/operators';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'cat';
}

export interface DialogButton {
  text: string;
  action: () => void;
}

export interface DialogMessage {
  text: string;
  emotion: string;
  buttons?: DialogButton[];
}

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private catEmotionsList: string[] = [
    'miko-sit-eclosed-mclosed',
    'miko-sit-eopen-mclosed'
  ];

  private currentEmotionSubj = new BehaviorSubject<string>(this.getRandomEmotionPath());
  public currentEmotion$ = this.currentEmotionSubj.asObservable();
  
  private currentMessageSubj = new BehaviorSubject<DialogMessage | null>(null);
  public currentMessage$ = this.currentMessageSubj.asObservable();
  private messageQueue: DialogMessage[] = [];

  private isVisibleSubj = new BehaviorSubject<boolean>(false);
  public isVisible$ = this.isVisibleSubj.asObservable();
  private allowedPages = ['/tabs/tab1', '/tabs/tab2']; 

  private isChatOpenSubj = new BehaviorSubject<boolean>(false);
  public isChatOpen$ = this.isChatOpenSubj.asObservable();

  public conversation: ChatMessage[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkVisibility(event.urlAfterRedirects);
    });
  }

  private checkVisibility(currentUrl: string) {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      this.isVisibleSubj.next(true); 
    } else {
      const isAllowed = this.allowedPages.some(page => currentUrl.includes(page));
      this.isVisibleSubj.next(isAllowed);
    }
  }

  startOnboarding() {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeen) {
      this.isVisibleSubj.next(true); 
      this.playDialog([
        {
          text: 'Привет, я, Мико!<br>У тебя уже есть данные от личного кабинета?',
          emotion: 'miko-sit-eopen-mclosed',
          buttons: [
            {
              text: 'Да, войти',
              action: () => {
                this.closeDialog();
                this.router.navigate(['/login']);
              }
            },
            {
              text: 'Нет, выбрать направление',
              action: () => {
                this.playDialog([
                  {
                    text: 'Отлично! Тогда давай я помогу тебе определиться. Какое направление тебе ближе?',
                    emotion: 'miko-paw-eopen-mclosed_1',
                    buttons: [] 
                  },
                  {
                    text: 'Обучение завершено! Теперь я буду жить на карте.',
                    emotion: 'miko-sit-eopen-mclosed',
                    buttons: [
                      {
                        text: 'Понятно',
                        action: () => {
                          localStorage.setItem('hasSeenOnboarding', 'true');
                          this.closeDialog();
                          this.checkVisibility(this.router.url); 
                        }
                      }
                    ]
                  }
                ]);
              }
            }
          ]
        }
      ]);
    }
  }

  playDialog(messages: DialogMessage[]) {
    this.closeChat(); 
    this.messageQueue = messages;
    this.showNextMessage();
  }

  showNextMessage() {
    if (this.messageQueue.length > 0) {
      const nextMsg = this.messageQueue.shift()!;
      this.currentMessageSubj.next(nextMsg);
      this.currentEmotionSubj.next(`/assets/cat/${nextMsg.emotion}.webp`);
    } else {
      this.closeDialog();
    }
  }

  closeDialog() {
    this.currentMessageSubj.next(null);
  }

  handleScreenTap() {
    const current = this.currentMessageSubj.getValue();
    if (current && (!current.buttons || current.buttons.length === 0)) {
      this.showNextMessage();
    }
  }

  randomizeEmotion() {
    this.currentEmotionSubj.next(this.getRandomEmotionPath());
  }

  private getRandomEmotionPath(): string {
    const randomIndex = Math.floor(Math.random() * this.catEmotionsList.length);
    return `/assets/cat/${this.catEmotionsList[randomIndex]}.webp`;
  }

handleCatClick() {
    if (this.currentMessageSubj.getValue()) return;
    
    const isOpening = !this.isChatOpenSubj.getValue();
    this.isChatOpenSubj.next(isOpening);
    if (isOpening && this.conversation.length === 0) {
      this.conversation.push({ 
        text: 'Мяу! Что ты хочешь узнать?', 
        sender: 'cat' 
      });
    }
  }
closeChat() {
    this.isChatOpenSubj.next(false);
    this.conversation = []; 
  }

sendQuestion(question: string) {
    if (!question.trim()) return;
    
    this.conversation.push({ text: question, sender: 'user' });
    
    setTimeout(() => {
      this.conversation.push({ 
        text: 'Мяу! Я пока учусь, но скоро смогу ответить на этот вопрос.', 
        sender: 'cat' 
      });
    }, 500);
  }
}