import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantService } from '../../services/assistant.service';

@Component({
  selector: 'app-assistant-cat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cat-wrapper" *ngIf="assistantService.isVisible$ | async">
      
      <div 
        class="backdrop" 
        *ngIf="assistantService.currentMessage$ | async"
        (click)="assistantService.handleScreenTap()">
      </div>

      <div 
        class="speech-bubble" 
        *ngIf="assistantService.currentMessage$ | async as message"
        (click)="assistantService.handleScreenTap()">
        <p class="dialog-text" [innerHTML]="message.text"></p>
        <div class="dialog-buttons" *ngIf="message.buttons && message.buttons.length > 0">
          <button 
            *ngFor="let btn of message.buttons" 
            class="dialog-btn" 
            (click)="btn.action(); $event.stopPropagation()">
            {{ btn.text }}
          </button>
        </div>
      </div>
      
<div class="chat-backdrop" *ngIf="assistantService.isChatOpen$ | async" (click)="assistantService.closeChat()"></div>

      <div class="speech-bubble chat-mode" *ngIf="assistantService.isChatOpen$ | async">
        <button class="close-icon" (click)="assistantService.closeChat()">×</button>
        
        <div class="chat-history" #chatScroll>
            <div *ngFor="let msg of assistantService.conversation" 
                [class]="'message-bubble ' + (msg.sender === 'user' ? 'user-msg' : 'cat-msg')">
                {{ msg.text }}
            </div>
        </div>
        <div class="input-container">
          <input type="text" placeholder="Спроси меня..." class="chat-input" #chatInput
       (keyup.enter)="onSendMessage(chatInput.value); chatInput.value = ''" />
            <button class="send-btn" 
                    (click)="onSendMessage(chatInput.value); chatInput.value = ''">
            ➤
            </button>
        </div>
      </div>

      <img [src]="assistantService.currentEmotion$ | async" class="cat-img" alt="Мико" (click)="assistantService.handleCatClick()"/>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      pointer-events: none; 
    }

    .cat-wrapper {
        position: absolute;
        bottom: 30px; 
        left: -5px;
        width: 140px;
        z-index: 1005;
        pointer-events: none;
        }

    .backdrop {
      position: fixed; 
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      z-index: -2; 
      pointer-events: auto; 
    }

    .chat-backdrop {
      position: fixed; 
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: transparent;
      z-index: -2; 
      pointer-events: auto; 
    }

        .speech-bubble {
      position: absolute;
      bottom: 170px; 
      left: 20px;
      width: 80vw;
      background: #FFFFFF;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
      z-index: -1;
      pointer-events: auto;
    }

    .speech-bubble.chat-mode {
      max-height: 70vh; 
      display: flex;
      flex-direction: column;
      overflow: hidden; 
    }

.chat-history {
      flex: 1; 
      overflow-y: auto; 
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
      padding-right: 5px;
      min-height: 50px; 
    }

        .user-message {
      background: #f4f4f4;
      padding: 8px;
      border-radius: 8px;
      margin-bottom: 5px;
      font-size: 13px;
      color: #333;
      border-left: 3px solid #fbc02d; 
    }

    .speech-bubble::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 30px; 
      border-width: 10px 10px 0;
      border-style: solid;
      border-color: #FFFFFF transparent transparent transparent;
      display: block;
      width: 0;
    }

    .message-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      max-width: 85%;
      position: relative;
    }
    .user-msg {
      align-self: flex-end;
      background: #fce473; 
      color: #333;
    }

    .cat-msg {
      align-self: flex-start;
      background: #f4f4f4;
      color: #000;
    }

    .dialog-text {
      font-size: 14px;
      line-height: 1.4;
      color: #000;
      margin: 0 0 16px 0;
      font-family: sans-serif; 
    }

    .dialog-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .dialog-btn {
      background: #FFFFFF;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
      text-align: left;
    }

    .close-icon {
      position: absolute;
      top: 8px;
      right: 12px;
      background: none;
      border: none;
      font-size: 20px;
      color: #999;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .close-icon:active {
      color: #333;
    }

    .input-container {
      flex-shrink: 0;
      display: flex;
      gap: 8px;
    }

    .chat-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }

    .chat-input:focus {
      border-color: #fca311; 
    }

    .send-btn {
      background: #333;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0 12px;
      cursor: pointer;
      font-size: 14px;
    }

    .send-btn:active {
      background: #555;
    }

    .cat-img {
      left: -5px;
      bottom: 50px;
      width: 100%;
      height: auto;
      pointer-events: auto;
      cursor: pointer;
    }
  `]
})
export class AssistantCatComponent {
    @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  constructor(public assistantService: AssistantService) {}
onSendMessage(text: string) {
    if (!text.trim()) return;

    this.assistantService.sendQuestion(text);

    setTimeout(() => this.scrollToBottom(), 100);

    setTimeout(() => this.scrollToBottom(), 550);
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatScrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch(err) {
      console.error('Не удалось прокрутить чат', err);
    }
  }
}