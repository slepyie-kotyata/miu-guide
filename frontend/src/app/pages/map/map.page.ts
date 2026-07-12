import { Component, signal, computed, inject, effect} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { 
  IonContent, 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton 
} from '@ionic/angular/standalone';
import { AssistantCatComponent } from '../../components/assistant-cat/assistant-cat.component';
import { HapticsService } from '../../services/capacitor/haptics.service';
import { ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-page-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
  standalone: true,
  imports: [IonContent, 
    AssistantCatComponent,
    IonModal, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapPage {
  showMap = signal<boolean>(true);
  currentFloor = signal<number>(1);
  currentMode = signal<'ГК' | 'ЗП'>('ГК');

  svgContent = signal<SafeHtml | null>(null);
  selectedRoomId = signal<string | null>(null);
  isModalOpen = signal<boolean>(false);

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
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      this.loadSvg(this.mapImage());
    });
  }

  async loadSvg(url: string) {
    try {
      const response = await fetch(url);
      const svgText = await response.text();
      this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(svgText));
    } catch (error) {
      console.error('Ошибка при загрузке SVG:', error);
    }
  }

onMapClick(event: MouseEvent) {
    const target = event.target as Element;
    const clickedElement = target.closest('[id]');
    
    if (clickedElement) {
      const id = clickedElement.id;
      
      if (id !== 'map-root' && !id.startsWith('ion-')) {
        console.log('📍 Клик по кабинету:', id);
        this.haptics.impact(ImpactStyle.Light);
        
        this.selectedRoomId.set(id);
        this.isModalOpen.set(true);
      }
    }
  }

  closeRoomModal() {
    this.isModalOpen.set(false);
    // Небольшая задержка, чтобы текст не пропадал до окончания анимации закрытия
    setTimeout(() => this.selectedRoomId.set(null), 300);
  }

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
