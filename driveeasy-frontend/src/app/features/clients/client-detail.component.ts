import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientApiService } from '../../core/services/client.service';
import { LocationApiService } from '../../core/services/location.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { Client, EligibiliteClient, CategorieClient } from '../../models/client.model';
import { LocationItem } from '../../models/location.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="client-detail-page" *ngIf="client">
      <div class="page-header">
        <div>
          <h1>{{ client.prenom }} {{ client.nom }}</h1>
          <p>Fiche client, historique des contrats et test d'éligibilité</p>
        </div>
        <div class="header-actions">
          <a routerLink="/clients" class="btn btn-secondary">
            <i class="ri-arrow-left-line"></i> Retour liste
          </a>
          <a [routerLink]="['/locations/new']" [queryParams]="{clientId: client.id}" class="btn btn-primary" [class.disabled]="eligibilite && !eligibilite.eligible">
            <i class="ri-add-line"></i> Louer pour ce client
          </a>
        </div>
      </div>

      <!-- BANNIÈRE ÉLIGIBILITÉ -->
      <div class="card eligibilite-banner" [ngClass]="eligibilite?.eligible ? 'banner-success' : 'banner-danger'" *ngIf="eligibilite">
        <div class="banner-icon">
          <i [class]="eligibilite.eligible ? 'ri-shield-check-fill' : 'ri-error-warning-fill'"></i>
        </div>
        <div class="banner-content">
          <h3>{{ eligibilite.eligible ? 'Client Éligible à la Location' : 'Client Non Éligible' }}</h3>
          <p>{{ eligibilite.motif }}</p>
          <div class="banner-checks">
            <span class="check-pill" [class.check-ok]="eligibilite.ageValide" [class.check-ko]="!eligibilite.ageValide">
              <i [class]="eligibilite.ageValide ? 'ri-check-line' : 'ri-close-line'"></i>
              Âge minimum 21 ans ({{ eligibilite.age }} ans)
            </span>
            <span class="check-pill" [class.check-ok]="eligibilite.permisValide" [class.check-ko]="!eligibilite.permisValide">
              <i [class]="eligibilite.permisValide ? 'ri-check-line' : 'ri-close-line'"></i>
              Permis valide (exp: {{ eligibilite.dateExpirationPermis | date:'dd/MM/yyyy' }})
            </span>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <!-- INFORMATIONS PERSONNELLES -->
        <div class="card">
          <div class="card-header">
            <h3>Informations Personnelles</h3>
            <app-status-badge [value]="client.categorieClient" type="client"></app-status-badge>
          </div>

          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Numéro CIN</span>
              <strong class="info-val font-mono">{{ client.cin }}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Date de Naissance</span>
              <span class="info-val">{{ client.dateNaissance | date:'dd MMMM yyyy' }} ({{ client.age }} ans)</span>
            </div>
            <div class="info-item">
              <span class="info-label">Adresse Email</span>
              <span class="info-val">{{ client.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Téléphone</span>
              <span class="info-val">{{ client.telephone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Adresse Postale</span>
              <span class="info-val">{{ client.adresse }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Numéro de Permis</span>
              <strong class="info-val font-mono">{{ client.numeroPermis }}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Date d'inscription</span>
              <span class="info-val">{{ client.dateInscription | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>

          <!-- MODIFICATION MANUELLE DE FIDÉLITÉ -->
          <div class="fidelity-switch">
            <label class="form-label">Changer de niveau de fidélité :</label>
            <div style="display: flex; gap: 0.5rem;">
              <select class="form-select form-select-sm" [(ngModel)]="newCategorie">
                <option value="STANDARD">STANDARD (0% remise)</option>
                <option value="FIDELE">FIDÈLE (5% remise)</option>
                <option value="VIP">VIP (10% remise)</option>
              </select>
              <button class="btn btn-secondary btn-sm" (click)="saveCategorie()">Appliquer</button>
            </div>
          </div>
        </div>

        <!-- HISTORIQUE DES LOCATIONS -->
        <div class="card">
          <div class="card-header">
            <h3>Historique des Locations</h3>
            <span class="badge badge-standard">{{ locations.length }} contrats</span>
          </div>

          <div class="table-container" *ngIf="locations.length > 0">
            <table class="table">
              <thead>
                <tr>
                  <th>Contrat</th>
                  <th>Véhicule</th>
                  <th>Dates</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loc of locations">
                  <td><strong>#{{ loc.id }}</strong></td>
                  <td>{{ loc.vehicule?.marque }} {{ loc.vehicule?.modele }}</td>
                  <td>{{ loc.dateDebut | date:'dd/MM/yy' }} - {{ loc.dateFinPrevue | date:'dd/MM/yy' }}</td>
                  <td><strong>{{ loc.montantTotal | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong></td>
                  <td><app-status-badge [value]="loc.statut" type="location"></app-status-badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="locations.length === 0" style="padding: 2rem; text-align: center; color: var(--text-muted);">
            Aucune location passée ou en cours pour ce client.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .client-detail-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .eligibilite-banner {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
    }

    .banner-success {
      background-color: var(--accent-success-bg);
      border-color: #a7f3d0;
    }

    .banner-danger {
      background-color: var(--accent-danger-bg);
      border-color: #fecaca;
    }

    .banner-icon {
      font-size: 2.2rem;
    }

    .banner-success .banner-icon { color: var(--accent-success); }
    .banner-danger .banner-icon { color: var(--accent-danger); }

    .banner-content h3 {
      font-size: 1.15rem;
      margin-bottom: 0.25rem;
    }

    .banner-content p {
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }

    .banner-checks {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .check-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.65rem;
      border-radius: var(--radius-full);
      font-size: 0.78rem;
      font-weight: 600;
    }

    .check-ok {
      background: #ffffff;
      color: var(--accent-success);
      border: 1px solid #a7f3d0;
    }

    .check-ko {
      background: #ffffff;
      color: var(--accent-danger);
      border: 1px solid #fecaca;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 1.5rem;
    }

    @media (max-width: 992px) {
      .detail-grid { grid-template-columns: 1fr; }
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid var(--border-light);
      font-size: 0.875rem;
    }

    .info-label {
      color: var(--text-muted);
    }

    .info-val {
      font-weight: 500;
      color: var(--text-main);
    }

    .font-mono {
      font-family: monospace;
      font-size: 0.85rem;
    }

    .fidelity-switch {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  client?: Client;
  eligibilite?: EligibiliteClient;
  locations: LocationItem[] = [];
  newCategorie: CategorieClient = 'STANDARD';

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientApiService,
    private locationService: LocationApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadClient(id);
  }

  loadClient(id: number) {
    this.clientService.getById(id).subscribe({
      next: (c) => {
        this.client = c;
        this.newCategorie = c.categorieClient;
        this.checkEligibilite(id);
        this.loadLocations(id);
      },
      error: () => {
        this.toastService.error('Client introuvable');
      }
    });
  }

  checkEligibilite(id: number) {
    this.clientService.getEligibilite(id).subscribe({
      next: (el) => {
        this.eligibilite = el;
      }
    });
  }

  loadLocations(clientId: number) {
    this.locationService.getAll(undefined, clientId).subscribe({
      next: (locs) => {
        this.locations = locs;
      }
    });
  }

  saveCategorie() {
    if (!this.client) return;
    this.clientService.updateCategorie(this.client.id, this.newCategorie).subscribe({
      next: (updated) => {
        this.client!.categorieClient = updated.categorieClient;
        this.toastService.success('Catégorie de fidélité mise à jour : ' + updated.categorieClient);
      },
      error: () => {
        this.toastService.error('Erreur lors de la modification');
      }
    });
  }
}
