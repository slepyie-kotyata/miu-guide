import { Component, OnInit, signal, computed, inject } from '@angular/core';

import { IonFooter, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { caretBack, caretForward } from 'ionicons/icons';
import { ScheduleService } from '../../services/schedule.service';
import { Lesson, WeekDay } from '../../models/schedule.model';
import { HapticsService } from '../../services/capacitor/haptics.service';
import { ImpactStyle } from '@capacitor/haptics';
import { formatDateStr, generateWeekDays, getWeekNumber, getMondayFromWeek, getSundayFromWeek } from '../../utils/date-utils';
import { AssistantCatComponent } from "src/app/components/assistant-cat/assistant-cat.component";

@Component({
  selector: 'app-page-schedule',
  templateUrl: 'schedule.page.html',
  styleUrls: ['schedule.page.scss'],
  imports: [IonContent, IonIcon, IonSpinner, IonFooter, AssistantCatComponent],
})
export class SchedulePage implements OnInit {
  lessons = signal<Lesson[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  currentBaseDate = signal<Date>(new Date());
  weekDays = signal<WeekDay[]>([]);
  activeDayIndex = signal<number>(0);

  readonly weekType = computed(() => {
    const monday = getMondayFromWeek(this.weekDays());
    if (!monday) return '';
    const weekNum = getWeekNumber(monday);
    return weekNum % 2 === 0 ? 'Четная неделя' : 'Нечетная неделя';
  });

  readonly dateRange = computed(() => {
    const monday = getMondayFromWeek(this.weekDays());
    const sunday = getSundayFromWeek(this.weekDays());
    if (!monday || !sunday) return '';
    return `${formatDateStr(monday)}-${formatDateStr(sunday)}`;
  });

  groupId = 150;

  private scheduleService = inject(ScheduleService);
  private haptics = inject(HapticsService);

  constructor() {
    addIcons({ caretBack, caretForward });
  }

  ngOnInit() {
    this.generateWeek(this.currentBaseDate());

    let todayIndex = this.currentBaseDate().getDay() - 1;
    if (todayIndex === -1) todayIndex = 6;

    this.activeDayIndex.set(todayIndex);
    this.selectDay(this.activeDayIndex());
  }

  generateWeek(baseDate: Date) {
    this.weekDays.set(generateWeekDays(baseDate));
  }

  prevWeek() {
    this.haptics.impact(ImpactStyle.Light);
    const newDate = new Date(this.currentBaseDate().getTime());
    newDate.setDate(newDate.getDate() - 7);
    this.currentBaseDate.set(newDate);
    this.generateWeek(newDate);
    this.selectDay(this.activeDayIndex());
  }

  nextWeek() {
    this.haptics.impact(ImpactStyle.Light);
    const newDate = new Date(this.currentBaseDate().getTime());
    newDate.setDate(newDate.getDate() + 7);
    this.currentBaseDate.set(newDate);
    this.generateWeek(newDate);
    this.selectDay(this.activeDayIndex());
  }

  selectDay(index: number) {
    this.haptics.selection();
    this.activeDayIndex.set(index);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const targetDate = this.weekDays()[index].date;
    const dateString = targetDate.toISOString().split('T')[0].replace(/-/g, '.');

    this.scheduleService.getDaySchedule(this.groupId, dateString).subscribe({
      next: (data) => {
        this.lessons.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки', err);
        this.errorMessage.set('Ошибка сервера. Попробуйте обновить страницу.');
        this.lessons.set([]);
        this.isLoading.set(false);
      },
    });
  }

  loadSchedule() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.scheduleService.getDaySchedule(39, '2026.09.08').subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.lessons.set(data);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Что-то пошло не так. Попробуйте позже.');
        this.lessons.set([]);
      },
    });
  }
}
