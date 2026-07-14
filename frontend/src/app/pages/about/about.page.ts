import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonContent} from '@ionic/angular/standalone';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class AboutPage {

  constructor() {
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
