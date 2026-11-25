import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <i [ngClass]="iconClass"></i>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() value = '';
  @Input() type: 'vehicule' | 'client' | 'location' = 'vehicule';

  get label(): string {
    return this.value || 'N/A';
  }

  get badgeClass(): string {
    const val = (this.value || '').toUpperCase();
    if (this.type === 'vehicule') {
      if (val === 'DISPONIBLE') return 'badge-disponible';
      if (val === 'LOUE') return 'badge-loue';
      if (val === 'MAINTENANCE') return 'badge-maintenance';
    } else if (this.type === 'client') {
      if (val === 'VIP') return 'badge-vip';
      if (val === 'FIDELE') return 'badge-fidele';
      return 'badge-standard';
    } else if (this.type === 'location') {
      if (val === 'RESERVEE') return 'badge-info';
      if (val === 'EN_COURS') return 'badge-warning';
      if (val === 'TERMINEE') return 'badge-success';
      if (val === 'ANNULEE') return 'badge-standard';
    }
    return 'badge-standard';
  }

  get iconClass(): string {
    const val = (this.value || '').toUpperCase();
    if (val === 'DISPONIBLE' || val === 'TERMINEE') return 'ri-checkbox-circle-line';
    if (val === 'LOUE' || val === 'EN_COURS') return 'ri-time-line';
    if (val === 'MAINTENANCE') return 'ri-tools-line';
    if (val === 'VIP') return 'ri-vip-crown-fill';
    if (val === 'FIDELE') return 'ri-medal-fill';
    if (val === 'RESERVEE') return 'ri-calendar-check-line';
    if (val === 'ANNULEE') return 'ri-close-circle-line';
    return 'ri-information-line';
  }
}
