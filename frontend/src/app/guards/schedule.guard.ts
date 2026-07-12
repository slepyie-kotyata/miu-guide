import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

export const scheduleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const navCtrl = inject(NavController);

  if (auth.isAuthenticated()) {
    return true;
  }

  navCtrl.navigateRoot('/login');
  return false;
};
