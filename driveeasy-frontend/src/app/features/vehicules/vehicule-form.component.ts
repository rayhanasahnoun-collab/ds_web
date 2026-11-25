import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiculeApiService } from '../../core/services/vehicule.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="form-page">
      <div class="page-header">
        <div>
          <h1>{{ isEditMode ? 'Modifier le Véhicule' : 'Nouveau Véhicule' }}</h1>
          <p>{{ isEditMode ? 'Mettre à jour les informations du véhicule' : 'Enregistrer un nouveau véhicule dans le parc automobile' }}</p>
        </div>
        <a routerLink="/vehicules" class="btn btn-secondary">
          <i class="ri-arrow-left-line"></i> Retour au catalogue
        </a>
      </div>

      <div class="card form-card">
        <form [formGroup]="vehiculeForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- IMMATRICULATION -->
            <div class="form-group">
              <label class="form-label">Immatriculation *</label>
              <input type="text" class="form-control" formControlName="immatriculation" placeholder="Ex: AA-123-BB"
                     [class.is-invalid]="isFieldInvalid('immatriculation')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('immatriculation')">
                L'immatriculation est obligatoire (format: AA-123-BB).
              </div>
            </div>

            <!-- MARQUE -->
            <div class="form-group">
              <label class="form-label">Marque *</label>
              <input type="text" class="form-control" formControlName="marque" placeholder="Ex: Peugeot, Renault, Tesla..."
                     [class.is-invalid]="isFieldInvalid('marque')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('marque')">La marque est obligatoire.</div>
            </div>

            <!-- MODÈLE -->
            <div class="form-group">
              <label class="form-label">Modèle *</label>
              <input type="text" class="form-control" formControlName="modele" placeholder="Ex: 208, Clio V, Model 3..."
                     [class.is-invalid]="isFieldInvalid('modele')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('modele')">Le modèle est obligatoire.</div>
            </div>

            <!-- ANNÉE -->
            <div class="form-group">
              <label class="form-label">Année de mise en circulation *</label>
              <input type="number" class="form-control" formControlName="annee" placeholder="2023"
                     [class.is-invalid]="isFieldInvalid('annee')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('annee')">
                Année invalide (entre 1990 et {{ currentYear }}).
              </div>
            </div>

            <!-- COULEUR -->
            <div class="form-group">
              <label class="form-label">Couleur *</label>
              <input type="text" class="form-control" formControlName="couleur" placeholder="Ex: Noir Métallisé, Blanc, Gris..."
                     [class.is-invalid]="isFieldInvalid('couleur')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('couleur')">La couleur est obligatoire.</div>
            </div>

            <!-- CATÉGORIE -->
            <div class="form-group">
              <label class="form-label">Catégorie *</label>
              <select class="form-select" formControlName="categorie" [class.is-invalid]="isFieldInvalid('categorie')">
                <option value="CITADINE">Citadine</option>
                <option value="BERLINE">Berline</option>
                <option value="SUV">SUV</option>
                <option value="UTILITAIRE">Utilitaire</option>
                <option value="LUXE">Luxe</option>
              </select>
            </div>

            <!-- CARBURANT -->
            <div class="form-group">
              <label class="form-label">Carburant *</label>
              <select class="form-select" formControlName="carburant" [class.is-invalid]="isFieldInvalid('carburant')">
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRIDE">Hybride</option>
                <option value="ELECTRIQUE">Électrique</option>
              </select>
            </div>

            <!-- BOÎTE DE VITESSE -->
            <div class="form-group">
              <label class="form-label">Boîte de vitesse *</label>
              <select class="form-select" formControlName="boite" [class.is-invalid]="isFieldInvalid('boite')">
                <option value="MANUELLE">Manuelle</option>
                <option value="AUTOMATIQUE">Automatique</option>
              </select>
            </div>

            <!-- PLACES -->
            <div class="form-group">
              <label class="form-label">Nombre de places *</label>
              <input type="number" class="form-control" formControlName="nbPlaces" placeholder="5"
                     [class.is-invalid]="isFieldInvalid('nbPlaces')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('nbPlaces')">Entre 1 et 9 places.</div>
            </div>

            <!-- KILOMÉTRAGE -->
            <div class="form-group">
              <label class="form-label">Kilométrage actuel (km) *</label>
              <input type="number" class="form-control" formControlName="kilometrage" placeholder="15000"
                     [class.is-invalid]="isFieldInvalid('kilometrage')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('kilometrage')">Kilométrage positif requis.</div>
            </div>

            <!-- PRIX JOURNALIER -->
            <div class="form-group">
              <label class="form-label">Prix journalier (€ / jour) *</label>
              <input type="number" step="0.01" class="form-control" formControlName="prixJournalier" placeholder="45.00"
                     [class.is-invalid]="isFieldInvalid('prixJournalier')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('prixJournalier')">
                Prix journalier strictement positif requis.
              </div>
            </div>

            <!-- STATUT -->
            <div class="form-group">
              <label class="form-label">Statut initial</label>
              <select class="form-select" formControlName="statut">
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>

            <!-- URL IMAGE -->
            <div class="form-group full-width">
              <label class="form-label">URL de la photo (optionnel)</label>
              <input type="url" class="form-control" formControlName="imageUrl" placeholder="https://images.unsplash.com/...">
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/vehicules" class="btn btn-secondary">Annuler</a>
            <button type="submit" class="btn btn-primary" [disabled]="vehiculeForm.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner"></span>
              <i *ngIf="!isSubmitting" class="ri-check-line"></i>
              {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le véhicule' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page {
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

    .form-card {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-light);
    }
  `]
})
export class VehiculeFormComponent implements OnInit {
  vehiculeForm!: FormGroup;
  isEditMode = false;
  vehiculeId?: number;
  isSubmitting = false;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.vehiculeId = +idParam;
      this.loadVehiculeData(this.vehiculeId);
    }
  }

  initForm() {
    this.vehiculeForm = this.fb.group({
      immatriculation: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9-]{3,15}$')]],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      annee: [this.currentYear, [Validators.required, Validators.min(1990), Validators.max(this.currentYear)]],
      couleur: ['', Validators.required],
      categorie: ['CITADINE', Validators.required],
      carburant: ['ESSENCE', Validators.required],
      boite: ['MANUELLE', Validators.required],
      nbPlaces: [5, [Validators.required, Validators.min(1), Validators.max(9)]],
      kilometrage: [0, [Validators.required, Validators.min(0)]],
      prixJournalier: [45.00, [Validators.required, Validators.min(0.01)]],
      statut: ['DISPONIBLE'],
      imageUrl: ['']
    });
  }

  loadVehiculeData(id: number) {
    this.vehiculeService.getById(id).subscribe({
      next: (v) => {
        this.vehiculeForm.patchValue(v);
      },
      error: () => {
        this.toastService.error('Impossible de charger le véhicule');
        this.router.navigate(['/vehicules']);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehiculeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.vehiculeForm.invalid) {
      this.vehiculeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.vehiculeForm.value;

    if (this.isEditMode && this.vehiculeId) {
      this.vehiculeService.update(this.vehiculeId, formValue).subscribe({
        next: () => {
          this.toastService.success('Véhicule mis à jour avec succès');
          this.router.navigate(['/vehicules']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error(err.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.vehiculeService.create(formValue).subscribe({
        next: () => {
          this.toastService.success('Véhicule ajouté au catalogue avec succès');
          this.router.navigate(['/vehicules']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error(err.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }
}
