import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(toasts$ | async) as toasts">
      <div *ngFor="let t of toasts" class="toast toast-{{ t.type }}">
        <i *ngIf="t.type === 'success'" class="ri-checkbox-circle-fill"></i>
        <i *ngIf="t.type === 'error'" class="ri-error-warning-fill"></i>
        <i *ngIf="t.type === 'warning'" class="ri-alert-fill"></i>
        <i *ngIf="t.type === 'info'" class="ri-information-fill"></i>
        <span style="flex: 1;">{{ t.message }}</span>
        <button (click)="remove(t.id)" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem;">
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  remove(id: number) {
    this.toastService.remove(id);
  }
}
