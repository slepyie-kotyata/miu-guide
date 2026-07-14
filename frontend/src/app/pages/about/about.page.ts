import {Component} from '@angular/core';
import {IonContent} from '@ionic/angular/standalone';
import {environment} from 'src/environments/environment';
import {APP_LINKS} from 'src/app/constants/app-links';
import {ActionButtonComponent} from 'src/app/components/shared/action-button.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonContent, ActionButtonComponent]
})
export class AboutPage {

  readonly appVersion = environment.appVersion;
  readonly siteUrl = APP_LINKS.SITE;

  constructor() {
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
