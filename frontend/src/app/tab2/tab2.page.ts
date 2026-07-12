import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonFooter, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonLabel, IonItem } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons'; 
import { caretBack, caretForward } from 'ionicons/icons'; 
import { ScheduleService } from '../services/schedule.service'; 
import { Lesson } from '../models/schedule.model'; 

interface WeekDay {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonContent, IonIcon, CommonModule, IonSpinner, IonLabel, IonItem, IonFooter] 
})
export class Tab2Page implements OnInit {
  lessons: Lesson[] = []; 
  isLoading: boolean = true;
  errorMessage: string | null = null;
isEmpty: boolean = false;

  currentBaseDate: Date = new Date(); 
  weekDays: WeekDay[] = []; 
  activeDayIndex: number = 0; 

  weekType: string = '';
  dateRange: string = '';
  groupId = 150; 

  constructor(private scheduleService: ScheduleService) {
    addIcons({ caretBack, caretForward });
  }

ngOnInit() {
  this.generateWeek(this.currentBaseDate);
  
  let todayIndex = this.currentBaseDate.getDay() - 1;
  if (todayIndex === -1) todayIndex = 6;
  
  this.activeDayIndex = todayIndex;
  
  this.selectDay(this.activeDayIndex); 
}
  formatDateStr(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  }

  generateWeek(baseDate: Date) {
    this.weekDays = [];
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']; 
    
    const dateCopy = new Date(baseDate.getTime());
    
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateCopy.setDate(diff));

    const sunday = new Date(monday.getTime());
    sunday.setDate(monday.getDate() + 6);

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday.getTime());
      nextDay.setDate(monday.getDate() + i);
      this.weekDays.push({
        name: dayNames[i],
        date: nextDay
      });
    }

    const weekNum = this.getWeekNumber(monday);
    const parityStr = (weekNum % 2 === 0) ? 'Четная неделя' : 'Нечетная неделя';  
    const dateRangeStr = `${this.formatDateStr(monday)}-${this.formatDateStr(sunday)}`;

    this.weekType = (weekNum % 2 === 0) ? 'Четная неделя' : 'Нечетная неделя';
    this.dateRange = `${this.formatDateStr(monday)}-${this.formatDateStr(sunday)}`;
}

  prevWeek() {
    this.currentBaseDate.setDate(this.currentBaseDate.getDate() - 7);
    this.generateWeek(this.currentBaseDate);
    this.selectDay(this.activeDayIndex);
  }

  nextWeek() {
    this.currentBaseDate.setDate(this.currentBaseDate.getDate() + 7);
    this.generateWeek(this.currentBaseDate);
    this.selectDay(this.activeDayIndex); 
  }

  getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  }

  // tab2.page.ts

selectDay(index: number) {
  this.activeDayIndex = index;
  this.isLoading = true;
  this.errorMessage = null; 
  
  const targetDate = this.weekDays[index].date;
  const dateString = targetDate.toISOString().split('T')[0].replace(/-/g, '.');   

 this.scheduleService.getDaySchedule(this.groupId, dateString).subscribe({
  next: (data) => {
    this.lessons = Array.isArray(data) ? data : []; 
    this.isLoading = false;
  },
  error: (err) => {
    console.error('Ошибка загрузки', err);
    this.errorMessage = 'Ошибка сервера. Попробуйте обновить страницу.';
    this.lessons = []; 
    this.isLoading = false;
  }
});
}

  loadSchedule() {
  this.isLoading = true;
  this.errorMessage = null; 
  this.isEmpty = false;    

  this.scheduleService.getDaySchedule(39, '2026.09.08').subscribe({
    next: (data) => {
      this.isLoading = false;
      this.lessons = data;
      this.isEmpty = data.length === 0;
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = 'Что-то пошло не так. Попробуйте позже.';
      this.lessons = []; 
    }
  });
}
}