import {Component, EnvironmentInjector, inject} from '@angular/core';
import {IonIcon, IonTabBar, IonTabButton, IonTabs} from '@ionic/angular/standalone';
import {UserService} from "../../services/user.service";
import {AssistantDialogService} from 'src/app/services/assistant';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  private userService = inject(UserService);
  public dialogService = inject(AssistantDialogService);

  constructor() {
    this.userService.loadUser();
  }
}
