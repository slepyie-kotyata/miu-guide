import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  signal,
  untracked
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {IonButton, IonButtons, IonContent, IonHeader, IonModal, IonToolbar} from '@ionic/angular/standalone';
import {AssistantCatComponent} from '../../components/assistant-cat/assistant-cat.component';
import {AssistantDialogService} from '../../services/assistant';
import {HapticsService} from '../../services/capacitor/haptics.service';
import {ImpactStyle} from '@capacitor/haptics';
import {ROOMS_DATA} from 'src/app/data/map-data';
import {SearchService} from "../../services/search.service";
import {UserService} from "../../services/user.service";
import {firstValueFrom} from "rxjs";


@Component({
  selector: 'app-page-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
  standalone: true,
  imports: [IonContent, AssistantCatComponent, IonModal, IonHeader, IonButton, IonButtons, IonToolbar],
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
  arrowLeft = signal<string>('50%');

  isMajorModalOpen = signal<boolean>(false);
  majorEvents = signal<string[]>([]);
  userMajorName = signal<string>('');

  private el = inject(ElementRef);
  private haptics = inject(HapticsService);
  private sanitizer = inject(DomSanitizer);
  private dialogService = inject(AssistantDialogService);
  private searchService = inject(SearchService);
  private userService = inject(UserService)

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
      const dialogFloor = this.dialogService.currentFloor();
      const isDialogActive = this.dialogService.currentMessage() !== null;

      untracked(() => {
        if (isDialogActive) {
          if (this.currentFloor() !== dialogFloor) {
            this.currentFloor.set(dialogFloor);
            this.triggerMapReset();
          }
        }
      });
    });
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
      }
setTimeout(() => {
        const svgEl = this.el.nativeElement.querySelector('.map-container svg') as SVGSVGElement;
        if (!svgEl) return;

        svgEl.querySelectorAll('.place-active').forEach((el: Element) => {
          el.classList.remove('place-active');
        });

        if (highlightId) {
          const target = svgEl.querySelector(`#${highlightId}_place`) as SVGGraphicsElement;
          
          if (target) {
            target.classList.add('place-active');
            console.log(`Подсветка онбординга применена к: ${highlightId}_place`);

            try {
              const bbox = target.getBBox();
              const viewBox = svgEl.viewBox.baseVal;
              
              let originX = 50;
              let originY = 50;

              if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
                const centerX = bbox.x + bbox.width / 2;
                const centerY = bbox.y + bbox.height / 2;

                originX = ((centerX - viewBox.x) / viewBox.width) * 100;
                originY = ((centerY - viewBox.y) / viewBox.height) * 100;
              }

              const scale = 2; 

              const translateX = -(originX - 50) * scale;
              const translateY = -(originY - 50) * scale;

              svgEl.style.transition = 'transform 0.8s ease-in-out'; 
              svgEl.style.transformOrigin = '50% 50%'; 
              
              svgEl.style.transform = `translate(${translateX}%, ${translateY}%) scale(${scale})`;
              
            } catch (e) {
              console.warn('Ошибка при попытке зазумить SVG:', e);
            }

          } else {
            console.error(`Элемент с ID ${highlightId}_place не найден в SVG!`);
          }
        } else {
          svgEl.style.transition = 'transform 0.8s ease-in-out';
          svgEl.style.transformOrigin = '50% 50%';
          svgEl.style.transform = 'translate(0%, 0%) scale(1)';
        }
      }, 150);
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

  async showInfo() {
    let userMajor = this.userService.userSignal()?.major;
    if (!userMajor) {
      userMajor = localStorage.getItem('major') || '';
      if (!userMajor) {
        console.error('Не удалось определить направление подготовки.');
        return;
      }
    }

    try {
      const events = await firstValueFrom(this.searchService.getMajorEvents(userMajor));
      this.majorEvents.set(events);
      this.userMajorName.set(userMajor);
      this.isMajorModalOpen.set(true);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
    }
  }

  parseEvent(item: string): { time: string; title: string } {
    if (!item) return {time: '', title: ''};

    // Разделяем строку строго по длинному тире "—"
    const parts = item.split('—');

    if (parts.length > 1) {
      return {
        time: parts[0].trim(),
        title: parts[1].trim()
      };
    }

    const fallbackParts = item.split(/\s+-\s+(?![0-9])/);
    if (fallbackParts.length > 1) {
      return {
        time: fallbackParts[0].trim(),
        title: fallbackParts[1].trim()
      };
    }

    return {time: '', title: item};
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

  private changeFloor(floor: number) {
    if (this.currentFloor() !== floor) {
      this.currentFloor.set(floor);
      this.triggerMapReset();
      console.log(`[ЭТАЖ] Переключено на этаж: ${floor}`);
    }
  }
}
