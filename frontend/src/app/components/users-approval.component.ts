import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>👥 Approbation des Utilisateurs</h1>
          <p class="subtitle">{{ displayedFiltered.length }} utilisateur(s) affiché(s)</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'pending'" (click)="activeTab = 'pending'; applyAll()">
          En attente ({{pendingUsers.length}})
        </button>
        <button class="tab" [class.active]="activeTab === 'approved'" (click)="activeTab = 'approved'; applyAll()">
          Approuvés ({{approvedUsers.length}})
        </button>
        <button class="tab" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'; applyAll()">
          Tous ({{allUsers.length}})
        </button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher par nom, email, rôle…" [(ngModel)]="search" (ngModelChange)="applyAll()" />
          <button *ngIf="search" class="clear-btn" (click)="search=''; applyAll()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="filters">
          <select [(ngModel)]="sortField" (ngModelChange)="applyAll()" class="filter-select">
            <option value="">Trier par…</option>
            <option value="username">Nom d'utilisateur</option>
            <option value="email">Email</option>
            <option value="firstName">Prénom</option>
            <option value="role">Rôle</option>
            <option value="createdAt">Date</option>
          </select>
          <button class="sort-dir-btn" (click)="toggleDir()" title="Inverser le tri">
            <svg *ngIf="sortDir==='asc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            <svg *ngIf="sortDir==='desc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          </button>
          <button class="reset-btn" *ngIf="search || sortField" (click)="reset()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th class="sortable" (click)="setSort('username')">
                Nom d'utilisateur <span class="si">{{ si('username') }}</span>
              </th>
              <th class="sortable" (click)="setSort('email')">
                Email <span class="si">{{ si('email') }}</span>
              </th>
              <th class="sortable" (click)="setSort('firstName')">
                Nom complet <span class="si">{{ si('firstName') }}</span>
              </th>
              <th class="sortable" (click)="setSort('role')">
                Rôle <span class="si">{{ si('role') }}</span>
              </th>
              <th class="sortable" (click)="setSort('createdAt')">
                Date d'inscription <span class="si">{{ si('createdAt') }}</span>
              </th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of displayedFiltered">
              <td>{{user.username}}</td>
              <td>{{user.email}}</td>
              <td>{{user.firstName}} {{user.lastName}}</td>
              <td><span class="badge badge-{{user.role.toLowerCase()}}">{{user.role}}</span></td>
              <td>{{user.createdAt | date:'dd/MM/yyyy HH:mm'}}</td>
              <td>
                <span class="status" [class.approved]="user.isApproved" [class.pending]="!user.isApproved">
                  {{user.isApproved ? '✓ Approuvé' : '⏳ En attente'}}
                </span>
              </td>
              <td>
                <button *ngIf="!user.isApproved && user.role === 'STUDENT'" class="btn-approve" (click)="approveUser(user)">
                  ✓ Approuver
                </button>
                <span *ngIf="user.isApproved" class="approved-text">Déjà approuvé</span>
                <span *ngIf="!user.isApproved && user.role !== 'STUDENT'" class="info-text">Non applicable</span>
              </td>
            </tr>
            <tr *ngIf="displayedFiltered.length === 0">
              <td colspan="7" class="empty-cell">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Aucun utilisateur ne correspond à votre recherche</p>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">
          Affichage de {{ displayedFiltered.length }} sur {{ getTabTotal() }} résultats
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; margin: 0 auto; padding: 0 20px 40px; }
    .page-header { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h1 { color: #111827; margin: 0 0 4px; font-size: 22px; font-weight: 700; }
    .subtitle { font-size: 13px; color: #6b7280; margin: 0; }

    .tabs { display: flex; gap: 10px; margin-bottom: 16px; }
    .tab { padding: 10px 20px; background: white; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13.5px; transition: all .2s; }
    .tab:hover { border-color: #3b82f6; color: #2563eb; }
    .tab.active { background: #2563eb; color: white; border-color: #2563eb; }

    .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 220px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0 12px; gap: 8px; }
    .search-wrap:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .search-wrap svg { color: #9ca3af; flex-shrink: 0; }
    .search-wrap input { flex: 1; border: none; outline: none; padding: 9px 0; font-size: 13.5px; background: transparent; color: #111827; }
    .clear-btn { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 2px; }
    .filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .filter-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: white; color: #374151; cursor: pointer; outline: none; }
    .filter-select:focus { border-color: #3b82f6; }
    .sort-dir-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: white; color: #6b7280; cursor: pointer; flex-shrink: 0; }
    .sort-dir-btn:hover { background: #f3f4f6; }
    .reset-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid #fca5a5; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 600; cursor: pointer; }

    .table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); border: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #2563eb; color: white; }
    th { padding: 13px 15px; text-align: left; font-weight: 600; font-size: 13.5px; white-space: nowrap; }
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable:hover { background: #1d4ed8; }
    .si { font-size: 11px; opacity: .8; margin-left: 4px; }
    td { padding: 13px 15px; border-bottom: 1px solid #f3f4f6; font-size: 13.5px; color: #374151; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9fafb; }

    .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-student { background: #e3f2fd; color: #1976d2; }
    .badge-tutor { background: #fff3e0; color: #f57c00; }
    .badge-admin { background: #fce4ec; color: #c2185b; }

    .status { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status.approved { background: #e8f5e9; color: #388e3c; }
    .status.pending { background: #fff3e0; color: #f57c00; }

    .btn-approve { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all .2s; }
    .btn-approve:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,.4); }
    .approved-text { color: #388e3c; font-weight: 600; font-size: 13px; }
    .info-text { color: #9ca3af; font-style: italic; font-size: 13px; }

    .empty-cell { text-align: center; padding: 40px; color: #9ca3af; }
    .empty-cell svg { margin: 0 auto 10px; display: block; }
    .empty-cell p { margin: 0; font-size: 14px; }

    .table-footer { padding: 12px 16px; font-size: 13px; color: #6b7280; border-top: 1px solid #f3f4f6; background: #fafafa; }
  `]
})
export class UsersApprovalComponent implements OnInit {
  allUsers: any[] = [];
  students: any[] = [];
  pendingUsers: any[] = [];
  approvedUsers: any[] = [];
  displayedFiltered: any[] = [];
  activeTab: 'pending' | 'approved' | 'all' = 'pending';

  search = '';
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.http.get<any[]>('http://localhost:8080/api/auth/users').subscribe({
      next: (users) => { this.allUsers = users; this.loadStudents(); },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadStudents() {
    this.http.get<any[]>('http://localhost:8080/students-service/students').subscribe({
      next: (students) => { this.students = students; this.categorizeUsers(); },
      error: (err) => console.error('Error loading students:', err)
    });
  }

  categorizeUsers() {
    this.allUsers = this.allUsers.map(user => ({
      ...user,
      isApproved: this.students.some(s => s.email === user.email)
    }));
    this.pendingUsers  = this.allUsers.filter(u => !u.isApproved && u.role === 'STUDENT');
    this.approvedUsers = this.allUsers.filter(u => u.isApproved);
    this.applyAll();
  }

  getTabList(): any[] {
    switch (this.activeTab) {
      case 'pending':  return this.pendingUsers;
      case 'approved': return this.approvedUsers;
      default:         return this.allUsers;
    }
  }

  getTabTotal(): number { return this.getTabList().length; }

  applyAll() {
    let list = [...this.getTabList()];
    if (this.search.trim()) {
      const t = this.search.toLowerCase();
      list = list.filter(u =>
        u.username?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t) ||
        u.firstName?.toLowerCase().includes(t) ||
        u.lastName?.toLowerCase().includes(t) ||
        u.role?.toLowerCase().includes(t)
      );
    }
    if (this.sortField) {
      list.sort((a: any, b: any) => {
        const va = (a[this.sortField] ?? '').toString().toLowerCase();
        const vb = (b[this.sortField] ?? '').toString().toLowerCase();
        return this.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    this.displayedFiltered = list;
    this.cdr.detectChanges();
  }

  setSort(field: string) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applyAll();
  }

  toggleDir() { this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; this.applyAll(); }

  reset() { this.search = ''; this.sortField = ''; this.sortDir = 'asc'; this.applyAll(); }

  si(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  approveUser(user: any) {
    if (confirm(`Approuver ${user.firstName} ${user.lastName} comme étudiant ?`)) {
      this.http.post(`http://localhost:8080/api/auth/users/${user.id}/approve`, {}).subscribe({
        next: () => { alert('Utilisateur approuvé avec succès!'); this.loadData(); },
        error: (err) => { console.error('Error approving user:', err); alert('Erreur lors de l\'approbation'); }
      });
    }
  }
}
