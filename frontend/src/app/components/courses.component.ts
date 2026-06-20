import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ModernDataTableComponent, TableColumn, TableAction } from './modern-data-table.component';
import { ModernStatsCardComponent } from './modern-stats-card.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ModernDataTableComponent, ModernStatsCardComponent],
  template: `
    <div class="modern-courses-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Gestion des Cours</h1>
          <p class="subtitle">Explorez et gérez le catalogue de formations</p>
        </div>
        @if (canManageCourses()) {
          <button class="btn-primary" (click)="openModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau cours
          </button>
        }
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <app-modern-stats-card
          title="Total cours"
          [value]="courses.length"
          iconColor="blue"
          theme="blue"
          trend="up"
          [trendValue]="12"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </app-modern-stats-card>

        <app-modern-stats-card
          title="Niveau débutant"
          [value]="count('BEGINNER')"
          iconColor="green"
          theme="primary"
          trend="up"
          [trendValue]="8"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
        </app-modern-stats-card>

        <app-modern-stats-card
          title="Niveau intermédiaire"
          [value]="count('INTERMEDIATE')"
          iconColor="orange"
          theme="orange"
          trend="up"
          [trendValue]="15"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"/>
          </svg>
        </app-modern-stats-card>

        <app-modern-stats-card
          title="Niveau avancé"
          [value]="count('ADVANCED')"
          iconColor="red"
          theme="red"
          trend="up"
          [trendValue]="5"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </app-modern-stats-card>
      </div>

      <!-- Modern Data Table -->
      <app-modern-data-table
        [data]="filtered"
        [columns]="tableColumns"
        [actions]="tableActions"
        title="Catalogue des Cours"
        [subtitle]="getTableSubtitle()"
        [loading]="loading"
        [searchable]="true"
        emptyMessage="Aucun cours trouvé. Créez le premier cours de la plateforme."
        (rowClick)="onRowClick($event)"
      >
        <div slot="actions" class="table-actions">
          <div class="filters">
            <select [(ngModel)]="filterLevel" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">Tous les niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
          </div>
        </div>
      </app-modern-data-table>

      <!-- Add/Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal modern-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title">
                <div class="modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div>
                  <h2>{{ editMode ? 'Modifier le cours' : 'Nouveau cours' }}</h2>
                  <p>{{ editMode ? 'Modifiez les informations du cours' : 'Créez un nouveau cours pour la plateforme' }}</p>
                </div>
              </div>
              <button class="close-btn" (click)="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form (ngSubmit)="saveCourse()" class="modal-form">
              <div class="form-group">
                <label>Titre du cours *</label>
                <input 
                  type="text" 
                  [(ngModel)]="cur.title" 
                  name="title" 
                  required 
                  placeholder="Entrez le titre du cours"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label>Description</label>
                <textarea 
                  [(ngModel)]="cur.description" 
                  name="description" 
                  rows="3"
                  placeholder="Décrivez le contenu et les objectifs du cours"
                  class="form-input"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>Instructeur *</label>
                <input 
                  type="text" 
                  [(ngModel)]="cur.instructor" 
                  name="instructor" 
                  required 
                  placeholder="Nom de l'instructeur"
                  class="form-input"
                />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Durée (heures) *</label>
                  <input 
                    type="number" 
                    [(ngModel)]="cur.durationHours" 
                    name="duration" 
                    required 
                    min="1"
                    max="200"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Niveau *</label>
                  <select [(ngModel)]="cur.level" name="level" required class="form-input">
                    <option value="">Sélectionnez un niveau</option>
                    <option value="BEGINNER">Débutant</option>
                    <option value="INTERMEDIATE">Intermédiaire</option>
                    <option value="ADVANCED">Avancé</option>
                  </select>
                </div>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeModal()">
                  Annuler
                </button>
                <button type="submit" class="btn-primary" [disabled]="saving">
                  @if (saving) {
                    <div class="spinner-sm"></div>
                    Enregistrement...
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    {{ editMode ? 'Modifier' : 'Créer' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Success Toast -->
      @if (successMessage) {
        <div class="toast success-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {{ successMessage }}
        </div>
      }

      <!-- Error Toast -->
      @if (error) {
        <div class="toast error-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
          <button class="toast-close" (click)="error = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .modern-courses-container {
      padding: 24px 28px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 16px;
      color: #64748b;
      margin: 0;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .table-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .filters {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .filter-select {
      padding: 10px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      background: white;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 160px;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modern-modal {
      background: white;
      border-radius: 20px;
      padding: 0;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 28px;
      border-bottom: 1px solid #f1f5f9;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    }

    .modal-title {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .modal-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .modal-title h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px 0;
    }

    .modal-title p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f1f5f9;
      color: #475569;
    }

    .modal-form {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .form-input {
      padding: 12px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      color: #1e293b;
      transition: all 0.2s;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-input::placeholder {
      color: #94a3b8;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px 28px;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }

    .btn-secondary {
      padding: 12px 24px;
      border: 1.5px solid #e2e8f0;
      background: white;
      color: #475569;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Toast Notifications */
    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1100;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .success-toast {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      color: #2563eb;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .error-toast {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: currentColor;
      opacity: 0.7;
      padding: 4px;
      border-radius: 4px;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .modern-courses-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .modal-actions {
        flex-direction: column-reverse;
      }

      .toast {
        left: 16px;
        right: 16px;
        top: 16px;
      }
    }

    @media (max-width: 480px) {
      .modern-modal {
        width: 95%;
        margin: 16px;
      }

      .modal-form {
        padding: 20px;
      }

      .modal-header {
        padding: 20px;
      }

      .modal-actions {
        padding: 20px;
      }
    }
  `]
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  filtered: any[] = [];
  loading = false;
  saving = false;

  // Modal state
  showModal = false;
  editMode = false;
  cur: any = {};

  // Filters
  filterLevel = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'title', label: 'Titre', sortable: true, type: 'text' },
    { key: 'instructor', label: 'Instructeur', sortable: true, type: 'text' },
    { key: 'durationHours', label: 'Durée (h)', sortable: true, type: 'number', align: 'center' },
    { key: 'level', label: 'Niveau', sortable: true, type: 'badge' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Modifier',
      icon: 'edit',
      color: 'primary',
      action: (row) => this.editCourse(row),
      visible: () => this.canManageCourses()
    },
    {
      label: 'Supprimer',
      icon: 'delete',
      color: 'danger',
      action: (row) => this.deleteCourse(row.id),
      visible: () => this.canManageCourses()
    }
  ];

  // Toast messages
  successMessage = '';
  error = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8080/courses-service/courses').subscribe({
      next: (data) => {
        this.courses = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des cours';
        this.loading = false;
        this.cdr.detectChanges();
        this.hideErrorAfterDelay();
      }
    });
  }

  applyFilters() {
    let result = [...this.courses];
    
    if (this.filterLevel) {
      result = result.filter(course => course.level === this.filterLevel);
    }
    
    this.filtered = result;
    this.cdr.detectChanges();
  }

  // Stats calculations
  count(level: string): number {
    return this.courses.filter(c => c.level === level).length;
  }

  getTableSubtitle(): string {
    return `${this.filtered.length} cours affiché(s) sur ${this.courses.length}`;
  }

  // Modal operations
  openModal() {
    this.editMode = false;
    this.cur = {
      title: '',
      description: '',
      instructor: '',
      durationHours: 1,
      level: 'BEGINNER'
    };
    this.showModal = true;
  }

  editCourse(course: any) {
    this.editMode = true;
    this.cur = { ...course };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.cur = {};
    this.editMode = false;
  }

  saveCourse() {
    if (!this.cur.title?.trim() || !this.cur.instructor?.trim() || !this.cur.durationHours) {
      this.error = 'Veuillez remplir tous les champs requis';
      this.hideErrorAfterDelay();
      return;
    }

    this.saving = true;
    const courseData = { ...this.cur };

    const request = this.editMode
      ? this.http.put(`http://localhost:8080/courses-service/courses/${courseData.id}`, courseData)
      : this.http.post('http://localhost:8080/courses-service/courses', courseData);

    request.subscribe({
      next: () => {
        this.successMessage = this.editMode 
          ? 'Cours modifié avec succès' 
          : 'Cours créé avec succès';
        this.load();
        this.closeModal();
        this.saving = false;
        this.hideSuccessAfterDelay();
      },
      error: (err) => {
        this.error = 'Erreur lors de la sauvegarde du cours';
        this.saving = false;
        this.hideErrorAfterDelay();
      }
    });
  }

  deleteCourse(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    this.http.delete(`http://localhost:8080/courses-service/courses/${id}`).subscribe({
      next: () => {
        this.successMessage = 'Cours supprimé avec succès';
        this.load();
        this.hideSuccessAfterDelay();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression du cours';
        this.hideErrorAfterDelay();
      }
    });
  }

  // Table events
  onRowClick(course: any) {
    // Could open a detail view or perform an action
    console.log('Course clicked:', course);
  }

  // Permission checks
  canManageCourses(): boolean {
    return this.authService.canManageCourses();
  }

  // Utility methods
  private hideSuccessAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  private hideErrorAfterDelay() {
    setTimeout(() => {
      this.error = '';
      this.cdr.detectChanges();
    }, 5000);
  }
}
