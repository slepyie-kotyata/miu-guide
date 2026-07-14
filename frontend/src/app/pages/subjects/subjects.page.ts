import {Component, inject} from '@angular/core';
import {IonBackButton, IonButtons, IonContent, IonHeader, IonToolbar} from "@ionic/angular/standalone";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton
  ]
})
export class SubjectsPage {

  private userService = inject(UserService);
  protected userSubjects = this.userService.userSubjectsSignal();

  constructor() {
  }

}
