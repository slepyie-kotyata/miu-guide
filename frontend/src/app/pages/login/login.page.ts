import {Component, inject, signal} from '@angular/core';
import {IonContent, NavController} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {HapticsService} from '../../services/capacitor/haptics.service';
import {NotificationType} from '@capacitor/haptics';
import {UserService} from "../../services/user.service";
import {firstValueFrom} from "rxjs";
import {AssistantChatService, AssistantDialogService} from 'src/app/services/assistant';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, FormsModule],
})
export class LoginPage {
  username = signal('');
  password = signal('');
  error = signal('');

  private navCtrl = inject(NavController);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private haptics = inject(HapticsService);
  private dialogService = inject(AssistantDialogService);
  private chatService = inject(AssistantChatService);

  async login() {
    this.error.set('');
    const credentials = {
      login: this.username(),
      password: this.password()
    };

    try {
      await firstValueFrom(this.auth.login(credentials));
      await firstValueFrom(this.userService.loadUser(true));

      await this.haptics.notification(NotificationType.Success);
      await this.navCtrl.navigateRoot('/tabs/map');
      if (this.userService.userSignal() && this.userService.userSignal()!.course > 1) {
        this.dialogService.finishOnboarding();
        this.chatService.handleCatClick();
      } else {
        this.dialogService.startOnboarding(7);
      }

    } catch (error: any) {
      if (error.status == 401) {
        this.error.set('Неверный логин или пароль');
      } else {
        this.error.set('Ошибка соединения с сервером')
      }
      await this.haptics.notification(NotificationType.Error);
    }
  }

}
