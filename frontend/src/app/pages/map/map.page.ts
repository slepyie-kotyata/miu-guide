import { Component, signal, computed, inject } from '@angular/core';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { AssistantCatComponent } from '../../components/assistant-cat/assistant-cat.component';
import { HapticsService } from '../../services/capacitor/haptics.service';
import { ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-page-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
  standalone: true,
  imports: [IonContent, AssistantCatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapPage {
  showMap = signal<boolean>(true);
  currentFloor = signal<number>(1);
  currentMode = signal<'ГК' | 'ЗП'>('ГК');

  readonly currentFloors = computed(() =>
    this.currentMode() === 'ГК' ? [6, 5, 4, 3, 2, 1] : [4, 3, 2, 1],
  );

  readonly mapTitle = computed(() =>
    this.currentMode() === 'ГК' ? 'Карта: Главный корпус' : 'Карта: Зельев переулок',
  );

  readonly mapImage = computed(() => {
    const subFolder = this.currentMode() === 'ГК' ? 'maps_1' : 'maps_2';
    return `/assets/maps/${subFolder}/map_${this.currentFloor()}.svg`;
  });

  private haptics = inject(HapticsService);

  showInfo() {
    console.log('Открыто инфо на карте');
  }

  selectFloor(floor: number) {
    this.haptics.selection();
    this.currentFloor.set(floor);
    this.triggerMapReset();
  }

  toggleMode() {
    this.haptics.impact(ImpactStyle.Medium);
    this.currentMode.update((mode) => (mode === 'ГК' ? 'ЗП' : 'ГК'));
    this.currentFloor.set(1);
    this.triggerMapReset();
  }

  triggerMapReset() {
    this.showMap.set(false);
    setTimeout(() => {
      this.showMap.set(true);
    }, 10);
  }
}
