import { Component, signal, ElementRef, computed, inject, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { AssistantCatComponent } from '../../components/assistant-cat/assistant-cat.component';
import { AssistantDialogService } from '../../services/assistant/assistant-dialog.service';
import { HapticsService } from '../../services/capacitor/haptics.service';
import { ImpactStyle } from '@capacitor/haptics';
import { ROOMS_DATA } from 'src/app/data/map-data';

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

  svgContent = signal<SafeHtml | null>(null);
  selectedRoomId = signal<string | null>(null);
  isModalOpen = signal<boolean>(false);
  activeRoomId = signal<string | null>(null);

  tooltipTop = signal<number>(0);
  tooltipLeft = signal<number>(0);
  tooltipWidth = signal<string>('280px'); 
  arrowLeft = signal<string>('50%'); 
  
  private el = inject(ElementRef);
  private haptics = inject(HapticsService);
  private sanitizer = inject(DomSanitizer);
  private dialogService = inject(AssistantDialogService);

  readonly roomData = computed(() => {
    const id = this.selectedRoomId();
    return id ? ROOMS_DATA[id] : null;
  });

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

  constructor() {
    effect(() => {
      this.loadSvg(this.mapImage());
    });

effect(() => {
    const activeId = this.activeRoomId(); 
    
    setTimeout(() => {
      const svgElement = document.querySelector('.map-container svg');
      
      if (!svgElement) {
        console.warn('SVG не найден в DOM');
        return;
      }

      svgElement.querySelectorAll('.place-active').forEach((el) => {
        el.classList.remove('place-active');
      });

      if (activeId) {
        const target = svgElement.querySelector(`#${activeId}_place`);
        if (target) {
          target.classList.add('place-active');
          console.log(`Подсветка применена к: ${activeId}_place`);
        } else {
          console.error(`Элемент с ID ${activeId}_place не найден в SVG!`);
        }
      }
    }); 
  });

  effect(() => {
    const highlightId = this.dialogService.highlightId();
    const svg = this.svgContent();

    if (highlightId) {
      if (this.currentMode() !== 'ГК') {
        this.currentMode.set('ГК');
      }
      if (this.currentFloor() !== 1) {
        this.currentFloor.set(1);
      }
    }

    setTimeout(() => {
      const svgEl = this.el.nativeElement.querySelector('.map-container svg');
      if (!svgEl) return;

      svgEl.querySelectorAll('.place-active').forEach((el: Element) => {
        el.classList.remove('place-active');
      });

      if (highlightId) {
        const target = svgEl.querySelector(`#${highlightId}_place`);
        if (target) {
          target.classList.add('place-active');
          console.log(`Подсветка онбординга применена к: ${highlightId}_place`);
        } else {
          console.error(`Элемент с ID ${highlightId}_place не найден в SVG!`);
        }
      }
    });
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
  const clickedPoint = target.closest('[id$="_point"]');
  
  if (clickedPoint) {
    const cleanId = clickedPoint.id.replace('_point', '');
    
    const wrapper = target.closest('.map-wrapper') as HTMLElement;
    if (wrapper) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const pointRect = clickedPoint.getBoundingClientRect();

      const scale = wrapperRect.width / wrapper.offsetWidth;

      const localTop = (pointRect.top - wrapperRect.top) / scale;
      const localLeft = (pointRect.left - wrapperRect.left + (pointRect.width / 2)) / scale;

      this.tooltipTop.set(localTop);
      this.tooltipLeft.set(localLeft);
    }

    this.activeRoomId.set(cleanId);
    this.selectedRoomId.set(cleanId);
    this.isModalOpen.set(true);
    
    this.haptics.impact(ImpactStyle.Light);
  }
}

ionViewWillLeave() {
    this.closeRoomModal();
  }
  closeRoomModal() {
    this.isModalOpen.set(false);
    this.activeRoomId.set(null); 
    setTimeout(() => this.selectedRoomId.set(null), 300);
  }

  showInfo() {
    console.log('Открыто инфо на карте');
  }

  selectFloor(floor: number) {
    this.haptics.selection();
    this.currentFloor.set(floor);
    this.triggerMapReset();
    this.closeRoomModal();
  }

  toggleMode() {
    this.haptics.impact(ImpactStyle.Medium);
    this.currentMode.update((mode) => (mode === 'ГК' ? 'ЗП' : 'ГК'));
    this.currentFloor.set(1);
    this.triggerMapReset();
    this.closeRoomModal();
  }

  triggerMapReset() {
    this.showMap.set(false);
    setTimeout(() => {
      this.showMap.set(true);
    }, 10);
  }

  
}