import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [IonIcon],
  template: `
    <button class="action-copy-btn" type="button" (click)="clicked.emit($event)">
      @if (icon) {
        <ion-icon [name]="icon"></ion-icon>
      }
      <span>{{ label }}</span>
    </button>
  `,
  styles: [`
    .action-copy-btn {
      width: 100%;
      background: var(--miu-yellow-card);
      color: var(--miu-text-dark);
      border: none;
      border-radius: 14px;
      padding: 14px;
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: var(--miu-card-shadow-yellow);
      transition: background-color 0.2s ease, transform 0.1s ease;
      cursor: pointer;

      ion-icon {
        font-size: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        color: var(--miu-text-dark);
        flex-shrink: 0;
      }

      span {
        display: inline-block;
        line-height: 1;
      }

      &:active {
        background: var(--miu-yellow);
        transform: scale(0.98);
      }
    }
  `],
})
export class ActionButtonComponent {
  @Input() label = '';
  @Input() icon = '';
  @Output() clicked = new EventEmitter<Event>();
}
