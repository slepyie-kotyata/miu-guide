import { Component } from '@angular/core';
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
  // Список этажей (с 6 по 1, как на макете сверху вниз)
  floors: number[] = [6, 5, 4, 3, 2, 1];
  
  // Текущий выбранный этаж
  currentFloor: number = 1;

  constructor() {}

  // Метод для переключения этажа
  selectFloor(floor: number) {
    this.currentFloor = floor;
  }

  // Динамически формируем путь к картинке в зависимости от этажа
  getMapImage(): string {
    // Убедись, что в папке assets/maps/ лежат файлы map_1.png, map_2.png и т.д.
    return `/assets/maps_1/map_${this.currentFloor}.jpg`;
  }
}