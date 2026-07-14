import {Component, inject, OnInit} from '@angular/core';
import {IonApp, IonRouterOutlet} from '@ionic/angular/standalone';
import {AssistantDialogService, AssistantVisibilityService} from './services/assistant';
import {StatusBarService} from './services/capacitor/status-bar.service';
import {KeyboardService} from './services/capacitor/keyboard.service';
import {AssistantCatComponent} from './components/assistant-cat/assistant-cat.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, AssistantCatComponent],
})
export class AppComponent implements OnInit {
  private assistantDialogService = inject(AssistantDialogService);
  private visibilityService = inject(AssistantVisibilityService);
  private statusBarService = inject(StatusBarService);
  private keyboardService = inject(KeyboardService);

  ngOnInit() {
    this.statusBarService.setup();
    this.keyboardService.setup();
    this.assistantDialogService.startOnboarding();
    this.visibilityService.setVisible(true);
  }
}
