import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationApiService } from '../../core/services/location.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { LocationItem, StatutLocation } from '../../models/location.model';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, ConfirmModalComponent],
  template: `
    <div class="locations-page">
      <div class="page-header">
        <div>
          <h1>Gestion des Locations</h1>
          <p>Suivi des réservations, prises en charge (départs) et retours des véhicules</p>
        </div>
        <a routerLink="/locations/new" class="btn btn-primary">
          <i class="ri-add-line"></i> Nouvelle Réservation
        </a>
      </div>

      <!-- ONGLETS DE FILTRE PAR STATUT -->
      <div class="status-tabs card">
        <button class="tab-btn" [class.active]="selectedStatut === ''" (click)="filterByStatut('')">
          Toutes <span class="tab-count">{{ locations.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="selectedStatut === 'RESERVEE'" (click)="filterByStatut('RESERVEE')">
          <i class="ri-bookmark-3-line"></i> Réservées <span class="tab-count">{{ countByStatut('RESERVEE') }}</span>
        </button>
        <button class="tab-btn" [class.active]="selectedStatut === 'EN_COURS'" (click)="filterByStatut('EN_COURS')">
          <i class="ri-roadster-line"></i> En Cours <span class="tab-count">{{ countByStatut('EN_COURS') }}</span>
        </button>
        <button class="tab-btn" [class.active]="selectedStatut === 'TERMINEE'" (click)="filterByStatut('TERMINEE')">
          <i class="ri-checkbox-circle-line"></i> Terminées <span class="tab-count">{{ countByStatut('TERMINEE') }}</span>
        </button>
        <button class="tab-btn" [class.active]="selectedStatut === 'ANNULEE'" (click)="filterByStatut('ANNULEE')">
          <i class="ri-close-circle-line"></i> Annulées <span class="tab-count">{{ countByStatut('ANNULEE') }}</span>
        </button>
      </div>

      <!-- TABLEAU DES CONTRATS -->
      <div class="card table-card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Réf</th>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Période Prévue</th>
                <th>Kilométrage</th>
                <th>Montant Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let loc of filteredLocations">
                <td><strong>#{{ loc.id }}</strong></td>
                <td>
                  <a [routerLink]="['/clients', loc.clientId]" style="font-weight: 600; text-decoration: none; color: var(--primary);">
                    {{ loc.client?.prenom }} {{ loc.client?.nom }}
                  </a>
                  <small style="display: block; color: var(--text-muted);">CIN: {{ loc.client?.cin }}</small>
                </td>
                <td>
                  <span style="font-weight: 600;">{{ loc.vehicule?.marque }} {{ loc.vehicule?.modele }}</span>
                  <small class="font-mono" style="display: block; color: var(--text-muted);">{{ loc.vehicule?.immatriculation }}</small>
                </td>
                <td>
                  <div>Du {{ loc.dateDebut | date:'dd/MM/yyyy' }}</div>
                  <div>Au {{ loc.dateFinPrevue | date:'dd/MM/yyyy' }} ({{ loc.nbJoursPrevus }} j)</div>
                  <span *ngIf="loc.enRetard" class="badge badge-danger" style="margin-top: 0.25rem;">
                    Retard +{{ loc.retardJours }} j
                  </span>
                </td>
                <td>
                  <div *ngIf="loc.kmDepart">Départ: {{ loc.kmDepart | number }} km</div>
                  <div *ngIf="loc.kmRetour">Retour: {{ loc.kmRetour | number }} km</div>
                  <small *ngIf="loc.distanceParcourue" class="text-success font-weight-bold">
                    Trajet: {{ loc.distanceParcourue | number }} km
                  </small>
                  <span *ngIf="!loc.kmDepart" style="color: var(--text-muted);">-</span>
                </td>
                <td>
                  <strong style="color: var(--primary); font-size: 1rem;">
                    {{ loc.montantTotal | currency:'EUR':'symbol':'1.2-2':'fr' }}
                  </strong>
                  <div *ngIf="loc.penalite > 0" style="color: var(--accent-danger); font-size: 0.75rem;">
                    dont {{ loc.penalite | currency:'EUR':'symbol':'1.2-2':'fr' }} pénalité
                  </div>
                </td>
                <td>
                  <app-status-badge [value]="loc.statut" type="location"></app-status-badge>
                </td>
                <td>
                  <div class="action-buttons">
                    <!-- Démarrer location si RESERVEE -->
                    <button *ngIf="loc.statut === 'RESERVEE'" class="btn btn-primary btn-sm" (click)="openDepartModal(loc)">
                      <i class="ri-play-line"></i> Départ
                    </button>

                    <!-- Retour si EN_COURS -->
                    <a *ngIf="loc.statut === 'EN_COURS'" [routerLink]="['/locations', loc.id, 'retour']" class="btn btn-success btn-sm">
                      <i class="ri-arrow-go-back-line"></i> Retour
                    </a>

                    <!-- Annuler si RESERVEE -->
                    <button *ngIf="loc.statut === 'RESERVEE'" class="btn btn-secondary btn-sm" (click)="askAnnulation(loc)">
                      <i class="ri-close-line"></i> Annuler
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredLocations.length === 0">
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                  Aucune location correspondant à ce filtre.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL DE DÉPART (KM DE DÉPART) -->
      <div class="modal-overlay" *ngIf="isDepartModalOpen" (click)="isDepartModalOpen = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="ri-car-fill text-primary"></i> Démarrer la location #{{ activeLocation?.id }}</h3>
            <button (click)="isDepartModalOpen = false" style="background: none; border: none; font-size: 1.25rem; cursor: pointer;">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Le véhicule va passer au statut <strong>LOUÉ</strong>. Veuillez confirmer le kilométrage de départ au compteur.</p>
            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">Kilométrage de départ (km) *</label>
              <input type="number" class="form-control" [(ngModel)]="kmDepartInput">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="isDepartModalOpen = false">Annuler</button>
            <button class="btn btn-primary" (click)="confirmDepart()" [disabled]="kmDepartInput < 0">
              Valider le départ
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL CONFIRMATION ANNULATION -->
      <app-confirm-modal
        [isOpen]="isCancelModalOpen"
        title="Annuler la réservation"
        [message]="cancelMessage"
        (confirm)="confirmAnnulation()"
        (cancel)="isCancelModalOpen = false">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .locations-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-tabs {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      border-radius: var(--radius-md);
      border: none;
      background: none;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .tab-btn:hover {
      background: #f1f5f9;
      color: var(--text-main);
    }

    .tab-btn.active {
      background: var(--primary);
      color: #ffffff;
    }

    .tab-count {
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      background: rgba(0, 0, 0, 0.08);
    }

    .tab-btn.active .tab-count {
      background: rgba(255, 255, 255, 0.25);
    }

    .font-mono {
      font-family: monospace;
      font-size: 0.8rem;
    }

    .text-success { color: var(--accent-success); }
    .font-weight-bold { font-weight: 600; }

    .action-buttons {
      display: flex;
      gap: 0.4rem;
    }
  `]
})
export class LocationListComponent implements OnInit {
  locations: LocationItem[] = [];
  filteredLocations: LocationItem[] = [];
  selectedStatut = '';

  isDepartModalOpen = false;
  activeLocation?: LocationItem;
  kmDepartInput = 0;

  isCancelModalOpen = false;
  locationToCancel?: LocationItem;
  cancelMessage = '';

  constructor(
    private locationService: LocationApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations() {
    this.locationService.getAll().subscribe({
      next: (data) => {
        this.locations = data;
        this.applyFilter();
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des locations');
      }
    });
  }

  filterByStatut(statut: string) {
    this.selectedStatut = statut;
    this.applyFilter();
  }

  applyFilter() {
    if (!this.selectedStatut) {
      this.filteredLocations = [...this.locations];
    } else {
      this.filteredLocations = this.locations.filter(l => l.statut === this.selectedStatut);
    }
  }

  countByStatut(statut: string): number {
    return this.locations.filter(l => l.statut === statut).length;
  }

  openDepartModal(loc: LocationItem) {
    this.activeLocation = loc;
    this.kmDepartInput = loc.vehicule?.kilometrage || 10000;
    this.isDepartModalOpen = true;
  }

  confirmDepart() {
    if (!this.activeLocation) return;
    this.locationService.demarrerLocation(this.activeLocation.id, { kmDepart: this.kmDepartInput }).subscribe({
      next: () => {
        this.toastService.success(`Location #${this.activeLocation!.id} démarrée. Le véhicule est en statut LOUÉ.`);
        this.isDepartModalOpen = false;
        this.loadLocations();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Impossible de démarrer la location');
      }
    });
  }

  askAnnulation(loc: LocationItem) {
    this.locationToCancel = loc;
    this.cancelMessage = `Confirmez-vous l'annulation de la réservation #${loc.id} pour le client ${loc.client?.prenom} ${loc.client?.nom} ?`;
    this.isCancelModalOpen = true;
  }

  confirmAnnulation() {
    if (!this.locationToCancel) return;
    this.locationService.annulerReservation(this.locationToCancel.id).subscribe({
      next: () => {
        this.toastService.success('Réservation annulée avec succès');
        this.isCancelModalOpen = false;
        this.loadLocations();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erreur lors de l\'annulation');
        this.isCancelModalOpen = false;
      }
    });
  }
}
