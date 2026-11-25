import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientApiService } from '../../core/services/client.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, ConfirmModalComponent],
  template: `
    <div class="clients-page">
      <div class="page-header">
        <div>
          <h1>Répertoire des Clients</h1>
          <p>Gestion des profils clients, fidélité et éligibilité à la location</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="ri-user-add-line"></i> Nouveau Client
        </button>
      </div>

      <!-- RECHERCHE -->
      <div class="card search-card">
        <div class="search-bar-wrapper">
          <i class="ri-search-line"></i>
          <input type="text" class="form-control" placeholder="Rechercher par nom, prénom, CIN ou email..."
                 [(ngModel)]="searchQuery" (input)="onSearchChange()">
        </div>
      </div>

      <!-- TABLEAU DES CLIENTS -->
      <div class="card table-card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>CIN</th>
                <th>Contact</th>
                <th>Catégorie</th>
                <th>Permis de Conduire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clients">
                <td>
                  <div class="client-name-cell">
                    <div class="client-avatar">{{ getInitials(c) }}</div>
                    <div>
                      <strong>{{ c.prenom }} {{ c.nom }}</strong>
                      <small class="text-muted d-block">{{ c.age ? c.age + ' ans' : '' }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="cin-badge">{{ c.cin }}</span>
                </td>
                <td>
                  <div><i class="ri-mail-line"></i> {{ c.email }}</div>
                  <small style="color: var(--text-muted);"><i class="ri-phone-line"></i> {{ c.telephone }}</small>
                </td>
                <td>
                  <app-status-badge [value]="c.categorieClient" type="client"></app-status-badge>
                </td>
                <td>
                  <div><strong>{{ c.numeroPermis }}</strong></div>
                  <small [ngClass]="{'text-danger': c.permisExpire, 'text-success': !c.permisExpire}">
                    <i [class]="c.permisExpire ? 'ri-error-warning-line' : 'ri-shield-check-line'"></i>
                    {{ c.permisExpire ? 'Expiré le ' : 'Valide jusqu\'au ' }}{{ c.dateExpirationPermis | date:'dd/MM/yyyy' }}
                  </small>
                </td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="['/clients', c.id]" class="btn btn-secondary btn-sm" title="Fiche détaillée & Éligibilité">
                      <i class="ri-eye-line"></i> Fiche
                    </a>
                    <button class="btn btn-danger btn-icon btn-sm" (click)="askDelete(c)" title="Supprimer">
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="clients.length === 0">
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                  Aucun client trouvé.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL AJOUT RAPIDE CLIENT -->
      <div class="modal-overlay" *ngIf="isAddModalOpen" (click)="isAddModalOpen = false">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 650px;">
          <div class="modal-header">
            <h3><i class="ri-user-add-line text-primary"></i> Nouveau Client</h3>
            <button (click)="isAddModalOpen = false" style="background: none; border: none; font-size: 1.25rem; cursor: pointer;">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <form [formGroup]="clientForm" (ngSubmit)="saveClient()">
            <div class="modal-body">
              <div class="form-grid-modal">
                <div class="form-group">
                  <label class="form-label">CIN *</label>
                  <input type="text" class="form-control" formControlName="cin" placeholder="AB123456">
                </div>
                <div class="form-group">
                  <label class="form-label">Nom *</label>
                  <input type="text" class="form-control" formControlName="nom" placeholder="Dupont">
                </div>
                <div class="form-group">
                  <label class="form-label">Prénom *</label>
                  <input type="text" class="form-control" formControlName="prenom" placeholder="Jean">
                </div>
                <div class="form-group">
                  <label class="form-label">Date de Naissance *</label>
                  <input type="date" class="form-control" formControlName="dateNaissance">
                </div>
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control" formControlName="email" placeholder="jean@email.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Téléphone *</label>
                  <input type="text" class="form-control" formControlName="telephone" placeholder="+33 6 12 34 56 78">
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Adresse *</label>
                  <input type="text" class="form-control" formControlName="adresse" placeholder="10 Rue de la Paix, Paris">
                </div>
                <div class="form-group">
                  <label class="form-label">Numéro de Permis *</label>
                  <input type="text" class="form-control" formControlName="numeroPermis" placeholder="PERMIS-FR-001">
                </div>
                <div class="form-group">
                  <label class="form-label">Date Expiration Permis *</label>
                  <input type="date" class="form-control" formControlName="dateExpirationPermis">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="isAddModalOpen = false">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="clientForm.invalid || isSubmitting">
                <span *ngIf="isSubmitting" class="spinner"></span>
                Créer le client
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL CONFIRMATION SUPPRESSION -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Supprimer ce client"
        [message]="deleteMessage"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .clients-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .search-card {
      padding: 1rem 1.25rem;
    }

    .search-bar-wrapper {
      position: relative;
    }

    .search-bar-wrapper i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-bar-wrapper input {
      padding-left: 2.75rem;
    }

    .client-name-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .client-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #eff6ff;
      color: var(--primary);
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #bfdbfe;
    }

    .cin-badge {
      font-family: monospace;
      font-size: 0.8rem;
      font-weight: 700;
      background: #f8fafc;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .form-grid-modal {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .text-danger { color: var(--accent-danger); font-weight: 600; }
    .text-success { color: var(--accent-success); font-weight: 600; }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  searchQuery = '';

  isAddModalOpen = false;
  isSubmitting = false;
  clientForm!: FormGroup;

  isDeleteModalOpen = false;
  clientToDelete?: Client;
  deleteMessage = '';

  constructor(
    private clientService: ClientApiService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm() {
    this.clientForm = this.fb.group({
      cin: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      numeroPermis: ['', Validators.required],
      dateExpirationPermis: ['', Validators.required],
      categorieClient: ['STANDARD']
    });
  }

  loadClients() {
    this.clientService.getAll(this.searchQuery).subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des clients');
      }
    });
  }

  onSearchChange() {
    this.loadClients();
  }

  openAddModal() {
    this.clientForm.reset({ categorieClient: 'STANDARD' });
    this.isAddModalOpen = true;
  }

  saveClient() {
    if (this.clientForm.invalid) return;
    this.isSubmitting = true;
    this.clientService.create(this.clientForm.value).subscribe({
      next: () => {
        this.toastService.success('Client enregistré avec succès');
        this.isAddModalOpen = false;
        this.isSubmitting = false;
        this.loadClients();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Erreur lors de la création du client');
      }
    });
  }

  askDelete(client: Client) {
    this.clientToDelete = client;
    this.deleteMessage = `Confirmez-vous la suppression du client ${client.prenom} ${client.nom} (${client.cin}) ?`;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    if (!this.clientToDelete) return;
    this.clientService.delete(this.clientToDelete.id).subscribe({
      next: () => {
        this.toastService.success('Client supprimé avec succès');
        this.isDeleteModalOpen = false;
        this.loadClients();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Impossible de supprimer ce client');
        this.isDeleteModalOpen = false;
      }
    });
  }

  getInitials(c: Client): string {
    const p = c.prenom ? c.prenom[0] : '';
    const n = c.nom ? c.nom[0] : '';
    return (p + n).toUpperCase();
  }
}
