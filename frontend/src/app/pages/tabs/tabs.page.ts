import {Component, inject} from '@angular/core';
import {IonIcon, IonTabBar, IonTabButton, IonTabs} from '@ionic/angular/standalone';
import {UserService} from "../../services/user.service";
import {AssistantVisibilityService} from 'src/app/services/assistant';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon],
})
export class TabsPage {
  private userService = inject(UserService);
  readonly visibilityService = inject(AssistantVisibilityService);

  constructor() {
    this.userService.loadUser();
  }
}
