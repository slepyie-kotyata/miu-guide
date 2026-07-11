import { Component } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class LoginPage {
  username = '';
  password = '';

  constructor(private navCtrl: NavController, private auth: AuthService) {}

  
  login() {
    if (this.auth.login(this.username, this.password)) {
      this.navCtrl.navigateRoot('/tabs'); // Переход во вкладки
    } else {
      alert('Неверный логин или пароль');
    }
  }

guestLogin() {
    // Перекидываем пользователя на карту (tab1)
    // Убедись, что путь к твоей карте именно '/tabs/tab1'
    this.navCtrl.navigateRoot('/tabs/tab1'); 
  }
}