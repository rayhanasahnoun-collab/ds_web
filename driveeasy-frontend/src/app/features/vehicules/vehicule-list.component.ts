import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculeApiService } from '../../core/services/vehicule.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { Vehicule, StatutVehicule, CategorieVehicule, Carburant } from '../../models/vehicule.model';

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, ConfirmModalComponent],
  template: `
    <div class="vehicules-page">
      <div class="page-header">
        <div>
          <h1>Catalogue des Véhicules</h1>
          <p>Gestion et disponibilité de la flotte automobile DriveEasy</p>
        </div>
        <a routerLink="/vehicules/new" class="btn btn-primary">
          <i class="ri-add-line"></i> Ajouter un Véhicule
        </a>
      </div>

      <!-- FILTRES & RECHERCHE -->
      <div class="card filters-card">
        <div class="filters-grid">
          <div class="form-group mb-0">
            <label class="form-label">Recherche</label>
            <div class="input-icon-wrapper">
              <i class="ri-search-line"></i>
              <input type="text" class="form-control" placeholder="Marque, modèle, immatriculation..." [(ngModel)]="searchTerm" (input)="applyLocalFilter()">
            </div>
          </div>

          <div class="form-group mb-0">
            <label class="form-label">Catégorie</label>
            <select class="form-select" [(ngModel)]="selectedCategorie" (change)="loadVehicules()">
              <option value="">Toutes les catégories</option>
              <option value="CITADINE">Citadine</option>
              <option value="BERLINE">Berline</option>
              <option value="SUV">SUV</option>
              <option value="UTILITAIRE">Utilitaire</option>
              <option value="LUXE">Luxe</option>
            </select>
          </div>

          <div class="form-group mb-0">
            <label class="form-label">Carburant</label>
            <select class="form-select" [(ngModel)]="selectedCarburant" (change)="loadVehicules()">
              <option value="">Tous les carburants</option>
              <option value="ESSENCE">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRIDE">Hybride</option>
              <option value="ELECTRIQUE">Électrique</option>
            </select>
          </div>

          <div class="form-group mb-0">
            <label class="form-label">Statut</label>
            <select class="form-select" [(ngModel)]="selectedStatut" (change)="loadVehicules()">
              <option value="">Tous les statuts</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="LOUE">Loué</option>
              <option value="MAINTENANCE">En maintenance</option>
            </select>
          </div>

          <div class="form-group mb-0" style="display: flex; align-items: flex-end;">
            <button class="btn btn-secondary" style="width: 100%;" (click)="resetFilters()">
              <i class="ri-filter-off-line"></i> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- CATALOGUE GRILLE DE CARTES -->
      <div class="vehicules-grid" *ngIf="filteredVehicules.length > 0">
        <div class="vehicule-card card" *ngFor="let v of filteredVehicules">
          <div class="vehicule-image-wrapper">
            <img [src]="v.imageUrl || defaultCarImage" [alt]="v.marque + ' ' + v.modele" class="vehicule-img" (error)="onImageError($event)">
            <div class="image-overlay-badge">
              <app-status-badge [value]="v.statut" type="vehicule"></app-status-badge>
            </div>
            <div class="price-tag">
              <strong>{{ v.prixJournalier | currency:'EUR':'symbol':'1.0-0':'fr' }}</strong>
              <small>/jour</small>
            </div>
          </div>

          <div class="vehicule-card-body">
            <div class="vehicule-title-row">
              <h3>{{ v.marque }} {{ v.modele }}</h3>
              <span class="immat-badge">{{ v.immatriculation }}</span>
            </div>
            <p class="vehicule-annee">{{ v.annee }} · {{ v.couleur }}</p>

            <div class="specs-grid">
              <div class="spec-item"><i class="ri-user-line"></i> {{ v.nbPlaces }} places</div>
              <div class="spec-item"><i class="ri-gas-station-line"></i> {{ v.carburant }}</div>
              <div class="spec-item"><i class="ri-settings-4-line"></i> {{ v.boite }}</div>
              <div class="spec-item"><i class="ri-dashboard-2-line"></i> {{ v.kilometrage | number }} km</div>
            </div>

            <div class="vehicule-actions">
              <div class="dropdown-statut">
                <select class="form-select form-select-sm" [ngModel]="v.statut" (ngModelChange)="changeStatut(v, $event)" [disabled]="v.statut === 'LOUE'">
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="LOUE" disabled>LOUÉ</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div class="action-buttons">
                <a [routerLink]="['/vehicules', v.id, 'edit']" class="btn btn-secondary btn-icon" title="Modifier">
                  <i class="ri-edit-line"></i>
                </a>
                <button type="button" class="btn btn-danger btn-icon" (click)="askDelete(v)" [disabled]="v.statut === 'LOUE'" title="Supprimer">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div class="card empty-state" *ngIf="filteredVehicules.length === 0">
        <i class="ri-roadster-line empty-icon"></i>
        <h3>Aucun véhicule trouvé</h3>
        <p>Modifiez vos filtres ou ajoutez un nouveau véhicule au parc.</p>
        <button class="btn btn-outline-primary btn-sm" (click)="resetFilters()">Réinitialiser les filtres</button>
      </div>

      <!-- MODAL CONFIRMATION SUPPRESSION -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Supprimer ce véhicule"
        [message]="deleteMessage"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .vehicules-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .filters-card {
      padding: 1.25rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 992px) {
      .filters-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 576px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }

    .input-icon-wrapper {
      position: relative;
    }

    .input-icon-wrapper i {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .input-icon-wrapper input {
      padding-left: 2.5rem;
    }

    .vehicules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.5rem;
    }

    .vehicule-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .vehicule-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .vehicule-image-wrapper {
      position: relative;
      height: 180px;
      background: #e2e8f0;
      overflow: hidden;
    }

    .vehicule-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .vehicule-card:hover .vehicule-img {
      transform: scale(1.05);
    }

    .image-overlay-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
    }

    .price-tag {
      position: absolute;
      bottom: 0.75rem;
      right: 0.75rem;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(4px);
      color: #ffffff;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
    }

    .price-tag strong {
      font-size: 1.15rem;
      color: #60a5fa;
    }

    .price-tag small {
      font-size: 0.7rem;
      color: #cbd5e1;
    }

    .vehicule-card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .vehicule-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.2rem;
    }

    .vehicule-title-row h3 {
      font-size: 1.05rem;
      color: var(--text-main);
    }

    .immat-badge {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    .vehicule-annee {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.85rem;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.45rem;
      padding: 0.75rem 0;
      border-top: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 1rem;
    }

    .spec-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: var(--text-secondary);
    }

    .spec-item i {
      color: var(--primary);
    }

    .vehicule-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-top: auto;
    }

    .dropdown-statut {
      flex: 1;
    }

    .action-buttons {
      display: flex;
      gap: 0.4rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .empty-icon {
      font-size: 3rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
  `]
})
export class VehiculeListComponent implements OnInit {
  vehicules: Vehicule[] = [];
  filteredVehicules: Vehicule[] = [];

  searchTerm = '';
  selectedCategorie = '';
  selectedCarburant = '';
  selectedStatut = '';

  isDeleteModalOpen = false;
  vehiculeToDelete?: Vehicule;
  deleteMessage = '';

  defaultCarImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  constructor(
    private vehiculeService: VehiculeApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadVehicules();
  }

  loadVehicules() {
    this.vehiculeService.getAll(
      this.selectedCategorie ? this.selectedCategorie as CategorieVehicule : undefined,
      this.selectedCarburant ? this.selectedCarburant as Carburant : undefined,
      this.selectedStatut ? this.selectedStatut as StatutVehicule : undefined
    ).subscribe({
      next: (data) => {
        this.vehicules = data;
        this.applyLocalFilter();
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des véhicules');
      }
    });
  }

  applyLocalFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredVehicules = [...this.vehicules];
      return;
    }
    const q = this.searchTerm.toLowerCase().trim();
    this.filteredVehicules = this.vehicules.filter(v =>
      v.marque.toLowerCase().includes(q) ||
      v.modele.toLowerCase().includes(q) ||
      v.immatriculation.toLowerCase().includes(q) ||
      v.couleur.toLowerCase().includes(q)
    );
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategorie = '';
    this.selectedCarburant = '';
    this.selectedStatut = '';
    this.loadVehicules();
  }

  changeStatut(vehicule: Vehicule, newStatut: StatutVehicule) {
    if (vehicule.statut === newStatut) return;
    this.vehiculeService.updateStatut(vehicule.id, newStatut).subscribe({
      next: (updated) => {
        vehicule.statut = updated.statut;
        this.toastService.success(`Statut du véhicule ${vehicule.immatriculation} mis à jour : ${newStatut}`);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Impossible de modifier le statut');
        this.loadVehicules();
      }
    });
  }

  askDelete(vehicule: Vehicule) {
    if (vehicule.statut === 'LOUE') {
      this.toastService.warning('Impossible de supprimer un véhicule actuellement loué.');
      return;
    }
    this.vehiculeToDelete = vehicule;
    this.deleteMessage = `Êtes-vous sûr de vouloir supprimer définitivement le véhicule ${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation}) ?`;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    if (!this.vehiculeToDelete) return;
    const id = this.vehiculeToDelete.id;
    this.vehiculeService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Véhicule supprimé avec succès');
        this.isDeleteModalOpen = false;
        this.loadVehicules();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Échec de la suppression du véhicule');
        this.isDeleteModalOpen = false;
      }
    });
  }

  onImageError(event: any) {
    event.target.src = this.defaultCarImage;
  }
}
