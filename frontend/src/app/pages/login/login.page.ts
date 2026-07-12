import { Component, signal, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HapticsService } from '../../services/capacitor/haptics.service';
import { ImpactStyle, NotificationType } from '@capacitor/haptics';

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
  private haptics = inject(HapticsService);

async login() {
  this.error.set('');
  const credentials = { 
    login: this.username(), 
    password: this.password() 
  };

  try {
    await this.auth.login(credentials).toPromise();
    
    this.haptics.notification(NotificationType.Success);
    this.navCtrl.navigateRoot('/tabs/map');
  } catch (error: any) {
    if(error.status == 401){
      this.error.set('Неверный логин или пароль'); 
    }
    else{
      this.error.set('Ошибка соединения с сервером')
    }
    this.haptics.notification(NotificationType.Error);
  }
}

}
