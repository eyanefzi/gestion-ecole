import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Gestion des Utilisateurs</h1>
          <p class="subtitle">{{ users.length }} utilisateur(s) affiché(s)</p>
        </div>
        <button *ngIf="canManageUsers()" class="btn-primary" (click)="openModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvel utilisateur
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card"><span class="stat-num red">{{ stats.byRole?.ADMIN || 0 }}</span><span class="stat-lbl">Admins</span></div>
        <div class="stat-card"><span class="stat-num blue">{{ stats.byRole?.TUTOR || 0 }}</span><span class="stat-lbl">Tuteurs</span></div>
        <div class="stat-card"><span class="stat-num green">{{ stats.byRole?.STUDENT || 0 }}</span><span class="stat-lbl">Étudiants</span></div>
        <div class="stat-card"><span class="stat-num">{{ stats.total || 0 }}</span><span class="stat-lbl">Total</span></div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher par nom, email, username…" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
          <button *ngIf="searchTerm" class="clear-btn" (click)="searchTerm=''; applyFilters()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="filters">
          <select [(ngModel)]="filterRole" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="TUTOR">Tuteur</option>
            <option value="STUDENT">Étudiant</option>
          </select>
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
          <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="createdAt">Date création</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
            <option value="role">Rôle</option>
          </select>
          <button class="sort-dir-btn" (click)="toggleOrder()">
            <svg *ngIf="sortOrder==='asc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            <svg *ngIf="sortOrder==='desc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          </button>
          <button class="reset-btn" *ngIf="hasFilters()" (click)="resetFilters()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="state-box"><div class="spinner"></div><p>Chargement…</p></div>

      <!-- Table -->
      <div *ngIf="!loading" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ (u.firstName?.[0] || u.username?.[0] || '?').toUpperCase() }}</div>
                  <div>
                    <div class="user-name">{{ u.firstName }} {{ u.lastName }}</div>
                    <div class="user-username">&#64;{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td class="email-cell">{{ u.email }}</td>
              <td><span class="badge" [class]="'badge-'+u.role.toLowerCase()">{{ roleLabel(u.role) }}</span></td>
              <td><span class="status-badge" [class.active]="u.isActive">{{ u.isActive ? 'Actif' : 'Inactif' }}</span></td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td class="actions-cell">
                <button *ngIf="canManageUsers()" class="btn-action btn-edit" (click)="editUser(u)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
                <button *ngIf="canManageUsers()" class="btn-action" [class]="u.isActive ? 'btn-warn' : 'btn-success'" (click)="toggleStatus(u)">
                  {{ u.isActive ? 'Désactiver' : 'Activer' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="6" class="empty-cell">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Aucun utilisateur ne correspond à votre recherche</p>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer"><span>{{ users.length }} résultat(s)</span></div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editMode ? 'Modifier' : 'Nouvel' }} utilisateur</h2>
            <button class="close-btn" (click)="closeModal()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <form (ngSubmit)="saveUser()" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" [(ngModel)]="currentUser.firstName" name="firstName" required placeholder="Prénom" />
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentUser.lastName" name="lastName" required placeholder="Nom" />
              </div>
            </div>
            <div class="form-group">
              <label>Nom d'utilisateur *</label>
              <input type="text" [(ngModel)]="currentUser.username" name="username" required [disabled]="editMode" placeholder="username" />
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="currentUser.email" name="email" required placeholder="email@exemple.com" />
            </div>
            <div class="form-group" *ngIf="!editMode">
              <label>Mot de passe *</label>
              <input type="password" [(ngModel)]="currentUser.password" name="password" required placeholder="••••••••" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Rôle *</label>
                <select [(ngModel)]="currentUser.role" name="role" required>
                  <option value="STUDENT">Étudiant</option>
                  <option value="TUTOR">Tuteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              <div class="form-group" *ngIf="editMode">
                <label>Statut</label>
                <select [(ngModel)]="currentUser.isActive" name="isActive">
                  <option [value]="true">Actif</option>
                  <option [value]="false">Inactif</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn-primary">{{ editMode ? 'Modifier' : 'Créer' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 24px 28px; background: #f4f5f7; min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-header h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #6b7280; margin: 0; }

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; display: flex; flex-direction: column; gap: 4px; }
    .stat-num { font-size: 26px; font-weight: 700; color: #111827; }
    .stat-num.red   { color: #dc2626; }
    .stat-num.blue  { color: #2563eb; }
    .stat-num.green { color: #2563eb; }
    .stat-lbl { font-size: 12.5px; color: #6b7280; }

    .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 220px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0 12px; gap: 8px; }
    .search-wrap:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .search-wrap svg { color: #9ca3af; flex-shrink: 0; }
    .search-wrap input { flex: 1; border: none; outline: none; padding: 9px 0; font-size: 13.5px; background: transparent; color: #111827; }
    .clear-btn { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 2px; }
    .filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .filter-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: white; color: #374151; cursor: pointer; outline: none; }
    .filter-select:focus { border-color: #3b82f6; }
    .sort-dir-btn { width: 36px; height: 36px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; }
    .sort-dir-btn:hover { border-color: #3b82f6; color: #2563eb; }
    .reset-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid #fca5a5; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .reset-btn:hover { background: #fee2e2; }

    .table-wrap { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f9fafb; }
    th { padding: 11px 16px; text-align: left; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
    td { padding: 11px 16px; border-bottom: 1px solid #f3f4f6; font-size: 13.5px; color: #374151; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9fafb; }
    .email-cell { color: #6b7280; }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 34px; height: 34px; background: #ecfdf5; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #2563eb; flex-shrink: 0; }
    .user-name { font-size: 13.5px; font-weight: 600; color: #111827; }
    .user-username { font-size: 12px; color: #9ca3af; }

    .badge { padding: 3px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; }
    .badge-admin   { background: #fef2f2; color: #dc2626; }
    .badge-tutor   { background: #eff6ff; color: #2563eb; }
    .badge-student { background: #ecfdf5; color: #2563eb; }

    .status-badge { padding: 3px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; background: #fef2f2; color: #dc2626; }
    .status-badge.active { background: #ecfdf5; color: #2563eb; }

    .actions-cell { display: flex; gap: 6px; }
    .btn-action { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: none; white-space: nowrap; transition: all .15s; }
    .btn-edit    { background: #eff6ff; color: #2563eb; }
    .btn-edit:hover    { background: #dbeafe; }
    .btn-warn    { background: #fffbeb; color: #d97706; }
    .btn-warn:hover    { background: #fef3c7; }
    .btn-success { background: #ecfdf5; color: #2563eb; }
    .btn-success:hover { background: #d1fae5; }

    .empty-cell { text-align: center; padding: 48px; color: #9ca3af; }
    .empty-cell svg { display: block; margin: 0 auto 12px; }
    .empty-cell p { margin: 0; font-size: 14px; }
    .table-footer { padding: 10px 16px; border-top: 1px solid #f3f4f6; font-size: 12.5px; color: #9ca3af; }

    .state-box { text-align: center; padding: 48px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
    .spinner { border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; width: 36px; height: 36px; animation: spin .8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .btn-primary { background: #2563eb; color: white; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background .2s; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { padding: 9px 18px; border: 1.5px solid #e5e7eb; background: white; color: #374151; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; }
    .btn-secondary:hover { background: #f9fafb; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 14px; padding: 24px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
    .close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 4px; border-radius: 6px; }
    .close-btn:hover { background: #f3f4f6; color: #374151; }
    .modal-form { display: flex; flex-direction: column; gap: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #374151; }
    .form-group input, .form-group select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .form-group input:disabled { background: #f9fafb; cursor: not-allowed; color: #9ca3af; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
  `]
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  stats: any = { total: 0, byRole: {} };
  showModal = false;
  editMode = false;
  currentUser: any = {};
  loading = false;

  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';
  private searchTimeout: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit() { this.loadStats(); this.loadUsers(); }

  loadStats() {
    this.http.get<any>('http://localhost:8080/api/auth/users/stats').subscribe({
      next: d => { this.stats = d; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  loadUsers() {
    this.loading = true;
    let params = `?sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;
    if (this.searchTerm) params += `&search=${encodeURIComponent(this.searchTerm)}`;
    if (this.filterRole)   params += `&role=${this.filterRole}`;
    if (this.filterStatus) params += `&isActive=${this.filterStatus}`;
    this.http.get<any[]>(`http://localhost:8080/api/auth/users${params}`).subscribe({
      next: d => { this.users = d; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 400);
  }

  applyFilters() { this.loadUsers(); this.loadStats(); }
  toggleOrder() { this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; this.applyFilters(); }
  hasFilters() { return !!(this.searchTerm || this.filterRole || this.filterStatus); }
  resetFilters() { this.searchTerm = ''; this.filterRole = ''; this.filterStatus = ''; this.sortBy = 'createdAt'; this.sortOrder = 'desc'; this.applyFilters(); }

  toggleStatus(u: any) {
    const newStatus = !u.isActive;
    if (confirm(`${newStatus ? 'Activer' : 'Désactiver'} l'utilisateur ${u.username} ?`)) {
      this.http.put(`http://localhost:8080/api/auth/users/${u.id}`, { isActive: newStatus }).subscribe({
        next: () => { u.isActive = newStatus; this.loadStats(); this.cdr.detectChanges(); },
        error: () => alert('Erreur lors de la modification du statut')
      });
    }
  }

  openModal() { this.editMode = false; this.currentUser = { role: 'STUDENT', isActive: true }; this.showModal = true; }
  editUser(u: any) { this.editMode = true; this.currentUser = { ...u }; this.showModal = true; }
  closeModal() { this.showModal = false; }

  saveUser() {
    const url = this.editMode ? `http://localhost:8080/api/auth/users/${this.currentUser.id}` : 'http://localhost:8080/api/auth/register';
    const req = this.editMode ? this.http.put(url, this.currentUser) : this.http.post(url, this.currentUser);
    req.subscribe({
      next: () => { this.loadUsers(); this.loadStats(); this.closeModal(); },
      error: (err: any) => alert(err.error?.error || 'Erreur lors de l\'enregistrement')
    });
  }

  roleLabel(r: string) { const m: any = { ADMIN: 'Admin', TUTOR: 'Tuteur', STUDENT: 'Étudiant' }; return m[r] || r; }
  formatDate(d: string) { return d ? new Date(d).toLocaleDateString('fr-FR') : '-'; }
  canManageUsers() { return this.authService.canManageUsers(); }
}
