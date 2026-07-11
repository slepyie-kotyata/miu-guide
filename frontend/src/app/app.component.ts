import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AssistantService } from './services/assistant.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private assistantService: AssistantService) {}

ngOnInit() {
    // ВРЕМЕННАЯ СТРОЧКА ДЛЯ ТЕСТОВ (удаляет память о том, что мы видели диалог)
    localStorage.removeItem('hasSeenOnboarding');
    
    // Запуск проверки
    this.assistantService.startOnboarding();
  }
}
