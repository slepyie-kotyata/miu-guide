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

  private navCtrl = inject(NavController);
  private auth = inject(AuthService);
  private haptics = inject(HapticsService);

// Внутри LoginPage
async login() {
  const credentials = { 
    login: this.username(), 
    password: this.password() 
  };

  try {
    // Ждем ответ от сервера
    await this.auth.login(credentials).toPromise();
    
    // Если запрос прошел успешно (статус 200)
    this.haptics.notification(NotificationType.Success);
    this.navCtrl.navigateRoot('/tabs/map');
  } catch (error) {
    // Если ошибка (например, 401 Unauthorized)
    this.haptics.notification(NotificationType.Error);
    alert('Неверный логин или пароль');
  }
}

}
