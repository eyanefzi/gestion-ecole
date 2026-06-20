import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

function smartCompare(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  // Date detection
  if (typeof a === 'string' && /^\d{4}-\d{2}-\d{2}/.test(a)) {
    return new Date(a).getTime() - new Date(b).getTime();
  }
  // Number
  if (typeof a === 'number' || !isNaN(Number(a))) return Number(a) - Number(b);
  // String
  return a.toString().toLowerCase().localeCompare(b.toString().toLowerCase(), 'fr');
}

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Gestion des Inscriptions</h1>
          <p class="subtitle">{{ filtered.length }} inscription(s) affichée(s) sur {{ enrollments.length }}</p>
        </div>
        <button *ngIf="canManageEnrollments()" class="btn-primary" (click)="openModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle inscription
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card"><span class="stat-num">{{ enrollments.length }}</span><span class="stat-lbl">Total inscriptions</span></div>
        <div class="stat-card"><span class="stat-num green">{{ students.length }}</span><span class="stat-lbl">Étudiants</span></div>
        <div class="stat-card"><span class="stat-num blue">{{ courses.length }}</span><span class="stat-lbl">Cours</span></div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher par étudiant, email ou cours…" [(ngModel)]="search" (ngModelChange)="apply()" />
          <button *ngIf="search" class="clear-btn" (click)="search=''; apply()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="filters">
          <select [(ngModel)]="filterLevel" (ngModelChange)="apply()" class="filter-select">
            <option value="">Tous les niveaux</option>
            <option value="BEGINNER">Débutant</option>
            <option value="INTERMEDIATE">Intermédiaire</option>
            <option value="ADVANCED">Avancé</option>
          </select>
          <select [(ngModel)]="sortField" (ngModelChange)="apply()" class="filter-select">
            <option value="">Trier par…</option>
            <option value="studentName">Étudiant</option>
            <option value="courseTitle">Cours</option>
            <option value="courseLevel">Niveau</option>
            <option value="enrollmentDate">Date</option>
          </select>
          <button class="sort-dir-btn" (click)="toggleDir()">
            <svg *ngIf="sortDir==='asc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            <svg *ngIf="sortDir==='desc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          </button>
          <button class="reset-btn" *ngIf="hasFilters()" (click)="reset()">
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
              <th class="sortable" (click)="setSort('studentName')">Étudiant <span class="si">{{ si('studentName') }}</span></th>
              <th class="sortable" (click)="setSort('studentEmail')">Email <span class="si">{{ si('studentEmail') }}</span></th>
              <th class="sortable" (click)="setSort('courseTitle')">Cours <span class="si">{{ si('courseTitle') }}</span></th>
              <th class="sortable" (click)="setSort('courseLevel')">Niveau <span class="si">{{ si('courseLevel') }}</span></th>
              <th class="sortable" (click)="setSort('enrollmentDate')">Date <span class="si">{{ si('enrollmentDate') }}</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filtered">
              <td><strong>{{ e.studentName }}</strong></td>
              <td class="email-cell">{{ e.studentEmail }}</td>
              <td>{{ e.courseTitle }}</td>
              <td><span class="badge" [class]="'badge-'+e.courseLevel.toLowerCase()">{{ e.courseLevel }}</span></td>
              <td>{{ formatDate(e.enrollmentDate) }}</td>
              <td class="actions-cell">
                <button class="btn-action btn-edit" (click)="openEditModal(e)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
                <button class="btn-action btn-delete" (click)="deleteEnrollment(e)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  Désinscrire
                </button>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="6" class="empty-cell">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Aucune inscription ne correspond à votre recherche</p>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer"><span>{{ filtered.length }} résultat(s)</span></div>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Modifier l'inscription</h2>
            <button class="close-btn" (click)="closeEditModal()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <form (ngSubmit)="saveEdit()" class="modal-form">
            <div class="form-group">
              <label>Étudiant</label>
              <input type="text" [value]="editEnrollment?.studentName" disabled style="padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;background:#f9fafb;color:#6b7280" />
            </div>
            <div class="form-group">
              <label>Nouveau cours *</label>
              <select [(ngModel)]="editCourseId" name="editCourse" required>
                <option value="">Sélectionner un cours</option>
                <option *ngFor="let c of courses" [value]="c.id">{{ c.title }} — {{ c.level }} ({{ c.durationHours }}h)</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeEditModal()">Annuler</button>
              <button type="submit" class="btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nouvelle inscription</h2>
            <button class="close-btn" (click)="closeModal()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <form (ngSubmit)="saveEnrollment()" class="modal-form">
            <div class="form-group">
              <label>Étudiant *</label>
              <select [(ngModel)]="selStudent" name="student" required>
                <option value="">Sélectionner un étudiant</option>
                <option *ngFor="let s of students" [value]="s.id">{{ s.firstName }} {{ s.lastName }} ({{ s.email }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Cours *</label>
              <select [(ngModel)]="selCourse" name="course" required>
                <option value="">Sélectionner un cours</option>
                <option *ngFor="let c of courses" [value]="c.id">{{ c.title }} — {{ c.level }} ({{ c.durationHours }}h)</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn-primary">Inscrire</button>
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

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; display: flex; flex-direction: column; gap: 4px; }
    .stat-num { font-size: 26px; font-weight: 700; color: #111827; }
    .stat-num.green { color: #2563eb; }
    .stat-num.blue  { color: #2563eb; }
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
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable:hover { color: #2563eb; background: #f0fdf4; }
    .si { font-size: 11px; margin-left: 3px; }
    td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 13.5px; color: #374151; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9fafb; }
    .email-cell { color: #6b7280; }
    .badge { padding: 3px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; }
    .badge-beginner    { background: #ecfdf5; color: #2563eb; }
    .badge-intermediate{ background: #eff6ff; color: #2563eb; }
    .badge-advanced    { background: #fef2f2; color: #dc2626; }
    .actions-cell { display: flex; gap: 6px; }
    .btn-action { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: none; white-space: nowrap; transition: all .15s; }
    .btn-delete { background: #fef2f2; color: #dc2626; }
    .btn-delete:hover { background: #fee2e2; }
    .btn-edit { background: #eff6ff; color: #2563eb; }
    .btn-edit:hover { background: #dbeafe; }
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
    .modal { background: white; border-radius: 14px; padding: 24px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
    .close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 4px; border-radius: 6px; }
    .close-btn:hover { background: #f3f4f6; color: #374151; }
    .modal-form { display: flex; flex-direction: column; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #374151; }
    .form-group select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; outline: none; }
    .form-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
  `]
})
export class EnrollmentsComponent implements OnInit {
  students: any[] = [];
  courses: any[] = [];
  enrollments: any[] = [];
  filtered: any[] = [];
  loading = false;

  search = '';
  filterLevel = '';
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';

  showModal = false;
  showEditModal = false;
  editEnrollment: any = null;
  editCourseId: any = '';
  selStudent: any = '';
  selCourse: any = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8080/students-service/students').subscribe({ next: d => { this.students = d; this.loadEnrollments(); } });
    this.http.get<any[]>('http://localhost:8080/courses-service/courses').subscribe({ next: d => { this.courses = d; this.cdr.detectChanges(); } });
  }

  loadEnrollments() {
    this.enrollments = [];
    this.students.forEach(student => {
      this.http.get<any>(`http://localhost:8080/students-service/students/${student.id}/courses`).subscribe({
        next: data => {
          (data.courses || []).forEach((course: any) => {
            this.enrollments.push({
              studentId: student.id, studentName: `${student.firstName} ${student.lastName}`,
              studentEmail: student.email, courseId: course.id, courseTitle: course.title,
              courseLevel: course.level, enrollmentDate: student.enrollmentDate
            });
          });
          this.apply();
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    });
    if (this.students.length === 0) { this.loading = false; this.apply(); }
  }

  apply() {
    let list = [...this.enrollments];
    if (this.search.trim()) {
      const t = this.search.toLowerCase();
      list = list.filter(e => e.studentName?.toLowerCase().includes(t) || e.studentEmail?.toLowerCase().includes(t) || e.courseTitle?.toLowerCase().includes(t));
    }
    if (this.filterLevel) list = list.filter(e => e.courseLevel === this.filterLevel);
    if (this.sortField) {
      list.sort((a: any, b: any) => {
        const va = a[this.sortField] ?? '';
        const vb = b[this.sortField] ?? '';
        const cmp = smartCompare(va, vb);
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    this.filtered = list;
    this.cdr.detectChanges();
  }

  setSort(f: string) { this.sortField === f ? (this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc') : (this.sortField = f, this.sortDir = 'asc'); this.apply(); }
  toggleDir() { this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; this.apply(); }
  si(f: string) { return this.sortField !== f ? '↕' : this.sortDir === 'asc' ? '↑' : '↓'; }
  hasFilters() { return !!(this.search || this.filterLevel || this.sortField); }
  reset() { this.search = ''; this.filterLevel = ''; this.sortField = ''; this.sortDir = 'asc'; this.apply(); }
  formatDate(d: string) { return d ? new Date(d).toLocaleDateString('fr-FR') : ''; }

  openModal() { this.selStudent = ''; this.selCourse = ''; this.showModal = true; }
  closeModal() { this.showModal = false; }

  openEditModal(e: any) { this.editEnrollment = e; this.editCourseId = e.courseId; this.showEditModal = true; }
  closeEditModal() { this.showEditModal = false; this.editEnrollment = null; this.editCourseId = ''; }

  saveEdit() {
    if (!this.editCourseId) { alert('Veuillez sélectionner un cours'); return; }
    // Delete old enrollment then create new one
    this.http.delete(`http://localhost:8080/students-service/students/${this.editEnrollment.studentId}/courses/${this.editEnrollment.courseId}`).subscribe({
      next: () => {
        this.http.post(`http://localhost:8080/students-service/students/${this.editEnrollment.studentId}/courses/${this.editCourseId}`, {}).subscribe({
          next: () => { this.loadData(); this.closeEditModal(); },
          error: () => alert('Erreur lors de la réinscription')
        });
      },
      error: () => alert('Erreur lors de la modification')
    });
  }

  saveEnrollment() {
    if (!this.selStudent || !this.selCourse) { alert('Veuillez sélectionner un étudiant et un cours'); return; }
    this.http.post(`http://localhost:8080/students-service/students/${this.selStudent}/courses/${this.selCourse}`, {}).subscribe({
      next: () => { this.loadData(); this.closeModal(); },
      error: () => alert('Erreur lors de l\'inscription')
    });
  }

  deleteEnrollment(e: any) {
    if (confirm(`Désinscrire ${e.studentName} du cours ${e.courseTitle} ?`)) {
      this.http.delete(`http://localhost:8080/students-service/students/${e.studentId}/courses/${e.courseId}`).subscribe({
        next: () => this.loadData(),
        error: () => alert('Erreur lors de la désinscription')
      });
    }
  }

  canManageEnrollments() { return this.authService.canManageEnrollments(); }
}
