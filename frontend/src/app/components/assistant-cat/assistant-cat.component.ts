import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantService } from '../../services/assistant.service';

@Component({
  selector: 'app-assistant-cat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Используем async пайп для автоматического получения пути из сервиса -->
    <img 
      [src]="assistantService.currentEmotion$ | async" 
      class="assistant-cat" 
      alt="Помощник" 
      (click)="onClick()" 
    />
  `,
  styles: [`
    .assistant-cat {
      position: absolute;
      bottom: 50px;
      left: -5px;
      width: 140px;
      height: auto;
      z-index: 1000;
      cursor: pointer;
      pointer-events: auto;
      transition: transform 0.1s ease-in-out;
    }
    .assistant-cat:active {
      transform: scale(0.95);
    }
  `]
})
export class AssistantCatComponent {
  // Подключаем наш сервис
  constructor(public assistantService: AssistantService) {}

  onClick() {
    this.assistantService.handleCatClick();
  }
}