import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-title">Gestion d'école</span>
            <span class="logo-subtitle">School Management</span>
          </div>
        </div>
      </div>

      <div class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-label">PRINCIPAL</span>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </a>

          @if (authService.isStudent()) {
            <a routerLink="/my-courses" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span>Mes Cours</span>
            </a>
          } @else {
            <a routerLink="/courses" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span>Cours</span>
            </a>
          }

          <a routerLink="/quiz" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Quiz</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-label">GESTION</span>
          
          @if (isAdmin()) {
            <a routerLink="/users-approval" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <polyline points="17 11 19 13 23 9"/>
              </svg>
              <span>Approbation</span>
            </a>
          }

          @if (authService.isTutorOrAdmin()) {
            <a routerLink="/students" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Étudiants</span>
            </a>
          }

          @if (authService.isTutorOrAdmin()) {
            <a routerLink="/enrollments" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>Inscriptions</span>
            </a>
          }
        </div>

        <div class="nav-section">
          <span class="nav-label">COMMUNAUTÉ</span>
          
          <a routerLink="/my-quiz-history" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Historique Quiz</span>
          </a>
        </div>

        @if (isAdmin()) {
          <div class="nav-section">
            <span class="nav-label">ADMINISTRATION</span>
            <a routerLink="/users" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <span>Utilisateurs</span>
            </a>
          </div>
        }
      </div>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">
            <div class="avatar-gradient">{{getUserInitials()}}</div>
            <div class="status-indicator"></div>
          </div>
          <div class="user-details">
            <span class="user-name">{{getUserName()}}</span>
            <span class="user-role">{{getRoleLabel()}}</span>
          </div>
          <button class="logout-btn" (click)="logout()" title="Déconnexion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--sidebar-bg, #1a1f35);
      border-right: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: 16px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }

    .logo-subtitle {
      font-size: 10px;
      color: rgba(255,255,255,0.45);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 16px 12px;
      scrollbar-width: none;
    }
    .sidebar-nav::-webkit-scrollbar { display: none; }

    .nav-section {
      margin-bottom: 24px;
    }

    .nav-label {
      font-size: 10.5px;
      font-weight: 600;
      color: rgba(255,255,255,0.35);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0 10px;
      display: block;
      margin-bottom: 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 10px;
      margin: 2px 0;
      border-radius: 8px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      color: white;
      background: rgba(255,255,255,0.06);
    }

    .nav-item.active {
      color: white;
      background: rgba(255,255,255,0.09);
    }

    .nav-item svg { flex-shrink: 0; opacity: 0.8; }
    .nav-item.active svg { opacity: 1; color: #3b82f6; }
    .nav-item:hover svg { opacity: 1; }

    .nav-item span { flex: 1; }

    .sidebar-footer {
      padding: 14px 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px;
      transition: background 0.2s;
    }
    .user-card:hover { background: rgba(255,255,255,0.07); }

    .user-avatar { position: relative; flex-shrink: 0; }

    .avatar-gradient {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 13px;
    }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: #22c55e;
      border: 2px solid #0b1120;
      border-radius: 50%;
    }

    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
    }

    .logout-btn {
      width: 32px;
      height: 32px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f87171;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .logout-btn:hover { background: rgba(239,68,68,0.18); }

    @media (max-width: 1024px) {
      .sidebar { width: 230px; }
    }

    @media (max-width: 768px) {
      .sidebar { width: 100%; height: auto; position: relative; }
      .sidebar-nav { max-height: 360px; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  userRole = '';
  userName = '';
  
  constructor(public authService: AuthService) {}
  
  ngOnInit() {
    const userInfo = this.authService.getUserInfo();
    this.userRole = userInfo.role || '';
    this.userName = userInfo.firstName || userInfo.username;
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  isTutor(): boolean {
    return this.authService.isTutorOrAdmin();
  }

  canManageStudents(): boolean {
    return this.authService.canManageStudents();
  }

  canManageEnrollments(): boolean {
    return this.authService.canManageEnrollments();
  }

  getUserName(): string {
    return this.userName;
  }

  getUserInitials(): string {
    const userInfo = this.authService.getUserInfo();
    if (userInfo.firstName && userInfo.lastName) {
      return (userInfo.firstName[0] + userInfo.lastName[0]).toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    switch(this.userRole) {
      case 'ADMIN': return 'Administrateur';
      case 'TUTOR': return 'Tuteur';
      case 'STUDENT': return 'Étudiant';
      default: return 'Utilisateur';
    }
  }

  logout() {
    this.authService.logout();
  }
}
