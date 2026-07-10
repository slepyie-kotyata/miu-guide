import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons'; 
import { caretBack, caretForward } from 'ionicons/icons'; 
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [ IonContent, IonIcon]
})
export class Tab2Page {

  constructor() {
    addIcons({ caretBack, caretForward });
  }

}
