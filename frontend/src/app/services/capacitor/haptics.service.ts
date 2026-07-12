import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  async impact(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.impact({ style });
    } catch (err) {
      console.error('Haptics impact error:', err);
    }
  }

  async notification(type: NotificationType = NotificationType.Success): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.notification({ type });
    } catch (err) {
      console.error('Haptics notification error:', err);
    }
  }

  async selection(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.selectionStart();
    } catch (err) {
      console.error('Haptics selection error:', err);
    }
  }
}
