import {Component} from '@angular/core';
import {IonContent} from '@ionic/angular/standalone';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonContent]
})
export class AboutPage {

  readonly appVersion = environment.appVersion;

  constructor() {
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
