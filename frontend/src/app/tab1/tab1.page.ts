import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // 1. Импортируем схему

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule], // CommonModule нужен для *ngFor и [class.active]
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // 2. Добавляем эту строчку
})

export class Tab1Page {
  @ViewChild('pinchZoom') pinchZoom: any;  
  showMap: boolean = true;
  currentFloor: number = 1;
  currentMode: 'ГК' | 'ЗП' = 'ГК';
  // Список этажей (с 6 по 1, как на макете сверху вниз)
  get currentFloors(): number[] {
      return this.currentMode === 'ГК' ? [6, 5, 4, 3, 2, 1] : [4, 3, 2, 1];
    }
  get mapTitle(): string {
  return this.currentMode === 'ГК' ? 'Карта: Главный корпус' : 'Карта: Зельев переулок';
}

  constructor() {}

selectFloor(floor: number) {
    this.currentFloor = floor;
    this.triggerMapReset(); // Вызываем метод сброса
  }

// Переключение режима
  toggleMode() {
      this.currentMode = (this.currentMode === 'ГК') ? 'ЗП' : 'ГК';
      this.currentFloor = 1; // Сбрасываем этаж на 1 при смене корпуса
      this.triggerMapReset(); // Вызываем метод сброса
    }

// Универсальный метод для пересоздания карты
  triggerMapReset() {
    this.showMap = false;
    setTimeout(() => {
      this.showMap = true;
    }, 10);
  }
  // Динамически формируем путь к картинке в зависимости от этажа
getMapImage(): string {
  // Определяем название папки в зависимости от режима:
  // Если ГК — используем maps_1, если ЗП — используем maps_2
  const subFolder = this.currentMode === 'ГК' ? 'maps_1' : 'maps_2';
  
  // Возвращаем путь: /assets/maps/maps_X/map_Y.jpg
  return `/assets/maps/${subFolder}/map_${this.currentFloor}.svg`;
}
}