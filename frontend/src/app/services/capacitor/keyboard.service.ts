import {Injectable} from '@angular/core';
import {Capacitor} from '@capacitor/core';
import {Keyboard, KeyboardResize} from '@capacitor/keyboard';

@Injectable({providedIn: 'root'})
export class KeyboardService {
  async setup(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Keyboard.setResizeMode({mode: KeyboardResize.Native});
    } catch (err) {
      console.error('Keyboard setup error:', err);
    }
  }
}
