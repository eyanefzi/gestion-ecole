import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

function smartCompare(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && /^\d{4}-\d{2}-\d{2}/.test(a)) return new Date(a).getTime() - new Date(b).getTime();
  if (typeof a === 'number' || !isNaN(Number(a))) return Number(a) - Number(b);
  return a.toString().toLowerCase().localeCompare(b.toString().toLowerCase(), 'fr');
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-courses-container">
      <div class="page-header">
        <h1>📚 Mes Cours</h1>
      </div>

      <!-- Mes cours inscrits -->
      <div class="section">
        <h2>Cours auxquels je suis inscrit
          <span class="count-badge" *ngIf="filteredMy.length !== myCourses.length">
            {{ filteredMy.length }}/{{ myCourses.length }}
          </span>
        </h2>

        <!-- Toolbar enrolled -->
        <div class="toolbar" *ngIf="myCourses.length > 0">
          <div class="search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher dans mes cours…" [(ngModel)]="searchMy" (ngModelChange)="applyMyFilters()" />
            <button *ngIf="searchMy" class="clear-btn" (click)="searchMy=''; applyMyFilters()">✕</button>
          </div>
          <div class="filters">
            <select [(ngModel)]="filterMyLevel" (ngModelChange)="applyMyFilters()" class="filter-select">
              <option value="">Tous niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
            <select [(ngModel)]="sortMyField" (ngModelChange)="applyMyFilters()" class="filter-select">
              <option value="">Trier par…</option>
              <option value="title">Titre</option>
              <option value="instructor">Instructeur</option>
              <option value="durationHours">Durée</option>
              <option value="level">Niveau</option>
            </select>
            <button class="sort-dir-btn" (click)="toggleMyDir()">{{ sortMyDir === 'asc' ? '↑' : '↓' }}</button>
            <button class="reset-btn" *ngIf="hasMyFilters()" (click)="resetMyFilters()">↺ Réinitialiser</button>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>

        <div *ngIf="!loading && myCourses.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <p>Vous n'êtes inscrit à aucun cours pour le moment</p>
          <button class="btn-primary" (click)="showAvailableCourses = true">Parcourir les cours disponibles</button>
        </div>

        <div *ngIf="!loading && myCourses.length > 0 && filteredMy.length === 0" class="empty-state">
          <p>Aucun cours ne correspond à votre recherche</p>
          <button class="btn-secondary" (click)="resetMyFilters()">Réinitialiser les filtres</button>
        </div>

        <div class="courses-grid" *ngIf="!loading && filteredMy.length > 0">
          <div class="course-card enrolled" *ngFor="let course of filteredMy">
            <div class="course-header">
              <span class="badge" [class]="'badge-' + course.level.toLowerCase()">{{getLevelLabel(course.level)}}</span>
              <span class="enrolled-badge">✓ Inscrit</span>
            </div>
            <h3>{{course.title}}</h3>
            <p class="course-instructor">👨‍🏫 {{course.instructor}}</p>
            <p class="course-description">{{course.description}}</p>
            <div class="course-footer">
              <span class="course-duration">⏱️ {{course.durationHours}}h</span>
              <button class="btn-danger-outline" (click)="unenrollFromCourse(course.id)">Se désinscrire</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cours disponibles -->
      <div class="section" *ngIf="showAvailableCourses || myCourses.length > 0">
        <div class="section-header">
          <h2>Cours disponibles
            <span class="count-badge" *ngIf="filteredAvailable.length !== availableCourses.length">
              {{ filteredAvailable.length }}/{{ availableCourses.length }}
            </span>
          </h2>
          <button class="btn-secondary" (click)="showAvailableCourses = !showAvailableCourses">
            {{showAvailableCourses ? 'Masquer' : 'Afficher'}}
          </button>
        </div>

        <!-- Toolbar available -->
        <div class="toolbar" *ngIf="showAvailableCourses && availableCourses.length > 0">
          <div class="search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher dans les cours disponibles…" [(ngModel)]="searchAvail" (ngModelChange)="applyAvailFilters()" />
            <button *ngIf="searchAvail" class="clear-btn" (click)="searchAvail=''; applyAvailFilters()">✕</button>
          </div>
          <div class="filters">
            <select [(ngModel)]="filterAvailLevel" (ngModelChange)="applyAvailFilters()" class="filter-select">
              <option value="">Tous niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
            <select [(ngModel)]="sortAvailField" (ngModelChange)="applyAvailFilters()" class="filter-select">
              <option value="">Trier par…</option>
              <option value="title">Titre</option>
              <option value="instructor">Instructeur</option>
              <option value="durationHours">Durée</option>
              <option value="level">Niveau</option>
            </select>
            <button class="sort-dir-btn" (click)="toggleAvailDir()">{{ sortAvailDir === 'asc' ? '↑' : '↓' }}</button>
            <button class="reset-btn" *ngIf="hasAvailFilters()" (click)="resetAvailFilters()">↺ Réinitialiser</button>
          </div>
        </div>

        <div class="courses-grid" *ngIf="showAvailableCourses">
          <div class="course-card" *ngFor="let course of filteredAvailable">
            <div class="course-header">
              <span class="badge" [class]="'badge-' + course.level.toLowerCase()">{{getLevelLabel(course.level)}}</span>
            </div>
            <h3>{{course.title}}</h3>
            <p class="course-instructor">👨‍🏫 {{course.instructor}}</p>
            <p class="course-description">{{course.description}}</p>
            <div class="course-footer">
              <span class="course-duration">⏱️ {{course.durationHours}}h</span>
              <button class="btn-primary" (click)="enrollInCourse(course.id)">S'inscrire</button>
            </div>
          </div>
          <div *ngIf="filteredAvailable.length === 0 && availableCourses.length > 0" class="empty-state" style="grid-column:1/-1">
            <p>Aucun cours ne correspond à votre recherche</p>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="successMessage" class="success-toast">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        {{successMessage}}
      </div>
    </div>
  `,
  styles: [`
    .my-courses-container { min-height: 100vh; background: #f4f5f7; padding: 28px 32px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
    .section { margin-bottom: 40px; }
    .section h2 { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px; }
    .count-badge { background: #e5e7eb; color: #6b7280; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .section-header h2 { margin: 0; }

    .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 220px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0 12px; gap: 8px; }
    .search-wrap:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .search-wrap svg { color: #9ca3af; flex-shrink: 0; }
    .search-wrap input { flex: 1; border: none; outline: none; padding: 9px 0; font-size: 13.5px; background: transparent; color: #111827; }
    .clear-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 14px; }
    .filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .filter-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: white; color: #374151; cursor: pointer; outline: none; }
    .filter-select:focus { border-color: #3b82f6; }
    .sort-dir-btn { width: 36px; height: 36px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; font-size: 16px; }
    .reset-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid #fca5a5; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 600; cursor: pointer; }

    .loading { text-align: center; padding: 48px 20px; color: #6b7280; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 32px 20px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
    .empty-state svg { color: #d1d5db; margin-bottom: 12px; }
    .empty-state p { font-size: 15px; color: #6b7280; margin: 0 0 16px 0; }

    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .course-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: box-shadow 0.2s; }
    .course-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.07); }
    .course-card.enrolled { border-color: #a7f3d0; background: #f0fdf4; }
    .course-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; text-transform: uppercase; }
    .badge-beginner    { background: #ecfdf5; color: #2563eb; }
    .badge-intermediate{ background: #eff6ff; color: #2563eb; }
    .badge-advanced    { background: #fef2f2; color: #dc2626; }
    .enrolled-badge { padding: 4px 10px; background: #ecfdf5; color: #2563eb; border-radius: 6px; font-size: 11.5px; font-weight: 600; }
    .course-card h3 { font-size: 17px; font-weight: 700; color: #111827; margin: 0 0 6px 0; }
    .course-instructor { font-size: 13px; color: #6b7280; margin: 0 0 10px 0; }
    .course-description { font-size: 13px; color: #6b7280; margin: 0 0 14px 0; line-height: 1.5; }
    .course-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #f3f4f6; }
    .course-duration { font-size: 13px; color: #6b7280; }

    .btn-primary, .btn-secondary, .btn-danger-outline { padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-danger-outline { background: transparent; color: #ef4444; border: 1px solid #fca5a5; }
    .btn-danger-outline:hover { background: #fef2f2; }

    .success-toast { position: fixed; bottom: 28px; right: 28px; background: #2563eb; color: white; padding: 14px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 20px rgba(37,99,235,.3); z-index: 1000; animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(300px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @media (max-width: 768px) { .my-courses-container { padding: 16px; } .courses-grid { grid-template-columns: 1fr; } }
  `]
})
export class MyCoursesComponent implements OnInit {
  myCourses: any[] = [];
  filteredMy: any[] = [];
  availableCourses: any[] = [];
  filteredAvailable: any[] = [];
  loading = true;
  showAvailableCourses = false;
  successMessage = '';
  studentId: string = '';

  // Filters for enrolled courses
  searchMy = '';
  filterMyLevel = '';
  sortMyField = '';
  sortMyDir: 'asc' | 'desc' = 'asc';

  // Filters for available courses
  searchAvail = '';
  filterAvailLevel = '';
  sortAvailField = '';
  sortAvailDir: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const username = this.authService.getUserInfo().username;
    this.loadStudentData(username);
  }

  loadStudentData(username: string) {
    this.http.get<any[]>('http://localhost:8080/students-service/students').subscribe({
      next: (students) => {
        const student = students.find(s =>
          s.email === this.authService.getUserInfo().email ||
          s.email?.toLowerCase().includes(username.toLowerCase())
        );
        if (student) {
          this.studentId = student.id;
          this.loadMyCourses();
        } else if (students.length > 0) {
          this.studentId = students[0].id;
          this.loadMyCourses();
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  loadMyCourses() {
    this.loading = true;
    this.http.get<any>(`http://localhost:8080/students-service/students/${this.studentId}/courses`).subscribe({
      next: (data) => {
        this.myCourses = data.courses || [];
        this.applyMyFilters();
        this.loadAllCourses();
      },
      error: () => { this.loading = false; }
    });
  }

  loadAllCourses() {
    this.http.get<any[]>('http://localhost:8080/courses-service/courses').subscribe({
      next: (courses) => {
        const enrolledIds = this.myCourses.map(c => c.id);
        this.availableCourses = courses.filter(c => !enrolledIds.includes(c.id));
        this.applyAvailFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  // --- Enrolled filters ---
  applyMyFilters() {
    let list = [...this.myCourses];
    if (this.searchMy.trim()) {
      const t = this.searchMy.toLowerCase();
      list = list.filter(c => c.title?.toLowerCase().includes(t) || c.instructor?.toLowerCase().includes(t));
    }
    if (this.filterMyLevel) list = list.filter(c => c.level === this.filterMyLevel);
    if (this.sortMyField) {
      list.sort((a: any, b: any) => {
        const cmp = smartCompare(a[this.sortMyField], b[this.sortMyField]);
        return this.sortMyDir === 'asc' ? cmp : -cmp;
      });
    }
    this.filteredMy = list;
    this.cdr.detectChanges();
  }

  toggleMyDir() { this.sortMyDir = this.sortMyDir === 'asc' ? 'desc' : 'asc'; this.applyMyFilters(); }
  hasMyFilters() { return !!(this.searchMy || this.filterMyLevel || this.sortMyField); }
  resetMyFilters() { this.searchMy = ''; this.filterMyLevel = ''; this.sortMyField = ''; this.sortMyDir = 'asc'; this.applyMyFilters(); }

  // --- Available filters ---
  applyAvailFilters() {
    let list = [...this.availableCourses];
    if (this.searchAvail.trim()) {
      const t = this.searchAvail.toLowerCase();
      list = list.filter(c => c.title?.toLowerCase().includes(t) || c.instructor?.toLowerCase().includes(t));
    }
    if (this.filterAvailLevel) list = list.filter(c => c.level === this.filterAvailLevel);
    if (this.sortAvailField) {
      list.sort((a: any, b: any) => {
        const cmp = smartCompare(a[this.sortAvailField], b[this.sortAvailField]);
        return this.sortAvailDir === 'asc' ? cmp : -cmp;
      });
    }
    this.filteredAvailable = list;
    this.cdr.detectChanges();
  }

  toggleAvailDir() { this.sortAvailDir = this.sortAvailDir === 'asc' ? 'desc' : 'asc'; this.applyAvailFilters(); }
  hasAvailFilters() { return !!(this.searchAvail || this.filterAvailLevel || this.sortAvailField); }
  resetAvailFilters() { this.searchAvail = ''; this.filterAvailLevel = ''; this.sortAvailField = ''; this.sortAvailDir = 'asc'; this.applyAvailFilters(); }

  enrollInCourse(courseId: number) {
    this.http.post(`http://localhost:8080/students-service/students/${this.studentId}/courses/${courseId}`, {}).subscribe({
      next: () => { this.showSuccess('Inscription réussie!'); this.loadMyCourses(); },
      error: () => alert('Erreur lors de l\'inscription')
    });
  }

  unenrollFromCourse(courseId: number) {
    if (confirm('Êtes-vous sûr de vouloir vous désinscrire de ce cours ?')) {
      this.http.delete(`http://localhost:8080/students-service/students/${this.studentId}/courses/${courseId}`).subscribe({
        next: () => { this.showSuccess('Désinscription réussie!'); this.loadMyCourses(); },
        error: () => alert('Erreur lors de la désinscription')
      });
    }
  }

  getLevelLabel(level: string): string {
    const map: any = { BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé' };
    return map[level] || level;
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
  }
}
