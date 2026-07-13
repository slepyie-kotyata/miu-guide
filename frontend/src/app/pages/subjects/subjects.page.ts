import {Component, inject} from '@angular/core';
import {IonContent} from "@ionic/angular/standalone";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
  imports: [
    IonContent
  ]
})
export class SubjectsPage {

  private userService = inject(UserService);
  protected userSubjects = this.userService.userSubjectsSignal();

  constructor() { }

}
