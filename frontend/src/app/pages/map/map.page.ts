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
import {SafeHtml} from '@angular/platform-browser';
import {IonButton, IonButtons, IonContent, IonHeader, IonModal, IonToolbar} from '@ionic/angular/standalone';
import {AssistantDialogService} from '../../services/assistant';
import {HapticsService} from '../../services/capacitor/haptics.service';
import {ImpactStyle} from '@capacitor/haptics';
import {ROOMS_DATA} from 'src/app/data/map-data';
import {SearchService} from '../../services/search.service';
import {UserService} from '../../services/user.service';
import {firstValueFrom} from 'rxjs';
import {MapSvgRenderService} from '../../services/map-svg-render.service';
import {parseEvent} from '../../utils/event-parser';

@Component({
  selector: 'app-page-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
  standalone: true,
  imports: [IonContent, IonModal, IonHeader, IonButton, IonButtons, IonToolbar],
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

  isMajorModalOpen = signal<boolean>(false);
  majorEvents = signal<string[]>([]);
  userMajorName = signal<string>('');

  private el = inject(ElementRef);
  private haptics = inject(HapticsService);
  private dialogService = inject(AssistantDialogService);
  private searchService = inject(SearchService);
  private userService = inject(UserService);
  private svgRender = inject(MapSvgRenderService);

  readonly parseEvent = parseEvent;

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
      const url = this.mapImage();
      this.svgRender.loadSvg(url).then(svg => {
        this.svgContent.set(svg);
        this.triggerMapReset();
      });
    });

    effect(() => {
      const activeId = this.activeRoomId();
      setTimeout(() => {
        this.svgRender.highlightRoom(this.el.nativeElement, activeId);
      });
    });

    effect(() => {
      const highlightId = this.dialogService.highlightId();

      if (highlightId && this.currentMode() !== 'ГК') {
        this.currentMode.set('ГК');
      }

      setTimeout(() => {
        this.svgRender.zoomToElement(this.el.nativeElement, highlightId);
      }, 150);
    });
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

  ionViewWillEnter() {
    this.triggerMapReset();
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
    const userMajor = this.userService.getMajor();
    if (!userMajor) return;

    try {
      const events = await firstValueFrom(this.searchService.getMajorEvents(userMajor));
      this.majorEvents.set(events);
      this.userMajorName.set(userMajor);
      this.isMajorModalOpen.set(true);
    } catch {
    }
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
