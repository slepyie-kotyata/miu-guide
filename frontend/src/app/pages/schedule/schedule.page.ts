import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';

import {IonContent, IonFooter, IonIcon, IonSpinner} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {caretBack, caretForward} from 'ionicons/icons';
import {ScheduleService} from '../../services/schedule.service';
import {Lesson, WeekDay} from '../../models/schedule.model';
import {HapticsService} from '../../services/capacitor/haptics.service';
import {ImpactStyle} from '@capacitor/haptics';
import {
  formatDateStr,
  formatApiDate,
  generateWeekDays,
  getMondayFromWeek,
  getSundayFromWeek,
  getWeekNumber
} from '../../utils/date-utils';
import {ChatNavigationService, ScheduleTargetDay} from '../../services/assistant/chat-navigation.service';
import {AssistantEmotionService} from '../../services/assistant/assistant-emotion.service';
import {EMOTION} from '../../services/assistant/assistant.models';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-page-schedule',
  templateUrl: 'schedule.page.html',
  styleUrls: ['schedule.page.scss'],
  imports: [IonContent, IonIcon, IonSpinner, IonFooter],
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
  private userService = inject(UserService);
  private scheduleService = inject(ScheduleService);
  private haptics = inject(HapticsService);
  private chatNavigation = inject(ChatNavigationService);
  private emotionService = inject(AssistantEmotionService);

  constructor() {
    addIcons({caretBack, caretForward});

    effect(() => {
      const pendingDay = this.chatNavigation.pendingScheduleDay();
      if (!pendingDay) return;

      this.applyScheduleDay(pendingDay);
      this.chatNavigation.consumePendingScheduleDay();
    });
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
    const dateString = formatApiDate(targetDate);

    this.scheduleService.getDaySchedule(this.userService.userSignal()!.group_id, dateString).subscribe({
      next: (data) => {
        this.lessons.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки', err);
        this.errorMessage.set('Ошибка сервера. Попробуйте обновить страницу.');
        this.lessons.set([]);
        this.isLoading.set(false);
        this.emotionService.setEmotion(EMOTION.SAD_ECLOSED_MCLOSED);
      },
    });
  }

  private applyScheduleDay(target: ScheduleTargetDay): void {
    const today = new Date();

    if (target === 'today') {
      this.currentBaseDate.set(new Date(today.getTime()));
    } else if (target === 'tomorrow') {
      const tomorrow = new Date(today.getTime());
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.currentBaseDate.set(tomorrow);
    }

    this.generateWeek(this.currentBaseDate());

    let dayIndex: number;
    if (target === 'today') {
      dayIndex = today.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6;
    } else if (target === 'tomorrow') {
      const tomorrow = new Date(today.getTime());
      tomorrow.setDate(tomorrow.getDate() + 1);
      dayIndex = tomorrow.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6;
    } else {
      dayIndex = this.activeDayIndex();
    }

    this.selectDay(dayIndex);
  }
}
