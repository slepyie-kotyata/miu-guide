import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AssistantCatComponent } from '../components/assistant-cat/assistant-cat.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AssistantCatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab1Page {
  @ViewChild('pinchZoom') pinchZoom: any;  
  
  showMap: boolean = true;
  currentFloor: number = 1;
  currentMode: 'ГК' | 'ЗП' = 'ГК';



  constructor() {}
  get currentFloors(): number[] {
    return this.currentMode === 'ГК' ? [6, 5, 4, 3, 2, 1] : [4, 3, 2, 1];
  }
  get mapTitle(): string {
    return this.currentMode === 'ГК' ? 'Карта: Главный корпус' : 'Карта: Зельев переулок';
  }

  showInfo() {
    console.log('Открыто инфо на карте');
    // Логика открытия модалки
  }

  selectFloor(floor: number) {
    this.currentFloor = floor;
    this.triggerMapReset(); 
  }

  toggleMode() {
    this.currentMode = (this.currentMode === 'ГК') ? 'ЗП' : 'ГК';
    this.currentFloor = 1; 
    this.triggerMapReset(); 
  }

  triggerMapReset() {
    this.showMap = false;
    setTimeout(() => {
      this.showMap = true;
    }, 10);
  }

  getMapImage(): string {
    const subFolder = this.currentMode === 'ГК' ? 'maps_1' : 'maps_2';
    return `/assets/maps/${subFolder}/map_${this.currentFloor}.svg`;
  }
}