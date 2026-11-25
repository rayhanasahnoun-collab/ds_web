import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VehiculeApiService } from '../../core/services/vehicule.service';
import { ClientApiService } from '../../core/services/client.service';
import { LocationApiService } from '../../core/services/location.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { Vehicule } from '../../models/vehicule.model';
import { Client } from '../../models/client.model';
import { LocationItem } from '../../models/location.model';
import { Statistiques } from '../../models/statistiques.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Tableau de Bord</h1>
          <p>Supervision en temps réel de votre agence de location DriveEasy</p>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="loadAllData()">
          <i class="ri-refresh-line" [class.spinning]="isLoading"></i> Actualiser
        </button>
      </div>

      <!-- KPI CARDS -->
      <div class="kpi-grid">
        <div class="kpi-card card">
          <div class="kpi-icon icon-blue">
            <i class="ri-roadster-fill"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Flotte Totale</span>
            <strong class="kpi-value">{{ vehicules.length }}</strong>
            <small class="kpi-sub">
              <span class="text-success">{{ countDisponibles }}</span> disp. · 
              <span class="text-warning">{{ countLoues }}</span> loués
            </small>
          </div>
        </div>

        <div class="kpi-card card">
          <div class="kpi-icon icon-emerald">
            <i class="ri-user-star-fill"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Clients Enregistrés</span>
            <strong class="kpi-value">{{ clients.length }}</strong>
            <small class="kpi-sub">{{ countVip }} VIP · {{ countFideles }} Fidèles</small>
          </div>
        </div>

        <div class="kpi-card card">
          <div class="kpi-icon icon-amber">
            <i class="ri-calendar-check-fill"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Locations Actives</span>
            <strong class="kpi-value">{{ stats?.locationsEnCours || 0 }}</strong>
            <small class="kpi-sub">{{ stats?.reservationsActives || 0 }} réservations à venir</small>
          </div>
        </div>

        <div class="kpi-card card">
          <div class="kpi-icon icon-purple">
            <i class="ri-money-euro-circle-fill"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Chiffre d'Affaires</span>
            <strong class="kpi-value">{{ (stats?.chiffreAffairesTotal || 0) | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong>
            <small class="kpi-sub">Mois courant : {{ (stats?.chiffreAffairesMoisCourant || 0) | currency:'EUR':'symbol':'1.2-2':'fr' }}</small>
          </div>
        </div>
      </div>

      <!-- GRAPHIQUES ET OCCUPATION -->
      <div class="charts-grid">
        <!-- TAUX D'OCCUPATION ET STATUTS FLOTTE -->
        <div class="card">
          <div class="card-header">
            <h3>Disponibilité de la Flotte</h3>
            <span class="badge badge-info">{{ stats?.tauxOccupationPourcentage || 0 }}% d'occupation</span>
          </div>

          <div class="flotte-bars">
            <div class="bar-group">
              <div class="bar-label">
                <span>Disponibles</span>
                <strong>{{ countDisponibles }} / {{ vehicules.length }}</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-success" [style.width.%]="getVehiculeRatio('DISPONIBLE')"></div>
              </div>
            </div>

            <div class="bar-group">
              <div class="bar-label">
                <span>En location</span>
                <strong>{{ countLoues }} / {{ vehicules.length }}</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-warning" [style.width.%]="getVehiculeRatio('LOUE')"></div>
              </div>
            </div>

            <div class="bar-group">
              <div class="bar-label">
                <span>En maintenance</span>
                <strong>{{ countMaintenance }} / {{ vehicules.length }}</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-danger" [style.width.%]="getVehiculeRatio('MAINTENANCE')"></div>
              </div>
            </div>
          </div>

          <div class="kpi-footer-note">
            <i class="ri-information-line"></i> Données synchronisées en mémoire RAM via API Gateway
          </div>
        </div>

        <!-- RÉPARTITION DES LOCATIONS -->
        <div class="card">
          <div class="card-header">
            <h3>Activité des Contrats</h3>
            <span class="badge badge-standard">{{ locations.length }} total</span>
          </div>

          <div class="activity-stats">
            <div class="activity-item">
              <div class="activity-icon bg-info-light text-info"><i class="ri-bookmark-3-line"></i></div>
              <div>
                <strong>{{ stats?.reservationsActives || 0 }} Réservées</strong>
                <small>Attente de prise en charge</small>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon bg-warning-light text-warning"><i class="ri-car-line"></i></div>
              <div>
                <strong>{{ stats?.locationsEnCours || 0 }} En Cours</strong>
                <small>Véhicules sur la route</small>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon bg-success-light text-success"><i class="ri-checkbox-circle-line"></i></div>
              <div>
                <strong>{{ stats?.locationsTerminees || 0 }} Terminées</strong>
                <small>Retours enregistrés</small>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon bg-danger-light text-danger"><i class="ri-close-circle-line"></i></div>
              <div>
                <strong>{{ stats?.locationsAnnulees || 0 }} Annulées</strong>
                <small>Réservations annulées</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DERNIÈRES LOCATIONS -->
      <div class="card table-card">
        <div class="card-header">
          <h3>Locations & Réservations Récentes</h3>
          <a routerLink="/locations" class="btn btn-outline-primary btn-sm">Voir tout</a>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Réf</th>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Période</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let loc of locations | slice:0:5">
                <td><strong>#{{ loc.id }}</strong></td>
                <td>
                  <div style="font-weight: 600;">{{ loc.client?.prenom }} {{ loc.client?.nom }}</div>
                  <small style="color: var(--text-muted);">{{ loc.client?.email }}</small>
                </td>
                <td>
                  <span style="font-weight: 600;">{{ loc.vehicule?.marque }} {{ loc.vehicule?.modele }}</span>
                  <small style="display: block; color: var(--text-muted);">{{ loc.vehicule?.immatriculation }}</small>
                </td>
                <td>
                  <div>Du {{ loc.dateDebut | date:'dd/MM/yyyy' }}</div>
                  <small style="color: var(--text-muted);">Au {{ loc.dateFinPrevue | date:'dd/MM/yyyy' }}</small>
                </td>
                <td>
                  <strong style="color: var(--primary);">{{ loc.montantTotal | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong>
                  <div *ngIf="loc.penalite > 0" style="color: var(--accent-danger); font-size: 0.75rem;">
                    dont +{{ loc.penalite | currency:'EUR':'symbol':'1.2-2':'fr' }} pénalité
                  </div>
                </td>
                <td>
                  <app-status-badge [value]="loc.statut" type="location"></app-status-badge>
                </td>
                <td>
                  <a [routerLink]="['/locations']" class="btn btn-secondary btn-sm">Détail</a>
                </td>
              </tr>
              <tr *ngIf="locations.length === 0">
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                  Aucune location enregistrée pour le moment.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1.25rem;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
    }

    .kpi-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
    }

    .icon-blue { background: #eff6ff; color: #2563eb; }
    .icon-emerald { background: #ecfdf5; color: #10b981; }
    .icon-amber { background: #fffbeb; color: #f59e0b; }
    .icon-purple { background: #f5f3ff; color: #8b5cf6; }

    .kpi-details {
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .kpi-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
      margin: 0.2rem 0;
    }

    .kpi-sub {
      font-size: 0.775rem;
      color: var(--text-secondary);
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 992px) {
      .charts-grid { grid-template-columns: 1fr; }
    }

    .flotte-bars {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      margin: 1rem 0;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .progress-track {
      height: 10px;
      background-color: #f1f5f9;
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.6s ease;
    }

    .bg-success { background-color: var(--accent-success); }
    .bg-warning { background-color: var(--accent-warning); }
    .bg-danger { background-color: var(--accent-danger); }

    .kpi-footer-note {
      font-size: 0.775rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-light);
    }

    .activity-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 0.75rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      background-color: #f8fafc;
      border: 1px solid var(--border-light);
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .bg-info-light { background: #ecfeff; }
    .bg-warning-light { background: #fffbeb; }
    .bg-success-light { background: #ecfdf5; }
    .bg-danger-light { background: #fef2f2; }

    .text-success { color: var(--accent-success); font-weight: 600; }
    .text-warning { color: var(--accent-warning); font-weight: 600; }
    .text-danger { color: var(--accent-danger); font-weight: 600; }
    .text-info { color: var(--accent-info); }

    .spinning {
      animation: spin 1s linear infinite;
    }
  `]
})
export class DashboardComponent implements OnInit {
  vehicules: Vehicule[] = [];
  clients: Client[] = [];
  locations: LocationItem[] = [];
  stats?: Statistiques;
  isLoading = false;

  constructor(
    private vehiculeService: VehiculeApiService,
    private clientService: ClientApiService,
    private locationService: LocationApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;
    forkJoin({
      vehicules: this.vehiculeService.getAll(),
      clients: this.clientService.getAll(),
      locations: this.locationService.getAll(),
      stats: this.locationService.getStatistiques()
    }).subscribe({
      next: (res) => {
        this.vehicules = res.vehicules;
        this.clients = res.clients;
        this.locations = res.locations;
        this.stats = res.stats;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Erreur de connexion aux microservices via la Gateway');
      }
    });
  }

  get countDisponibles(): number {
    return this.vehicules.filter(v => v.statut === 'DISPONIBLE').length;
  }

  get countLoues(): number {
    return this.vehicules.filter(v => v.statut === 'LOUE').length;
  }

  get countMaintenance(): number {
    return this.vehicules.filter(v => v.statut === 'MAINTENANCE').length;
  }

  get countVip(): number {
    return this.clients.filter(c => c.categorieClient === 'VIP').length;
  }

  get countFideles(): number {
    return this.clients.filter(c => c.categorieClient === 'FIDELE').length;
  }

  getVehiculeRatio(statut: string): number {
    if (!this.vehicules.length) return 0;
    const count = this.vehicules.filter(v => v.statut === statut).length;
    return Math.round((count / this.vehicules.length) * 100);
  }
}
