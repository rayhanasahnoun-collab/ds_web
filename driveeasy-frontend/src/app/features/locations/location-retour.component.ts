import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationApiService } from '../../core/services/location.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { LocationItem } from '../../models/location.model';

@Component({
  selector: 'app-location-retour',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="retour-page" *ngIf="location">
      <div class="page-header no-print">
        <div>
          <h1>Clôture & Retour du Véhicule</h1>
          <p>Enregistrement du retour du contrat <strong>#{{ location.id }}</strong></p>
        </div>
        <div class="header-actions">
          <a routerLink="/locations" class="btn btn-secondary">
            <i class="ri-arrow-left-line"></i> Retour liste
          </a>
          <button class="btn btn-secondary" (click)="imprimerRecapitulatif()" *ngIf="isTerminee">
            <i class="ri-printer-line"></i> Imprimer le reçu
          </button>
        </div>
      </div>

      <!-- REÇU IMPRIMABLE / FORMULAIRE DE RETOUR -->
      <div class="card retour-card printable-area">
        <div class="print-header">
          <div class="print-brand">
            <i class="ri-car-fill"></i>
            <h2>DriveEasy Location</h2>
          </div>
          <div class="print-meta">
            <strong>FACTURE / REÇU DE RETOUR #{{ location.id }}</strong>
            <small>Date : {{ todayStr | date:'dd/MM/yyyy' }}</small>
          </div>
        </div>

        <div class="recap-grid">
          <!-- CLIENT -->
          <div class="recap-box">
            <h4><i class="ri-user-line text-primary"></i> Client</h4>
            <strong>{{ location.client?.prenom }} {{ location.client?.nom }}</strong>
            <p>CIN : {{ location.client?.cin }}</p>
            <p>Email : {{ location.client?.email }}</p>
            <p>Permis : {{ location.client?.numeroPermis }}</p>
            <div style="margin-top: 0.5rem;">
              <app-status-badge [value]="location.client?.categorieClient || 'STANDARD'" type="client"></app-status-badge>
            </div>
          </div>

          <!-- VÉHICULE -->
          <div class="recap-box">
            <h4><i class="ri-roadster-line text-primary"></i> Véhicule</h4>
            <strong>{{ location.vehicule?.marque }} {{ location.vehicule?.modele }}</strong>
            <p>Immatriculation : <strong class="font-mono">{{ location.vehicule?.immatriculation }}</strong></p>
            <p>Catégorie : {{ location.vehicule?.categorie }}</p>
            <p>Kilométrage de départ : <strong>{{ location.kmDepart | number }} km</strong></p>
          </div>

          <!-- DATES -->
          <div class="recap-box">
            <h4><i class="ri-calendar-line text-primary"></i> Dates du Contrat</h4>
            <p>Date de départ : <strong>{{ location.dateDebut | date:'dd/MM/yyyy' }}</strong></p>
            <p>Date fin prévue : <strong>{{ location.dateFinPrevue | date:'dd/MM/yyyy' }}</strong></p>
            <p>Durée prévue : <strong>{{ location.nbJoursPrevus }} jour(s)</strong></p>
            <p>Tarif appliqué : {{ location.prixJournalierApplique | currency:'EUR':'symbol':'1.2-2':'fr' }} / jour</p>
          </div>
        </div>

        <!-- FORMULAIRE DE SAISIE DE RETOUR (CACHÉ APRÈS CLÔTURE) -->
        <div class="retour-form-section no-print" *ngIf="!isTerminee">
          <h3>Saisie des Informations de Restitution</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Date effective de retour *</label>
              <input type="date" class="form-control" [(ngModel)]="dateRetourEffectif" (change)="recalculerPenalite()">
            </div>
            <div class="form-group">
              <label class="form-label">Kilométrage de retour au compteur (km) *</label>
              <input type="number" class="form-control" [(ngModel)]="kmRetour" (input)="recalculerKm()">
              <small class="form-text" style="color: var(--text-muted);">
                Doit être supérieur au kilométrage de départ ({{ location.kmDepart | number }} km)
              </small>
            </div>
          </div>
        </div>

        <!-- RÉCAPITULATIF FINANCIER & PÉNALITÉS -->
        <div class="financial-summary">
          <div class="fin-row">
            <span>Montant de base de la location :</span>
            <strong>{{ location.montantTotal | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong>
          </div>

          <div class="fin-row" *ngIf="distanceEstimee > 0">
            <span>Distance parcourue :</span>
            <span>{{ distanceEstimee | number }} km</span>
          </div>

          <div class="fin-row text-danger" *ngIf="joursRetard > 0">
            <span>
              <i class="ri-alert-line"></i> Pénalité de retard ({{ joursRetard }} jour(s) × 1.5 × {{ location.prixJournalierApplique | currency:'EUR':'symbol':'1.2-2':'fr' }}) :
            </span>
            <strong>+ {{ penaliteCalculee | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong>
          </div>

          <div class="fin-row total-fin-row">
            <span>MONTANT TOTAL FINAL À REGLER :</span>
            <strong class="grand-total">{{ montantFinalCalcule | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong>
          </div>
        </div>

        <!-- BOUTON DE CLÔTURE -->
        <div class="no-print" style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;" *ngIf="!isTerminee">
          <a routerLink="/locations" class="btn btn-secondary">Annuler</a>
          <button class="btn btn-success" (click)="validerRetour()" [disabled]="isSubmitting || !isFormValid()">
            <span *ngIf="isSubmitting" class="spinner"></span>
            <i *ngIf="!isSubmitting" class="ri-check-double-line"></i>
            Valider le retour du véhicule
          </button>
        </div>

        <!-- SUCCESS MESSAGE POST-CLÔTURE -->
        <div class="cloture-success no-print" *ngIf="isTerminee">
          <i class="ri-checkbox-circle-fill text-success" style="font-size: 2rem;"></i>
          <div>
            <strong>Véhicule restitué avec succès !</strong>
            <p>Le statut du véhicule a été réinitialisé à <strong>DISPONIBLE</strong> et la fidélité du client a été actualisée.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .retour-page {
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

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .retour-card {
      padding: 2.5rem;
    }

    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }

    .print-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--primary);
    }

    .print-brand i {
      font-size: 2.25rem;
    }

    .print-meta {
      text-align: right;
    }

    .print-meta strong {
      display: block;
      color: var(--text-main);
    }

    .recap-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .recap-grid { grid-template-columns: 1fr; }
    }

    .recap-box {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .recap-box h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .recap-box p {
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }

    .font-mono {
      font-family: monospace;
    }

    .retour-form-section {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .retour-form-section h3 {
      font-size: 1.05rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .financial-summary {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .fin-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      color: var(--text-secondary);
    }

    .total-fin-row {
      border-top: 2px dashed var(--border-color);
      margin-top: 0.75rem;
      padding-top: 1rem;
      font-size: 1.15rem;
      color: var(--text-main);
    }

    .grand-total {
      font-size: 1.75rem;
      color: var(--primary);
      font-weight: 800;
    }

    .cloture-success {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 1.25rem;
      border-radius: var(--radius-md);
      margin-top: 2rem;
    }

    /* GESTION DE L'IMPRESSION FACTURE */
    @media print {
      body * {
        visibility: hidden;
      }
      .printable-area, .printable-area * {
        visibility: visible;
      }
      .printable-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        border: none !important;
        box-shadow: none !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `]
})
export class LocationRetourComponent implements OnInit {
  location?: LocationItem;
  todayStr = new Date().toISOString().split('T')[0];
  dateRetourEffectif = this.todayStr;
  kmRetour = 0;
  joursRetard = 0;
  penaliteCalculee = 0;
  distanceEstimee = 0;
  montantFinalCalcule = 0;
  isSubmitting = false;
  isTerminee = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadLocation(id);
  }

  loadLocation(id: number) {
    this.locationService.getById(id).subscribe({
      next: (loc) => {
        this.location = loc;
        this.kmRetour = (loc.kmDepart || 0) + 250;
        this.recalculerPenalite();
        this.recalculerKm();
        if (loc.statut === 'TERMINEE') {
          this.isTerminee = true;
          this.dateRetourEffectif = loc.dateRetourEffectif || this.todayStr;
          this.kmRetour = loc.kmRetour || 0;
          this.penaliteCalculee = loc.penalite || 0;
          this.montantFinalCalcule = loc.montantTotal || 0;
        }
      },
      error: () => {
        this.toastService.error('Location introuvable');
        this.router.navigate(['/locations']);
      }
    });
  }

  recalculerKm() {
    if (this.location && this.location.kmDepart) {
      this.distanceEstimee = Math.max(0, this.kmRetour - this.location.kmDepart);
    }
  }

  recalculerPenalite() {
    if (!this.location) return;
    const datePrevue = new Date(this.location.dateFinPrevue);
    const dateEffective = new Date(this.dateRetourEffectif);

    const diffTime = dateEffective.getTime() - datePrevue.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      this.joursRetard = diffDays;
      // Pénalité = retard * 1.5 * prixJournalier
      this.penaliteCalculee = diffDays * 1.5 * this.location.prixJournalierApplique;
    } else {
      this.joursRetard = 0;
      this.penaliteCalculee = 0;
    }
    this.montantFinalCalcule = (this.location.montantTotal || 0) + this.penaliteCalculee;
  }

  isFormValid(): boolean {
    if (!this.location) return false;
    const kmDepart = this.location.kmDepart || 0;
    return this.kmRetour >= kmDepart && !!this.dateRetourEffectif;
  }

  validerRetour() {
    if (!this.location || !this.isFormValid()) return;
    this.isSubmitting = true;

    this.locationService.retourVehicule(this.location.id, {
      kmRetour: this.kmRetour,
      dateRetourEffectif: this.dateRetourEffectif
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isTerminee = true;
        this.location = res;
        this.toastService.success('Retour enregistré avec succès ! Véhicule libéré.');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Erreur lors du retour du véhicule');
      }
    });
  }

  imprimerRecapitulatif() {
    window.print();
  }
}
