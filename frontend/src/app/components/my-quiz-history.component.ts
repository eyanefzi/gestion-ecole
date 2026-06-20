import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

function smartCompare(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && /^\d{4}-\d{2}-\d{2}/.test(a)) return new Date(a).getTime() - new Date(b).getTime();
  if (typeof a === 'number' || !isNaN(Number(a))) return Number(a) - Number(b);
  return a.toString().toLowerCase().localeCompare(b.toString().toLowerCase(), 'fr');
}

@Component({
  selector: 'app-my-quiz-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>📊 Mon Historique de Quiz</h1>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher par titre de quiz…" [(ngModel)]="search" (ngModelChange)="applyFilters()" />
          <button *ngIf="search" class="clear-btn" (click)="search=''; applyFilters()">✕</button>
        </div>
        <div class="filters">
          <select [(ngModel)]="filterResult" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">Tous résultats</option>
            <option value="passed">Réussi</option>
            <option value="failed">Échoué</option>
          </select>
          <select [(ngModel)]="sortField" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">Trier par…</option>
            <option value="quizTitle">Titre</option>
            <option value="score">Score</option>
            <option value="completedAt">Date</option>
          </select>
          <button class="sort-dir-btn" (click)="toggleDir()">{{ sortDir === 'asc' ? '↑' : '↓' }}</button>
          <button class="reset-btn" *ngIf="hasFilters()" (click)="resetFilters()">↺ Réinitialiser</button>
        </div>
      </div>
      <p class="results-count">{{ filtered.length }} résultat(s) sur {{ attempts.length }}</p>

      <div class="history-grid">
        <div class="history-card" *ngFor="let attempt of filtered">
          <div class="card-header">
            <h3>{{attempt.quizTitle || 'Quiz #' + attempt.quizId}}</h3>
            <span class="badge" [class.passed]="attempt.passed" [class.failed]="!attempt.passed">
              {{attempt.passed ? '✓ Réussi' : '✗ Échoué'}}
            </span>
          </div>
          
          <div class="score-section">
            <div class="score-circle" [class.passed]="attempt.passed" [class.failed]="!attempt.passed">
              <span class="score-value">{{attempt.score}}%</span>
            </div>
          </div>

          <div class="stats">
            <div class="stat">
              <span class="stat-label">Bonnes réponses</span>
              <span class="stat-value">{{attempt.correctAnswers}}/{{attempt.totalQuestions}}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Date</span>
              <span class="stat-value">{{attempt.completedAt | date:'dd/MM/yyyy HH:mm'}}</span>
            </div>
          </div>
        </div>

        <div *ngIf="filtered.length === 0 && !loading" class="no-data">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p>Vous n'avez pas encore passé de quiz</p>
          <button class="btn-primary" (click)="goToQuizzes()">Voir les quiz disponibles</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
    .page-header { margin-bottom: 20px; }
    .page-header h1 { color: white; margin: 0; }
    .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
    .search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 220px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0 12px; gap: 8px; }
    .search-wrap input { flex: 1; border: none; outline: none; padding: 9px 0; font-size: 13.5px; background: transparent; color: #111827; }
    .clear-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 14px; }
    .filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .filter-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: white; color: #374151; cursor: pointer; outline: none; }
    .sort-dir-btn { width: 36px; height: 36px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; font-size: 16px; }
    .reset-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid #fca5a5; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 600; cursor: pointer; }
    .results-count { color: rgba(255,255,255,.7); font-size: 13px; margin: 0 0 16px; }
    
    .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    
    .history-card { 
      background: white; 
      padding: 30px; 
      border-radius: 15px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .history-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
    
    .card-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: start; 
      margin-bottom: 25px; 
    }
    .card-header h3 { margin: 0; color: #333; font-size: 20px; }
    
    .badge { 
      padding: 8px 16px; 
      border-radius: 20px; 
      font-size: 13px; 
      font-weight: 600; 
    }
    .badge.passed { background: #e8f5e9; color: #388e3c; }
    .badge.failed { background: #ffebee; color: #d32f2f; }
    
    .score-section { 
      display: flex; 
      justify-content: center; 
      margin-bottom: 25px; 
    }
    
    .score-circle { 
      width: 120px; 
      height: 120px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .score-circle.passed { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
    .score-circle.failed { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    
    .score-value { 
      font-size: 32px; 
      font-weight: 700; 
      color: white; 
    }
    
    .stats { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 15px; 
    }
    
    .stat { 
      background: #f8f9fa; 
      padding: 15px; 
      border-radius: 10px; 
      text-align: center; 
    }
    
    .stat-label { 
      display: block; 
      font-size: 12px; 
      color: #666; 
      margin-bottom: 5px; 
    }
    
    .stat-value { 
      display: block; 
      font-size: 18px; 
      font-weight: 700; 
      color: #333; 
    }
    
    .no-data { 
      grid-column: 1 / -1; 
      text-align: center; 
      padding: 60px 20px; 
      background: white; 
      border-radius: 15px; 
    }
    .no-data svg { color: #ccc; margin-bottom: 20px; }
    .no-data p { color: #666; font-size: 18px; margin-bottom: 20px; }
    
    .btn-primary { 
      background: #2563eb; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer; 
    }
  `]
})
export class MyQuizHistoryComponent implements OnInit {
  attempts: any[] = [];
  filtered: any[] = [];
  loading = false;
  studentId: number | null = null;

  search = '';
  filterResult = '';
  sortField = 'completedAt';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStudentId();
  }

  loadStudentId() {
    const email = localStorage.getItem('user_email');
    if (email) {
      this.http.get<any[]>('http://localhost:8080/students-service/students').subscribe({
        next: (students) => {
          const student = students.find(s => s.email === email);
          if (student) {
            this.studentId = student.id;
            this.loadAttempts();
          }
        },
        error: (err) => console.error('Error loading student:', err)
      });
    }
  }

  loadAttempts() {
    if (!this.studentId) return;

    this.http.get<any[]>(`http://localhost:8080/quiz-service/api/quizzes/attempts/student/${this.studentId}`).subscribe({
      next: (attempts) => {
        this.attempts = attempts;
        this.loadQuizTitles();
      },
      error: (err) => console.error('Error loading attempts:', err)
    });
  }

  loadQuizTitles() {
    this.http.get<any[]>('http://localhost:8080/quiz-service/api/quizzes').subscribe({
      next: (quizzes) => {
        this.attempts = this.attempts.map(attempt => ({
          ...attempt,
          quizTitle: quizzes.find(q => q.id === attempt.quizId)?.title
        }));
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading quizzes:', err)
    });
  }

  applyFilters() {
    let list = [...this.attempts];
    if (this.search.trim()) {
      const t = this.search.toLowerCase();
      list = list.filter(a => a.quizTitle?.toLowerCase().includes(t));
    }
    if (this.filterResult === 'passed') list = list.filter(a => a.passed);
    if (this.filterResult === 'failed') list = list.filter(a => !a.passed);
    if (this.sortField) {
      list.sort((a: any, b: any) => {
        const cmp = smartCompare(a[this.sortField], b[this.sortField]);
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    this.filtered = list;
    this.cdr.detectChanges();
  }

  toggleDir() { this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; this.applyFilters(); }
  hasFilters() { return !!(this.search || this.filterResult || (this.sortField && this.sortField !== 'completedAt')); }
  resetFilters() { this.search = ''; this.filterResult = ''; this.sortField = 'completedAt'; this.sortDir = 'desc'; this.applyFilters(); }

  goToQuizzes() {
    this.router.navigate(['/quiz']);
  }
}
