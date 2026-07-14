import {inject} from '@angular/core';
import {CanActivateFn} from '@angular/router';
import {NavController} from '@ionic/angular/standalone';
import {AuthService} from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const navCtrl = inject(NavController);

  if (auth.isAuthenticated()) {
    return true;
  }

  navCtrl.navigateForward('/login');
  return false;
};
