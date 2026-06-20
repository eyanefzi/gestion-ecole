import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsService, Student } from '../services/students.service';
import { AuthService } from '../services/auth.service';
import { ModernDataTableComponent, TableColumn, TableAction } from './modern-data-table.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, ModernDataTableComponent],
  template: `
    <div class="modern-students-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Gestion des Étudiants</h1>
          <p class="subtitle">Gérez les étudiants inscrits sur la plateforme</p>
        </div>
        @if (canManageStudents()) {
          <button class="btn-primary" (click)="openAddModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter un étudiant
          </button>
        }
      </div>

      <!-- Modern Data Table -->
      <app-modern-data-table
        [data]="students"
        [columns]="tableColumns"
        [actions]="tableActions"
        title="Liste des étudiants"
        [subtitle]="getTableSubtitle()"
        [loading]="loading"
        [searchable]="true"
        emptyMessage="Aucun étudiant trouvé. Commencez par ajouter des étudiants à la plateforme."
        (rowClick)="onRowClick($event)"
      >
        <div slot="actions" class="table-actions">
          @if (canManageStudents()) {
            <button class="btn-secondary" (click)="exportStudents()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exporter
            </button>
          }
        </div>
      </app-modern-data-table>

      <!-- View Modal -->
      @if (showViewModal) {
        <div class="modal-overlay" (click)="closeViewModal()">
          <div class="modal modern-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title">
                <div class="modal-icon" style="background:#eff6ff">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <h2>Détails de l'étudiant</h2>
                  <p>Informations complètes</p>
                </div>
              </div>
              <button class="close-btn" (click)="closeViewModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="modal-form" style="padding:24px;display:flex;flex-direction:column;gap:16px">
              <div class="view-row">
                <span class="view-label">ID</span>
                <span class="view-value">{{ viewStudent?.id }}</span>
              </div>
              <div class="view-row">
                <span class="view-label">Prénom</span>
                <span class="view-value">{{ viewStudent?.firstName }}</span>
              </div>
              <div class="view-row">
                <span class="view-label">Nom</span>
                <span class="view-value">{{ viewStudent?.lastName }}</span>
              </div>
              <div class="view-row">
                <span class="view-label">Email</span>
                <span class="view-value">{{ viewStudent?.email }}</span>
              </div>
              <div class="view-row">
                <span class="view-label">Date d'inscription</span>
                <span class="view-value">{{ viewStudent?.enrollmentDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="modal-actions" style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end">
              <button class="btn-secondary" (click)="closeViewModal()">Fermer</button>
            </div>
          </div>
        </div>
      }

      <!-- Add/Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal modern-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title">
                <div class="modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <h2>{{ isEditMode ? 'Modifier l\'étudiant' : 'Ajouter un étudiant' }}</h2>
                  <p>{{ isEditMode ? 'Modifiez les informations de l\'étudiant' : 'Ajoutez un nouvel étudiant à la plateforme' }}</p>
                </div>
              </div>
              <button class="close-btn" (click)="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form (ngSubmit)="saveStudent()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Prénom *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentStudent.firstName" 
                    name="firstName" 
                    required 
                    placeholder="Entrez le prénom"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Nom *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentStudent.lastName" 
                    name="lastName" 
                    required 
                    placeholder="Entrez le nom"
                    class="form-input"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  [(ngModel)]="currentStudent.email" 
                  name="email" 
                  required 
                  placeholder="exemple@email.com"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label>Date d'inscription</label>
                <input 
                  type="date" 
                  [(ngModel)]="currentStudent.enrollmentDate" 
                  name="enrollmentDate"
                  class="form-input"
                />
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
                    {{ isEditMode ? 'Modifier' : 'Ajouter' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal modal-sm danger-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title">
                <div class="modal-icon danger">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div>
                  <h2>Confirmer la suppression</h2>
                  <p>Cette action est irréversible</p>
                </div>
              </div>
            </div>
            
            <div class="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer l'étudiant <strong>{{ studentToDelete?.firstName }} {{ studentToDelete?.lastName }}</strong> ?</p>
              <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Toutes les données associées à cet étudiant seront définitivement perdues.
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeDeleteModal()">
                Annuler
              </button>
              <button class="btn-danger" (click)="deleteStudent()" [disabled]="deleting">
                @if (deleting) {
                  <div class="spinner-sm"></div>
                  Suppression...
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                  </svg>
                  Supprimer
                }
              </button>
            </div>
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
    .view-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .view-row:last-child { border-bottom: none; }
    .view-label { font-size: 13px; font-weight: 600; color: #6b7280; min-width: 140px; }
    .view-value { font-size: 14px; color: #111827; font-weight: 500; }

    .modern-students-container {
      padding: 24px 28px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: calc(100vh - 56px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding: 24px 0;
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .table-actions {
      display: flex;
      gap: 12px;
    }

    /* Modern Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modern-modal {
      background: white;
      border-radius: 20px;
      padding: 0;
      width: 90%;
      max-width: 520px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s ease;
    }

    .modal-sm {
      max-width: 420px;
    }

    .danger-modal {
      border-top: 4px solid #ef4444;
    }

    .modal-header {
      padding: 24px 28px;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
    }

    .modal-title {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      flex: 1;
    }

    .modal-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      color: #2563eb;
      flex-shrink: 0;
    }

    .modal-icon.danger {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      color: #dc2626;
    }

    .modal-title h2 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .modal-title p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .modal-form {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .modal-body {
      padding: 0 28px 20px;
    }

    .modal-body p {
      margin: 0 0 16px;
      font-size: 15px;
      color: #374151;
      line-height: 1.6;
    }

    .warning-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      color: #dc2626;
      font-size: 14px;
      line-height: 1.5;
    }

    .warning-box svg {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
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
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      color: #111827;
      background: white;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 28px;
      border-top: 1px solid #f3f4f6;
      background: #f9fafb;
    }

    /* Buttons */
    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: white;
      color: #374151;
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .btn-danger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Spinner */
    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Toast Notifications */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 1100;
      animation: slideUp 0.3s ease;
      max-width: 400px;
    }

    .success-toast {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .error-toast {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s;
      margin-left: 8px;
    }

    .toast-close:hover {
      color: white;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modern-students-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        flex-direction: column;
      }

      .toast {
        bottom: 16px;
        right: 16px;
        left: 16px;
        max-width: none;
      }
    }
  `]
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  
  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, type: 'number', width: '80px', align: 'center' },
    { key: 'firstName', label: 'Prénom', sortable: true, type: 'text' },
    { key: 'lastName', label: 'Nom', sortable: true, type: 'text' },
    { key: 'email', label: 'Email', sortable: true, type: 'text' },
    { 
      key: 'enrollmentDate', 
      label: 'Date d\'inscription', 
      sortable: true, 
      type: 'date',
      render: (value: any) => value ? new Date(value).toLocaleDateString('fr-FR') : ''
    },
    { key: 'actions', label: 'Actions', type: 'actions', width: '200px', align: 'center' }
  ];

  tableActions: TableAction[] = [];

  showModal = false;
  showDeleteModal = false;
  showViewModal = false;
  viewStudent: Student | null = null;
  isEditMode = false;
  currentStudent: Student = this.empty();
  studentToDelete: Student | null = null;

  loading = false;
  saving = false;
  deleting = false;
  error = '';
  successMessage = '';

  constructor(
    private studentsService: StudentsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.setupTableActions();
  }

  ngOnInit() { 
    this.loadStudents(); 
  }

  setupTableActions() {
    this.tableActions = [
      {
        label: 'Voir',
        icon: 'view',
        color: 'secondary',
        action: (row: Student) => this.openViewModal(row)
      },
      {
        label: 'Modifier',
        icon: 'edit',
        color: 'primary',
        action: (row: Student) => this.openEditModal(row),
        visible: () => this.authService.isTutorOrAdmin()
      },
      {
        label: 'Supprimer',
        icon: 'delete',
        color: 'danger',
        action: (row: Student) => this.confirmDelete(row),
        visible: () => this.authService.isTutorOrAdmin()
      }
    ];
  }

  loadStudents() {
    this.loading = true;
    this.error = '';
    this.studentsService.getAllStudents().subscribe({
      next: (data) => { 
        this.students = data; 
        this.loading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err) => { 
        this.error = 'Erreur lors du chargement des étudiants'; 
        this.loading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  getTableSubtitle(): string {
    return `${this.students.length} étudiant${this.students.length > 1 ? 's' : ''} inscrit${this.students.length > 1 ? 's' : ''}`;
  }

  onRowClick(student: Student) {
    if (this.canManageStudents()) {
      this.openEditModal(student);
    }
  }

  openViewModal(s: Student) {
    this.viewStudent = { ...s };
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewStudent = null;
  }

  openAddModal() { 
    this.isEditMode = false; 
    this.currentStudent = this.empty(); 
    this.showModal = true; 
  }

  openEditModal(s: Student) { 
    this.isEditMode = true; 
    this.currentStudent = { ...s }; 
    this.showModal = true; 
  }

  closeModal() { 
    this.showModal = false; 
    this.currentStudent = this.empty();
  }

  saveStudent() {
    if (!this.currentStudent.firstName || !this.currentStudent.lastName || !this.currentStudent.email) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.saving = true;
    this.error = '';
    
    const obs = this.isEditMode && this.currentStudent.id
      ? this.studentsService.updateStudent(this.currentStudent.id, this.currentStudent)
      : this.studentsService.createStudent(this.currentStudent);
      
    obs.subscribe({
      next: () => { 
        this.saving = false; 
        this.closeModal(); 
        this.loadStudents(); 
        this.showToast(this.isEditMode ? 'Étudiant modifié avec succès !' : 'Étudiant ajouté avec succès !'); 
      },
      error: (err) => { 
        this.saving = false; 
        this.error = 'Erreur lors de l\'enregistrement de l\'étudiant'; 
        this.cdr.detectChanges(); 
      }
    });
  }

  confirmDelete(s: Student) { 
    this.studentToDelete = s; 
    this.showDeleteModal = true; 
  }

  closeDeleteModal() { 
    this.showDeleteModal = false; 
    this.studentToDelete = null; 
  }

  deleteStudent() {
    if (!this.studentToDelete?.id) return;
    
    this.deleting = true;
    this.error = '';
    
    this.studentsService.deleteStudent(this.studentToDelete.id).subscribe({
      next: () => { 
        this.deleting = false; 
        this.closeDeleteModal(); 
        this.loadStudents(); 
        this.showToast('Étudiant supprimé avec succès !'); 
      },
      error: (err) => { 
        this.deleting = false; 
        this.error = 'Erreur lors de la suppression de l\'étudiant'; 
        this.cdr.detectChanges(); 
      }
    });
  }

  exportStudents() {
    const data = this.students.map(student => ({
      ID: student.id,
      Prénom: student.firstName,
      Nom: student.lastName,
      Email: student.email,
      'Date d\'inscription': student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('fr-FR') : ''
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etudiants-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.showToast('Export des étudiants terminé !');
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }

  showToast(msg: string) {
    this.successMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => { 
      this.successMessage = ''; 
      this.cdr.detectChanges(); 
    }, 4000);
  }

  empty(): Student { 
    return { 
      firstName: '', 
      lastName: '', 
      email: '', 
      enrollmentDate: new Date().toISOString().split('T')[0] 
    }; 
  }

  canManageStudents(): boolean { 
    return this.authService.canManageStudents(); 
  }
}
