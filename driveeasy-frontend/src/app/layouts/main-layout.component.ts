import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastContainerComponent } from '../shared/components/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="app-layout">
      <!-- SIDEBAR FIXE -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <i class="ri-car-fill"></i>
          </div>
          <div class="brand-text">
            <h2>DriveEasy</h2>
            <span>Location de Véhicules</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">MENU PRINCIPAL</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="ri-dashboard-3-line"></i>
            <span>Tableau de Bord</span>
          </a>
          <a routerLink="/vehicules" routerLinkActive="active" class="nav-item">
            <i class="ri-roadster-line"></i>
            <span>Véhicules</span>
          </a>
          <a routerLink="/clients" routerLinkActive="active" class="nav-item">
            <i class="ri-user-star-line"></i>
            <span>Clients</span>
          </a>
          <a routerLink="/locations" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <i class="ri-file-list-3-line"></i>
            <span>Locations</span>
          </a>

          <div class="nav-section-title">ACTIONS RAPIDES</div>
          <a routerLink="/locations/new" routerLinkActive="active" class="nav-item nav-item-highlight">
            <i class="ri-add-circle-fill"></i>
            <span>Nouvelle Location</span>
          </a>
          <a routerLink="/vehicules/new" routerLinkActive="active" class="nav-item">
            <i class="ri-add-box-line"></i>
            <span>Nouveau Véhicule</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="architecture-badge">
            <i class="ri-cloud-line"></i>
            <div>
              <strong>Spring Cloud</strong>
              <small>Microservices & RAM</small>
            </div>
          </div>
        </div>
      </aside>

      <!-- CONTENU PRINCIPAL -->
      <div class="main-wrapper">
        <!-- TOPBAR -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="system-status">
              <span class="status-indicator"></span>
              Gateway Connectée (Port 8080)
            </span>
          </div>

          <div class="topbar-right">
            <a routerLink="/locations/new" class="btn btn-primary btn-sm">
              <i class="ri-calendar-check-line"></i> Réserver
            </a>
            <div class="user-profile">
              <div class="avatar">LIM3</div>
              <div class="user-info">
                <strong>Étudiant LIM3</strong>
                <small>Soutenance Licence</small>
              </div>
            </div>
          </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- TOAST NOTIFICATIONS -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background-color: var(--sidebar-bg);
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      border-right: 1px solid #1e293b;
    }

    .sidebar-brand {
      padding: 1.5rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      border-bottom: 1px solid #1e293b;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
    }

    .brand-text h2 {
      color: #ffffff;
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .brand-text span {
      font-size: 0.75rem;
      color: #64748b;
      display: block;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.68rem;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.08em;
      margin: 1.25rem 0.75rem 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.7rem 0.85rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .nav-item i {
      font-size: 1.2rem;
    }

    .nav-item:hover {
      background-color: var(--sidebar-hover);
      color: #ffffff;
    }

    .nav-item.active {
      background-color: var(--sidebar-active);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .nav-item-highlight {
      color: #60a5fa;
      background: rgba(37, 99, 235, 0.1);
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #1e293b;
    }

    .architecture-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .architecture-badge i {
      font-size: 1.35rem;
      color: #38bdf8;
    }

    .architecture-badge strong {
      display: block;
      font-size: 0.8rem;
      color: #f1f5f9;
    }

    .architecture-badge small {
      font-size: 0.7rem;
      color: #64748b;
    }

    .main-wrapper {
      margin-left: 260px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      height: 70px;
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .system-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #059669;
      background: #ecfdf5;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      border: 1px solid #a7f3d0;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-left: 1px solid var(--border-color);
      padding-left: 1.25rem;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .user-info strong {
      display: block;
      font-size: 0.85rem;
      color: var(--text-main);
    }

    .user-info small {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .content-area {
      padding: 2rem;
      flex: 1;
    }
  `]
})
export class MainLayoutComponent {}
