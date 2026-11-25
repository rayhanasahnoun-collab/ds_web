import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClientApiService } from '../../core/services/client.service';
import { VehiculeApiService } from '../../core/services/vehicule.service';
import { LocationApiService } from '../../core/services/location.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { Client, EligibiliteClient } from '../../models/client.model';
import { Vehicule } from '../../models/vehicule.model';
import { SimulationResult } from '../../models/location.model';

@Component({
  selector: 'app-location-new-wizard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="wizard-page">
      <div class="page-header">
        <div>
          <h1>Nouvelle Réservation</h1>
          <p>Assistant de réservation en 5 étapes avec vérification temps réel</p>
        </div>
        <a routerLink="/locations" class="btn btn-secondary">
          <i class="ri-close-line"></i> Annuler
        </a>
      </div>

      <!-- STEPPER BAR -->
      <div class="stepper-card card">
        <div class="step-indicator" [class.active]="step === 1" [class.completed]="step > 1">
          <div class="step-circle">{{ step > 1 ? '✓' : '1' }}</div>
          <span>1. Client</span>
        </div>
        <div class="step-line" [class.active]="step > 1"></div>

        <div class="step-indicator" [class.active]="step === 2" [class.completed]="step > 2">
          <div class="step-circle">{{ step > 2 ? '✓' : '2' }}</div>
          <span>2. Période</span>
        </div>
        <div class="step-line" [class.active]="step > 2"></div>

        <div class="step-indicator" [class.active]="step === 3" [class.completed]="step > 3">
          <div class="step-circle">{{ step > 3 ? '✓' : '3' }}</div>
          <span>3. Véhicule</span>
        </div>
        <div class="step-line" [class.active]="step > 3"></div>

        <div class="step-indicator" [class.active]="step === 4" [class.completed]="step > 4">
          <div class="step-circle">{{ step > 4 ? '✓' : '4' }}</div>
          <span>4. Simulation</span>
        </div>
        <div class="step-line" [class.active]="step > 4"></div>

        <div class="step-indicator" [class.active]="step === 5">
          <div class="step-circle">5</div>
          <span>5. Confirmation</span>
        </div>
      </div>

      <!-- ÉTAPE 1 : SÉLECTION DU CLIENT -->
      <div class="card step-content" *ngIf="step === 1">
        <div class="step-header">
          <h3>Étape 1 : Sélectionner le Client</h3>
          <p>Choisissez le client titulaire de la location (âge minimal 21 ans et permis valide)</p>
        </div>

        <div class="form-group">
          <input type="text" class="form-control" placeholder="Rechercher par nom, CIN..." [(ngModel)]="clientSearch" (input)="filterClients()">
        </div>

        <div class="client-selection-list">
          <div class="client-pick-card" *ngFor="let c of filteredClients"
               [class.selected]="selectedClient?.id === c.id"
               [class.ineligible]="isClientExpired(c)"
               (click)="selectClient(c)">
            <div class="client-pick-avatar">{{ c.prenom[0] }}{{ c.nom[0] }}</div>
            <div class="client-pick-info">
              <strong>{{ c.prenom }} {{ c.nom }}</strong>
              <small>{{ c.email }} · CIN: {{ c.cin }}</small>
              <small *ngIf="c.permisExpire" class="text-danger">Permis expiré le {{ c.dateExpirationPermis | date:'dd/MM/yyyy' }}</small>
            </div>
            <app-status-badge [value]="c.categorieClient" type="client"></app-status-badge>
          </div>
        </div>

        <div class="step-actions">
          <span></span>
          <button class="btn btn-primary" [disabled]="!selectedClient" (click)="goToStep2()">
            Continuer vers la période <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>

      <!-- ÉTAPE 2 : CHOIX DE LA PÉRIODE -->
      <div class="card step-content" *ngIf="step === 2">
        <div class="step-header">
          <h3>Étape 2 : Choix de la Période de Location</h3>
          <p>Indiquez la date de départ et la date de retour prévue</p>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Date de Début *</label>
            <input type="date" class="form-control" [(ngModel)]="dateDebut" [min]="todayStr">
          </div>
          <div class="form-group">
            <label class="form-label">Date de Fin Prévue *</label>
            <input type="date" class="form-control" [(ngModel)]="dateFinPrevue" [min]="dateDebut || todayStr">
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" (click)="step = 1"><i class="ri-arrow-left-line"></i> Précédent</button>
          <button class="btn btn-primary" [disabled]="!isDatesValid()" (click)="goToStep3()">
            Continuer vers les véhicules <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>

      <!-- ÉTAPE 3 : SÉLECTION D'UN VÉHICULE DISPONIBLE -->
      <div class="card step-content" *ngIf="step === 3">
        <div class="step-header">
          <h3>Étape 3 : Sélectionner un Véhicule</h3>
          <p>Véhicules disponibles pour la période du {{ dateDebut | date:'dd/MM/yyyy' }} au {{ dateFinPrevue | date:'dd/MM/yyyy' }}</p>
        </div>

        <div class="vehicules-pick-grid">
          <div class="vehicule-pick-card" *ngFor="let v of disponiblesVehicules"
               [class.selected]="selectedVehicule?.id === v.id"
               (click)="selectedVehicule = v">
            <img [src]="v.imageUrl || defaultCarImage" [alt]="v.marque" class="vehicule-pick-img">
            <div class="vehicule-pick-info">
              <strong>{{ v.marque }} {{ v.modele }}</strong>
              <small>{{ v.categorie }} · {{ v.carburant }} · {{ v.boite }}</small>
              <div class="price-pill">
                <strong>{{ v.prixJournalier | currency:'EUR':'symbol':'1.0-0':'fr' }}</strong> /jour
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" (click)="step = 2"><i class="ri-arrow-left-line"></i> Précédent</button>
          <button class="btn btn-primary" [disabled]="!selectedVehicule" (click)="goToStep4()">
            Lancer la simulation de prix <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>

      <!-- ÉTAPE 4 : SIMULATION DU PRIX -->
      <div class="card step-content" *ngIf="step === 4">
        <div class="step-header">
          <h3>Étape 4 : Simulation Financière Détaillée</h3>
          <p>Calcul officiel via le service de tarification avec remises de fidélité</p>
        </div>

        <div class="simulation-box" *ngIf="simulation">
          <div class="sim-row">
            <span>Client sélectionné :</span>
            <strong>{{ selectedClient?.prenom }} {{ selectedClient?.nom }}</strong>
          </div>
          <div class="sim-row">
            <span>Catégorie de fidélité :</span>
            <app-status-badge [value]="simulation.categorieClient" type="client"></app-status-badge>
          </div>
          <div class="sim-row">
            <span>Véhicule retenu :</span>
            <strong>{{ selectedVehicule?.marque }} {{ selectedVehicule?.modele }} ({{ selectedVehicule?.immatriculation }})</strong>
          </div>
          <div class="sim-row">
            <span>Durée de la location :</span>
            <strong>{{ simulation.nbJours }} jour(s)</strong>
          </div>
          <div class="sim-row">
            <span>Tarif journalier de base :</span>
            <span>{{ simulation.prixJournalierBase | currency:'EUR':'symbol':'1.2-2':'fr' }}</span>
          </div>
          <div class="sim-row text-success" *ngIf="simulation.pourcentageRemise > 0">
            <span>Remise de fidélité ({{ simulation.pourcentageRemise }}%) :</span>
            <strong>- {{ simulation.montantRemise | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong>
          </div>
          <div class="sim-row total-row">
            <span>MONTANT TOTAL ESTIMÉ :</span>
            <strong class="total-price">{{ simulation.montantTotalEstime | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" (click)="step = 3"><i class="ri-arrow-left-line"></i> Précédent</button>
          <button class="btn btn-success" (click)="step = 5">
            Étape finale : Validation <i class="ri-check-line"></i>
          </button>
        </div>
      </div>

      <!-- ÉTAPE 5 : CONFIRMATION -->
      <div class="card step-content text-center" *ngIf="step === 5">
        <div class="step-header">
          <i class="ri-shield-check-line text-primary" style="font-size: 3rem;"></i>
          <h2>Confirmer la Réservation</h2>
          <p>Le contrat sera créé avec le statut <strong>RÉSERVÉE</strong>.</p>
        </div>

        <div class="recap-card">
          <p>Vous êtes sur le point de valider la réservation pour <strong>{{ selectedClient?.prenom }} {{ selectedClient?.nom }}</strong> du <strong>{{ dateDebut | date:'dd/MM/yyyy' }}</strong> au <strong>{{ dateFinPrevue | date:'dd/MM/yyyy' }}</strong> sur le véhicule <strong>{{ selectedVehicule?.marque }} {{ selectedVehicule?.modele }}</strong>.</p>
          <h3 style="color: var(--primary); margin-top: 1rem;">Montant total : {{ simulation?.montantTotalEstime | currency:'EUR':'symbol':'1.2-2':'fr' }}</h3>
        </div>

        <div class="step-actions" style="justify-content: center; gap: 1rem; margin-top: 2rem;">
          <button class="btn btn-secondary" (click)="step = 4">Retour à la simulation</button>
          <button class="btn btn-primary" (click)="finaliserReservation()" [disabled]="isSubmitting">
            <span *ngIf="isSubmitting" class="spinner"></span>
            Confirmer & Créer la Réservation
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stepper-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f1f5f9;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }

    .step-indicator.active {
      color: var(--primary);
    }
    .step-indicator.active .step-circle {
      background: var(--primary);
      color: #ffffff;
    }

    .step-indicator.completed .step-circle {
      background: var(--accent-success);
      color: #ffffff;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin: 0 0.5rem;
    }
    .step-line.active {
      background: var(--accent-success);
    }

    .step-content {
      padding: 2rem;
    }

    .step-header {
      margin-bottom: 1.5rem;
    }

    .client-selection-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-height: 350px;
      overflow-y: auto;
      margin-bottom: 1.5rem;
    }

    .client-pick-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .client-pick-card:hover {
      background: #f8fafc;
      border-color: var(--primary);
    }

    .client-pick-card.selected {
      background: #eff6ff;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }

    .client-pick-card.ineligible {
      opacity: 0.6;
    }

    .client-pick-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--primary);
    }

    .client-pick-info {
      flex: 1;
    }

    .client-pick-info strong {
      display: block;
      font-size: 0.95rem;
    }

    .client-pick-info small {
      display: block;
      color: var(--text-muted);
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .vehicules-pick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 1.5rem;
    }

    .vehicule-pick-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .vehicule-pick-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    .vehicule-pick-card.selected {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
    }

    .vehicule-pick-img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .vehicule-pick-info {
      padding: 0.75rem;
    }

    .vehicule-pick-info strong {
      display: block;
      font-size: 0.9rem;
    }

    .vehicule-pick-info small {
      display: block;
      color: var(--text-muted);
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .price-pill {
      font-size: 0.8rem;
      color: var(--primary);
    }

    .simulation-box {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }

    .sim-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .total-row {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 2px dashed var(--border-color);
      font-size: 1.05rem;
      color: var(--text-main);
    }

    .total-price {
      font-size: 1.5rem;
      color: var(--primary);
      font-weight: 800;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }

    .recap-card {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: var(--radius-md);
      margin: 1.5rem 0;
      border: 1px solid var(--border-color);
    }
  `]
})
export class LocationNewWizardComponent implements OnInit {
  step = 1;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  clientSearch = '';
  selectedClient?: Client;

  todayStr = new Date().toISOString().split('T')[0];
  dateDebut = this.todayStr;
  dateFinPrevue = '';

  disponiblesVehicules: Vehicule[] = [];
  selectedVehicule?: Vehicule;

  simulation?: SimulationResult;
  isSubmitting = false;

  defaultCarImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  constructor(
    private clientService: ClientApiService,
    private vehiculeService: VehiculeApiService,
    private locationService: LocationApiService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Calcul date fin par défaut : dans 3 jours
    const d = new Date();
    d.setDate(d.getDate() + 3);
    this.dateFinPrevue = d.toISOString().split('T')[0];

    this.loadClients();
  }

  loadClients() {
    this.clientService.getAll().subscribe({
      next: (cls) => {
        this.clients = cls;
        this.filteredClients = cls;
        const queryClientId = this.route.snapshot.queryParamMap.get('clientId');
        if (queryClientId) {
          const found = cls.find(c => c.id === +queryClientId);
          if (found) this.selectClient(found);
        }
      }
    });
  }

  filterClients() {
    if (!this.clientSearch.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }
    const q = this.clientSearch.toLowerCase();
    this.filteredClients = this.clients.filter(c =>
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.cin.toLowerCase().includes(q)
    );
  }

  selectClient(client: Client) {
    this.selectedClient = client;
  }

  isClientExpired(c: Client): boolean {
    return !!c.permisExpire;
  }

  goToStep2() {
    if (!this.selectedClient) return;
    // Vérifier l'éligibilité avant d'avancer
    this.clientService.getEligibilite(this.selectedClient.id).subscribe({
      next: (el) => {
        if (!el.eligible) {
          this.toastService.error(`Client non éligible : ${el.motif}`);
          return;
        }
        this.step = 2;
      },
      error: () => {
        this.step = 2;
      }
    });
  }

  isDatesValid(): boolean {
    return !!(this.dateDebut && this.dateFinPrevue && this.dateFinPrevue >= this.dateDebut);
  }

  goToStep3() {
    this.vehiculeService.getDisponibles().subscribe({
      next: (vehs) => {
        this.disponiblesVehicules = vehs;
        this.step = 3;
      },
      error: () => {
        this.toastService.error('Impossible de charger les véhicules disponibles');
      }
    });
  }

  goToStep4() {
    if (!this.selectedClient || !this.selectedVehicule) return;
    this.locationService.simulerTarif({
      clientId: this.selectedClient.id,
      vehiculeId: this.selectedVehicule.id,
      dateDebut: this.dateDebut,
      dateFinPrevue: this.dateFinPrevue
    }).subscribe({
      next: (sim) => {
        this.simulation = sim;
        this.step = 4;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erreur lors de la simulation');
      }
    });
  }

  finaliserReservation() {
    if (!this.selectedClient || !this.selectedVehicule) return;
    this.isSubmitting = true;

    this.locationService.createReservation({
      clientId: this.selectedClient.id,
      vehiculeId: this.selectedVehicule.id,
      dateDebut: this.dateDebut,
      dateFinPrevue: this.dateFinPrevue
    }).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.toastService.success(`Réservation #${created.id} créée avec succès !`);
        this.router.navigate(['/locations']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Échec de la réservation');
      }
    });
  }
}
