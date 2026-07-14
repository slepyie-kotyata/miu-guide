import {Injectable} from '@angular/core';
import {Capacitor} from '@capacitor/core';
import {StatusBar, Style} from '@capacitor/status-bar';

@Injectable({providedIn: 'root'})
export class StatusBarService {
  async setup(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.setOverlaysWebView({overlay: false});
      await StatusBar.setBackgroundColor({color: '#ffffff'});
      await StatusBar.setStyle({style: Style.Light});
    } catch (err) {
      console.error('StatusBar setup error:', err);
    }
  }
}
