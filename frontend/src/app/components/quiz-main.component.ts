import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-quiz-main',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">Quiz & Évaluations</h1>
          <p class="page-subtitle">Testez vos connaissances et suivez vos progrès</p>
        </div>
        <div class="header-actions" *ngIf="canCreateQuiz()">
          <button class="btn-primary" (click)="openCreateModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau Quiz
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="!loading">
        <div class="stat-card primary">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ quizzes.length }}</div>
            <div class="stat-label">Quiz Disponibles</div>
          </div>
        </div>

        <div class="stat-card success" *ngIf="authService.isStudent()">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getCompletedCount() }}</div>
            <div class="stat-label">Quiz Complétés</div>
          </div>
        </div>

        <div class="stat-card warning" *ngIf="authService.isStudent()">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getAverageScore() }}%</div>
            <div class="stat-label">Score Moyen</div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section" *ngIf="!loading">
        <div class="filters-container">
          <!-- Search Bar -->
          <div class="search-group">
            <label>Rechercher:</label>
            <div class="search-input-wrapper">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (ngModelChange)="applyFilters()"
                (keydown)="onSearchKeydown($event)"
                placeholder="Rechercher par titre, description ou cours... (Ctrl+K)"
                class="search-input"
              />
              <button 
                *ngIf="searchTerm" 
                class="clear-search" 
                (click)="clearSearch()"
                title="Effacer la recherche"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label>Cours:</label>
            <select [(ngModel)]="filterCourse" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">Tous les cours</option>
              <option *ngFor="let course of courses" [value]="course.id">{{ course.title }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Difficulté:</label>
            <select [(ngModel)]="filterDifficulty" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">Toutes</option>
              <option value="EASY">Facile</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HARD">Difficile</option>
            </select>
          </div>

          <div class="filter-group" *ngIf="authService.isStudent()">
            <label>Statut:</label>
            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">Tous</option>
              <option value="completed">Complétés</option>
              <option value="pending">Non passés</option>
            </select>
          </div>

          <!-- Clear All Filters -->
          <div class="filter-actions" *ngIf="hasActiveFilters()">
            <button class="clear-filters-btn" (click)="clearAllFilters()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18l-2 13H5L3 6z"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Effacer les filtres
            </button>
          </div>
        </div>

        <!-- Search Results Info -->
        <div class="search-results-info" *ngIf="searchTerm || hasActiveFilters()">
          <div class="results-count">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {{ filteredQuizzes.length }} résultat{{ filteredQuizzes.length > 1 ? 's' : '' }} trouvé{{ filteredQuizzes.length > 1 ? 's' : '' }}
            <span *ngIf="searchTerm"> pour "{{ searchTerm }}"</span>
          </div>
          <div class="active-filters" *ngIf="getActiveFiltersText()">
            <span class="filters-label">Filtres actifs:</span>
            <span class="filters-text">{{ getActiveFiltersText() }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Chargement des quiz...</p>
      </div>

      <!-- Quiz Grid -->
      <div class="quiz-grid" *ngIf="!loading">
        <div *ngFor="let quiz of filteredQuizzes" class="quiz-card" [class.completed]="quiz.isCompleted">
          <div class="quiz-header">
            <div class="quiz-title" [innerHTML]="highlightSearchTerm(quiz.title)"></div>
            <div class="quiz-difficulty" [class]="'difficulty-' + quiz.difficulty?.toLowerCase()">
              {{ getDifficultyLabel(quiz.difficulty) }}
            </div>
          </div>
          
          <div class="quiz-content">
            <p class="quiz-description">{{ quiz.description || 'Aucune description disponible' }}</p>
            
            <div class="quiz-meta">
              <div class="meta-item" *ngIf="quiz.courseName">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>{{ quiz.courseName }}</span>
              </div>
              
              <div class="meta-item" *ngIf="quiz.timeLimit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ quiz.timeLimit }} min</span>
              </div>
              
              <div class="meta-item" *ngIf="quiz.passingScore">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <span>{{ quiz.passingScore }}% requis</span>
              </div>
            </div>
          </div>

          <div class="quiz-footer">
            <div class="quiz-status" *ngIf="authService.isStudent()">
              <span class="status-badge" [class]="quiz.isCompleted ? 'completed' : 'pending'">
                {{ quiz.isCompleted ? 'Complété' : 'Non passé' }}
              </span>
              <span *ngIf="quiz.isCompleted && quiz.lastScore !== undefined" class="score">
                Score: {{ quiz.lastScore }}%
              </span>
            </div>
            
            <div class="quiz-actions">
              <button 
                *ngIf="authService.isStudent() && !quiz.isCompleted" 
                (click)="takeQuiz(quiz.id)" 
                class="btn-primary">
                Passer le quiz
              </button>
              
              <button 
                *ngIf="authService.isStudent() && quiz.isCompleted" 
                (click)="viewResults(quiz.id)" 
                class="btn-secondary">
                Voir les résultats
              </button>

              <div class="admin-actions" *ngIf="canCreateQuiz()">
                <button (click)="editQuiz(quiz)" class="btn-icon" title="Modifier">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button (click)="manageQuestions(quiz)" class="btn-icon" title="Questions">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </button>
                <button (click)="deleteQuiz(quiz.id)" class="btn-icon danger" title="Supprimer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredQuizzes.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <h3>Aucun quiz disponible</h3>
          <p>{{ getEmptyStateMessage() }}</p>
          <button *ngIf="canCreateQuiz()" (click)="openCreateModal()" class="btn-primary">
            Créer le premier quiz
          </button>
        </div>
      </div>

      <!-- Results Modal -->
      <div *ngIf="showResultsModal" class="modal-overlay" (click)="closeResultsModal()">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" [style.background]="selectedResult?.passed ? '#d1fae5' : '#fee2e2'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" [attr.stroke]="selectedResult?.passed ? '#3b82f6' : '#ef4444'" stroke-width="2">
                  <path *ngIf="selectedResult?.passed" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline *ngIf="selectedResult?.passed" points="22 4 12 14.01 9 11.01"/>
                  <circle *ngIf="!selectedResult?.passed" cx="12" cy="12" r="10"/><line *ngIf="!selectedResult?.passed" x1="15" y1="9" x2="9" y2="15"/><line *ngIf="!selectedResult?.passed" x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h2>Résultats du Quiz</h2>
                <p>{{ selectedResult?.quizTitle }}</p>
              </div>
            </div>
            <button class="close-btn" (click)="closeResultsModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" style="padding:24px">
            <div *ngIf="loadingResult" style="text-align:center;padding:40px">
              <div class="loading-spinner"></div>
              <p>Chargement...</p>
            </div>
            <div *ngIf="!loadingResult && selectedResult">
              <div style="text-align:center;margin-bottom:24px">
                <div style="font-size:64px;font-weight:800;line-height:1" [style.color]="selectedResult.passed ? '#3b82f6' : '#ef4444'">
                  {{ selectedResult.score }}%
                </div>
                <div style="margin-top:8px;font-size:18px;font-weight:600" [style.color]="selectedResult.passed ? '#3b82f6' : '#ef4444'">
                  {{ selectedResult.passed ? '✓ Quiz réussi !' : '✗ Quiz échoué' }}
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
                <div style="background:#f0fdf4;border-radius:10px;padding:14px;text-align:center">
                  <div style="font-size:24px;font-weight:700;color:#3b82f6">{{ selectedResult.correctAnswers }}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px">Bonnes réponses</div>
                </div>
                <div style="background:#fef2f2;border-radius:10px;padding:14px;text-align:center">
                  <div style="font-size:24px;font-weight:700;color:#ef4444">{{ (selectedResult.totalQuestions || 0) - (selectedResult.correctAnswers || 0) }}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px">Mauvaises réponses</div>
                </div>
                <div style="background:#eff6ff;border-radius:10px;padding:14px;text-align:center">
                  <div style="font-size:24px;font-weight:700;color:#3b82f6">{{ selectedResult.totalQuestions }}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px">Total questions</div>
                </div>
              </div>
              <div style="background:#f8fafc;border-radius:10px;padding:14px;font-size:13px;color:#6b7280">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                  <span>Score minimum requis</span>
                  <strong>{{ selectedResult.passingScore || '—' }}%</strong>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span>Date de passage</span>
                  <strong>{{ selectedResult.completedAt | date:'dd/MM/yyyy HH:mm' }}</strong>
                </div>
              </div>
            </div>
            <div *ngIf="!loadingResult && !selectedResult" style="text-align:center;padding:40px;color:#6b7280">
              Aucun résultat trouvé pour ce quiz.
            </div>
          </div>
          <div class="modal-actions" style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end">
            <button class="btn-secondary" (click)="closeResultsModal()">Fermer</button>
          </div>
        </div>
      </div>

      <!-- Questions Management Modal -->
      <div *ngIf="showQuestionsModal" class="modal-overlay" (click)="closeQuestionsModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon questions">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h2>Questions - {{ selectedQuiz?.title }}</h2>
                <p>Gérez les questions de ce quiz ({{ questions.length }} question{{ questions.length > 1 ? 's' : '' }})</p>
              </div>
            </div>
            <button class="close-btn" (click)="closeQuestionsModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Questions List -->
            <div class="questions-section">
              <div class="section-header">
                <h3>Liste des questions</h3>
                <button class="btn-primary" (click)="openQuestionForm()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Ajouter une question
                </button>
              </div>

              <div *ngIf="loadingQuestions" class="loading-questions">
                <div class="spinner"></div>
                <p>Chargement des questions...</p>
              </div>

              <div *ngIf="!loadingQuestions && questions.length === 0" class="empty-questions">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h4>Aucune question</h4>
                <p>Commencez par ajouter la première question à ce quiz.</p>
                <button class="btn-primary" (click)="openQuestionForm()">
                  Ajouter une question
                </button>
              </div>

              <div class="questions-list" *ngIf="!loadingQuestions && questions.length > 0">
                <div *ngFor="let question of questions; let i = index" class="question-item">
                  <div class="question-header">
                    <div class="question-number">Q{{ i + 1 }}</div>
                    <div class="question-content">
                      <div class="question-text">{{ question.questionText }}</div>
                      <div class="question-meta">
                        {{ question.options?.length || 0 }} option{{ (question.options?.length || 0) > 1 ? 's' : '' }}
                      </div>
                    </div>
                    <div class="question-actions">
                      <button class="btn-icon" (click)="editQuestion(question)" title="Modifier">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button class="btn-icon danger" (click)="deleteQuestion(question.id)" title="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="options-preview">
                    <div *ngFor="let option of question.options; let j = index" 
                         class="option-preview" 
                         [class.correct]="option === question.correctAnswer">
                      <span class="option-letter">{{ getOptionLetter(j) }}</span>
                      <span class="option-text">{{ option }}</span>
                      <span *ngIf="option === question.correctAnswer" class="correct-badge">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeQuestionsModal()">
              Fermer
            </button>
          </div>
        </div>
      </div>

      <!-- Question Form Wizard Modal -->
      <div *ngIf="showQuestionForm" class="modal-overlay" (click)="cancelQuestionForm()">
        <div class="wizard-modal" (click)="$event.stopPropagation()">
          <!-- Wizard Header -->
          <div class="wizard-header">
            <div class="wizard-progress">
              <div class="progress-step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
                <div class="step-circle">
                  <span *ngIf="currentStep <= 1">1</span>
                  <svg *ngIf="currentStep > 1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span class="step-label">Question</span>
              </div>
              <div class="progress-line" [class.completed]="currentStep > 1"></div>
              <div class="progress-step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
                <div class="step-circle">
                  <span *ngIf="currentStep <= 2">2</span>
                  <svg *ngIf="currentStep > 2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span class="step-label">Options</span>
              </div>
              <div class="progress-line" [class.completed]="currentStep > 2"></div>
              <div class="progress-step" [class.active]="currentStep >= 3">
                <div class="step-circle">
                  <span>3</span>
                </div>
                <span class="step-label">Réponse</span>
              </div>
            </div>
            <button class="close-btn" (click)="cancelQuestionForm()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Wizard Content -->
          <div class="wizard-content">
            <!-- Step 1: Question Text -->
            <div *ngIf="currentStep === 1" class="wizard-step">
              <div class="step-header">
                <div class="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div class="step-info">
                  <h2>{{ editQuestionMode ? 'Modifier la question' : 'Créer votre question' }}</h2>
                  <p>Rédigez une question claire et précise</p>
                </div>
              </div>

              <div class="question-input-card">
                <div class="input-header">
                  <label for="questionText">Énoncé de la question</label>
                  <div class="char-counter">{{ currentQuestion.questionText?.length || 0 }}/500</div>
                </div>
                <textarea 
                  id="questionText"
                  [(ngModel)]="currentQuestion.questionText" 
                  name="questionText" 
                  placeholder="Tapez votre question ici..."
                  class="question-textarea"
                  maxlength="500"
                ></textarea>
              </div>
            </div>

            <!-- Step 2: Options -->
            <div *ngIf="currentStep === 2" class="wizard-step">
              <div class="step-header">
                <div class="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <div class="step-info">
                  <h2>Ajouter les options</h2>
                  <p>Créez les choix de réponse (minimum 2 options)</p>
                </div>
              </div>

              <div class="options-builder">
                <div *ngFor="let option of dynamicOptions; let i = index" class="option-input-row">
                  <div class="option-letter">{{ getOptionLetter(i) }}</div>
                  <input 
                    type="text" 
                    [(ngModel)]="dynamicOptions[i]" 
                    name="option{{i}}"
                    placeholder="Saisissez l'option {{ getOptionLetter(i) }}"
                    class="option-input"
                  />
                  <button 
                    *ngIf="dynamicOptions.length > 2" 
                    type="button" 
                    class="remove-option" 
                    (click)="removeOption(i)"
                    title="Supprimer cette option"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <button 
                  *ngIf="dynamicOptions.length < 6" 
                  type="button" 
                  class="add-option-btn" 
                  (click)="addOption()"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Ajouter une option
                </button>
              </div>
            </div>

            <!-- Step 3: Correct Answer -->
            <div *ngIf="currentStep === 3" class="wizard-step">
              <div class="step-header">
                <div class="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div class="step-info">
                  <h2>Définir la bonne réponse</h2>
                  <p>Sélectionnez la réponse correcte parmi les options</p>
                </div>
              </div>

              <div class="answer-selection">
                <div *ngFor="let option of getValidOptions(); let i = index" 
                     class="answer-option" 
                     [class.selected]="currentQuestion.correctAnswer === option"
                     (click)="selectCorrectAnswer(option)">
                  <div class="answer-radio">
                    <svg *ngIf="currentQuestion.correctAnswer === option" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div class="answer-letter">{{ getOptionLetter(i) }}</div>
                  <div class="answer-text">{{ option }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Wizard Navigation -->
          <div class="wizard-navigation">
            <button 
              type="button" 
              class="nav-btn nav-back" 
              [disabled]="currentStep === 1"
              (click)="previousStep()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Précédent
            </button>

            <div class="nav-center">
              <span class="step-indicator">Étape {{ currentStep }} sur 3</span>
            </div>

            <button 
              *ngIf="currentStep < 3" 
              type="button" 
              class="nav-btn nav-next" 
              [disabled]="!canProceedToNextStep()"
              (click)="nextStep()"
            >
              Suivant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <button 
              *ngIf="currentStep === 3" 
              type="button" 
              class="nav-btn nav-finish" 
              [disabled]="!isQuestionFormValid() || savingQuestion"
              (click)="saveQuestion()"
            >
              <div *ngIf="savingQuestion" class="spinner"></div>
              <svg *ngIf="!savingQuestion" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ savingQuestion ? 'Enregistrement...' : (editQuestionMode ? 'Modifier' : 'Créer') }} la question
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Quiz Modal -->
      <div *ngIf="showCreateModal" class="modal-overlay" (click)="closeCreateModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div>
                <h2>{{ editMode ? 'Modifier le quiz' : 'Nouveau quiz' }}</h2>
                <p>{{ editMode ? 'Modifiez les informations du quiz' : 'Créez un nouveau quiz pour vos étudiants' }}</p>
              </div>
            </div>
            <button class="close-btn" (click)="closeCreateModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveQuiz()" class="modal-form">
            <div class="form-group">
              <label for="title">Titre du quiz *</label>
              <input 
                id="title"
                type="text" 
                [(ngModel)]="currentQuiz.title" 
                name="title" 
                required 
                placeholder="Entrez le titre du quiz"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="courseId">Cours associé *</label>
              <select 
                id="courseId"
                [(ngModel)]="currentQuiz.courseId" 
                name="courseId" 
                required 
                class="form-input"
              >
                <option value="">Sélectionnez un cours</option>
                <option *ngFor="let course of courses" [value]="course.id">{{ course.title }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description"
                [(ngModel)]="currentQuiz.description" 
                name="description" 
                rows="3"
                placeholder="Décrivez le contenu et les objectifs du quiz"
                class="form-input"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="difficulty">Difficulté</label>
                <select 
                  id="difficulty"
                  [(ngModel)]="currentQuiz.difficulty" 
                  name="difficulty" 
                  class="form-input"
                >
                  <option value="EASY">Facile</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HARD">Difficile</option>
                </select>
              </div>

              <div class="form-group">
                <label for="timeLimit">Durée (minutes)</label>
                <input 
                  id="timeLimit"
                  type="number" 
                  [(ngModel)]="currentQuiz.timeLimit" 
                  name="timeLimit"
                  min="1"
                  max="180"
                  placeholder="30"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="passingScore">Score de passage (%)</label>
                <input 
                  id="passingScore"
                  type="number" 
                  [(ngModel)]="currentQuiz.passingScore" 
                  name="passingScore" 
                  min="0" 
                  max="100"
                  placeholder="70"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="maxAttempts">Tentatives autorisées</label>
                <input 
                  id="maxAttempts"
                  type="number" 
                  [(ngModel)]="currentQuiz.maxAttempts" 
                  name="maxAttempts"
                  min="1"
                  max="10"
                  placeholder="3"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="currentQuiz.isActive" 
                    name="isActive"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  Quiz actif (visible par les étudiants)
                </label>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeCreateModal()">
                Annuler
              </button>
              <button type="submit" class="btn-primary" [disabled]="saving">
                <div *ngIf="saving" class="spinner"></div>
                <svg *ngIf="!saving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {{ saving ? 'Enregistrement...' : (editMode ? 'Modifier' : 'Créer le quiz') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Toast Notifications -->
      <div *ngIf="error" class="toast error" (click)="error = ''">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {{ error }}
      </div>

      <div *ngIf="successMessage" class="toast success" (click)="successMessage = ''">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        {{ successMessage }}
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      padding: 24px 32px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: calc(100vh - 56px);
    }

    /* Header Section */
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding: 24px 0;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .page-subtitle {
      font-size: 16px;
      color: #64748b;
      margin: 0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }

    .btn-secondary {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.3s ease;
    }

    .btn-icon:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .btn-icon.danger:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-card.primary .stat-icon {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #2563eb;
    }

    .stat-card.success .stat-icon {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #16a34a;
    }

    .stat-card.warning .stat-icon {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #d97706;
    }

    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }

    /* Filters Section */
    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
    }

    .filters-container {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr auto;
      gap: 24px;
      align-items: end;
    }

    .search-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .search-group label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      color: #9ca3af;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px 12px 48px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      background: white;
      color: #374151;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .search-input::placeholder {
      color: #9ca3af;
    }

    /* Search input animation when typing */
    .search-input:not(:placeholder-shown) {
      border-color: #3b82f6;
      background: linear-gradient(135deg, #ffffff, #f0fdf4);
    }

    .clear-search {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .clear-search:hover {
      background: #f3f4f6;
      color: #6b7280;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 150px;
    }

    .filter-group label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .filter-select {
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      background: white;
      color: #374151;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-actions {
      display: flex;
      align-items: end;
    }

    .clear-filters-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 10px;
      color: #dc2626;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .clear-filters-btn:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      transform: translateY(-1px);
    }

    /* Search Results Info */
    .search-results-info {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .results-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }

    .results-count svg {
      color: #3b82f6;
    }

    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .filters-label {
      color: #64748b;
      font-weight: 500;
    }

    .filters-text {
      color: #3b82f6;
      font-weight: 600;
      background: #dbeafe;
      padding: 4px 12px;
      border-radius: 12px;
    }

    /* Responsive Filters */
    @media (max-width: 1200px) {
      .filters-container {
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
      }

      .search-group {
        grid-column: 1 / -1;
      }

      .filter-actions {
        grid-column: 1 / -1;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .filters-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .search-group,
      .filter-group,
      .filter-actions {
        grid-column: 1;
      }

      .search-results-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #64748b;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f1f5f9;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Quiz Grid */
    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .quiz-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .quiz-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    }

    .quiz-card.completed::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #16a34a, #22c55e);
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .quiz-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.3;
      flex: 1;
      margin-right: 16px;
    }

    .quiz-difficulty {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .difficulty-easy {
      background: #dcfce7;
      color: #16a34a;
    }

    .difficulty-medium {
      background: #fef3c7;
      color: #d97706;
    }

    .difficulty-hard {
      background: #fecaca;
      color: #dc2626;
    }

    .quiz-description {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .quiz-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 13px;
    }

    .meta-item svg {
      flex-shrink: 0;
    }

    .quiz-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .quiz-status {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #d97706;
    }

    .score {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .quiz-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .admin-actions {
      display: flex;
      gap: 4px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      grid-column: 1 / -1;
    }

    .empty-icon {
      margin: 0 auto 24px;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
    }

    .empty-state h3 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 12px 0;
    }

    .empty-state p {
      color: #64748b;
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    /* Search Highlighting */
    .search-highlight {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      padding: 2px 4px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Toast Notifications */
    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 16px 20px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      animation: slideIn 0.3s ease;
      max-width: 400px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .toast.success {
      background: linear-gradient(135deg, #16a34a, #22c55e);
    }

    .toast.error {
      background: linear-gradient(135deg, #dc2626, #ef4444);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .modal-lg {
      max-width: 900px;
    }

    .modal-icon.questions {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #d97706;
    }

    .modal-body {
      padding: 28px;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }

    /* Questions Management Styles */
    .questions-section {
      width: 100%;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .section-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .loading-questions, .empty-questions {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-questions .empty-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      margin-bottom: 24px;
    }

    .empty-questions h4 {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .empty-questions p {
      color: #64748b;
      margin: 0 0 24px 0;
    }

    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .question-item {
      background: white;
      border: 2px solid #f1f5f9;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .question-item:hover {
      border-color: #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .question-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .question-number {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .question-content {
      flex: 1;
    }

    .question-text {
      font-size: 16px;
      font-weight: 500;
      color: #1e293b;
      line-height: 1.5;
      margin-bottom: 4px;
    }

    .question-meta {
      font-size: 13px;
      color: #64748b;
    }

    .question-actions {
      display: flex;
      gap: 4px;
    }

    .options-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 8px;
    }

    .option-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 8px;
      font-size: 14px;
    }

    .option-preview.correct {
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border: 1px solid #3b82f6;
    }

    .option-letter {
      width: 20px;
      height: 20px;
      background: #64748b;
      color: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .option-preview.correct .option-letter {
      background: #3b82f6;
    }

    .option-text {
      flex: 1;
      color: #374151;
    }

    .correct-badge {
      color: #3b82f6;
      font-weight: 600;
    }

    /* Wizard Modal Styles */
    .wizard-modal {
      background: white;
      border-radius: 24px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .wizard-header {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      padding: 32px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wizard-progress {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    .progress-step.active {
      opacity: 1;
    }

    .progress-step.completed {
      opacity: 1;
    }

    .step-circle {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .progress-step.active .step-circle {
      border-color: white;
      background: rgba(255, 255, 255, 0.2);
    }

    .progress-step.completed .step-circle {
      border-color: #3b82f6;
      background: #3b82f6;
    }

    .step-label {
      font-size: 14px;
      font-weight: 600;
    }

    .progress-line {
      width: 60px;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      transition: all 0.3s;
    }

    .progress-line.completed {
      background: #3b82f6;
    }

    .wizard-content {
      flex: 1;
      padding: 48px;
      overflow-y: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wizard-step {
      width: 100%;
      max-width: 600px;
      animation: slideIn 0.4s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 40px;
    }

    .step-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3);
    }

    .step-info h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .step-info p {
      font-size: 16px;
      color: #64748b;
      margin: 0;
    }

    /* Question Input Card */
    .question-input-card {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .input-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .input-header label {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .char-counter {
      font-size: 13px;
      color: #64748b;
      background: #f1f5f9;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 500;
    }

    .question-textarea {
      width: 100%;
      min-height: 150px;
      padding: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      font-size: 16px;
      line-height: 1.6;
      color: #1e293b;
      background: white;
      resize: vertical;
      transition: all 0.3s;
      font-family: inherit;
      box-sizing: border-box;
    }

    .question-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    /* Options Builder */
    .options-builder {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .option-input-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .option-input-row .option-letter {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .option-input {
      flex: 1;
      padding: 16px 20px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 16px;
      color: #1e293b;
      background: white;
      transition: all 0.3s;
    }

    .option-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .remove-option {
      width: 40px;
      height: 40px;
      background: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #dc2626;
      transition: all 0.3s;
    }

    .remove-option:hover {
      background: #fee2e2;
      transform: scale(1.05);
    }

    .add-option-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border: 2px dashed #3b82f6;
      border-radius: 16px;
      color: #2563eb;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      width: 100%;
      justify-content: center;
    }

    .add-option-btn:hover {
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      transform: translateY(-2px);
    }

    /* Answer Selection */
    .answer-selection {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .answer-option {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px 24px;
      background: white;
      border: 3px solid #e2e8f0;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 16px;
    }

    .answer-option:hover {
      border-color: #3b82f6;
      background: #f0f9ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
    }

    .answer-option.selected {
      border-color: #3b82f6;
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }

    .answer-radio {
      width: 24px;
      height: 24px;
      border: 3px solid #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      transition: all 0.3s;
    }

    .answer-option.selected .answer-radio {
      border-color: #3b82f6;
      background: #3b82f6;
      color: white;
    }

    .answer-option .answer-letter {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }

    .answer-text {
      flex: 1;
      font-size: 16px;
      color: #1e293b;
      font-weight: 500;
    }

    /* Wizard Navigation */
    .wizard-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px 40px;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-top: 1px solid #e2e8f0;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 32px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 140px;
      justify-content: center;
    }

    .nav-back {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }

    .nav-back:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }

    .nav-back:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-next, .nav-finish {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: 2px solid #3b82f6;
    }

    .nav-next:hover:not(:disabled), .nav-finish:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }

    .nav-next:disabled, .nav-finish:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .nav-center {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-indicator {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
      background: white;
      padding: 8px 16px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .modal {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s ease;
    }

    .modal-header {
      padding: 24px 28px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
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
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #2563eb;
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
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #f1f5f9;
      color: #64748b;
    }

    .modal-form {
      padding: 28px;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      color: #374151;
      background: white;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 80px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .checkbox-group {
      margin-top: 8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
    }

    .checkbox-input {
      display: none;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .checkbox-input:checked + .checkbox-custom {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    .checkbox-input:checked + .checkbox-custom::after {
      content: '✓';
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(40px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .quiz-container {
        padding: 16px 20px;
      }

      .header-section {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters-container {
        flex-direction: column;
      }

      .filter-group {
        min-width: auto;
      }

      .quiz-grid {
        grid-template-columns: 1fr;
      }

      .quiz-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .quiz-actions {
        justify-content: center;
      }

      .modal {
        width: 95%;
        margin: 20px;
      }

      .modal-header {
        padding: 20px 24px;
      }

      .modal-form {
        padding: 24px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class QuizMainComponent implements OnInit {
  quizzes: any[] = [];
  filteredQuizzes: any[] = [];
  courses: any[] = [];
  loading = false;
  error = '';
  successMessage = '';

  // Modal states
  showCreateModal = false;
  showQuestionsModal = false;
  showQuestionForm = false;
  editMode = false;
  editQuestionMode = false;
  saving = false;
  savingQuestion = false;
  loadingQuestions = false;
  currentQuiz: any = {};

  // Questions management
  selectedQuiz: any = null;
  questions: any[] = [];
  currentQuestion: any = {};
  currentStep = 1;
  dynamicOptions: string[] = ['', '', '', ''];

  // Filters
  filterCourse = '';
  filterDifficulty = '';
  filterStatus = '';
  searchTerm = '';

  // Student data
  studentId: number | null = null;
  studentAttempts: any[] = [];

  // Results modal
  showResultsModal = false;
  selectedResult: any = null;
  loadingResult = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCourses().then(() => {
      if (this.authService.isStudent()) {
        this.loadStudentData();
      } else {
        this.loadQuizzes();
      }
    });
  }

  loadCourses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>('http://localhost:8080/courses-service/courses').subscribe({
        next: (data: any) => {
          this.courses = data;
          console.log('Courses loaded:', this.courses); // Debug log
          this.cdr.detectChanges();
          resolve();
        },
        error: (err: any) => {
          console.error('Error loading courses:', err);
          reject(err);
        }
      });
    });
  }

  loadStudentData() {
    const email = localStorage.getItem('user_email');
    if (email) {
      this.http.get<any[]>('http://localhost:8080/students-service/students').subscribe({
        next: (students: any) => {
          const student = students.find((s: any) => s.email === email);
          if (student) {
            this.studentId = student.id;
            this.loadStudentAttempts();
          } else {
            this.loadQuizzes();
          }
        },
        error: (err: any) => {
          console.error('Error loading student:', err);
          this.loadQuizzes();
        }
      });
    } else {
      this.loadQuizzes();
    }
  }

  loadStudentAttempts() {
    if (!this.studentId) {
      this.loadQuizzes();
      return;
    }

    this.http.get<any[]>(`http://localhost:8080/quiz-service/api/quizzes/attempts/student/${this.studentId}`).subscribe({
      next: (attempts: any) => {
        this.studentAttempts = attempts;
        this.loadQuizzes();
      },
      error: (err: any) => {
        console.error('Error loading attempts:', err);
        this.loadQuizzes();
      }
    });
  }

  loadQuizzes() {
    this.loading = true;
    this.error = '';
    
    this.http.get<any[]>('http://localhost:8080/quiz-service/api/quizzes').subscribe({
      next: (data: any) => {
        console.log('Quizzes loaded:', data); // Debug log
        console.log('Available courses:', this.courses); // Debug log
        
        this.quizzes = data.map((quiz: any) => {
          const attempt = this.studentAttempts.find((a: any) => a.quizId === quiz.id);
          const isCompleted = !!attempt;
          
          // Améliorer la recherche de cours
          let courseName = 'Cours non assigné';
          if (quiz.courseId) {
            const course = this.courses.find((c: any) => 
              c.id === quiz.courseId || 
              c.id == quiz.courseId || 
              String(c.id) === String(quiz.courseId)
            );
            courseName = course ? course.title : `Cours ID: ${quiz.courseId} (introuvable)`;
          }
          
          console.log(`Quiz ${quiz.title}: courseId=${quiz.courseId}, courseName=${courseName}`); // Debug log
          
          return {
            ...quiz,
            courseName,
            isCompleted,
            lastScore: attempt?.score
          };
        });
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading quizzes:', err);
        this.error = 'Erreur lors du chargement des quiz';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let filtered = [...this.quizzes];
    
    // Apply search filter
    if (this.searchTerm?.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(q => 
        q.title?.toLowerCase().includes(searchLower) ||
        q.description?.toLowerCase().includes(searchLower) ||
        q.courseName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply course filter
    if (this.filterCourse) {
      filtered = filtered.filter(q => q.courseId == this.filterCourse);
    }
    
    // Apply difficulty filter
    if (this.filterDifficulty) {
      filtered = filtered.filter(q => q.difficulty === this.filterDifficulty);
    }
    
    // Apply status filter
    if (this.filterStatus === 'completed') {
      filtered = filtered.filter(q => q.isCompleted);
    } else if (this.filterStatus === 'pending') {
      filtered = filtered.filter(q => !q.isCompleted);
    }
    
    this.filteredQuizzes = filtered;
    this.cdr.detectChanges();
  }

  getCompletedCount(): number {
    return this.quizzes.filter(q => q.isCompleted).length;
  }

  getAverageScore(): number {
    const completedQuizzes = this.quizzes.filter(q => q.isCompleted && q.lastScore !== undefined);
    if (completedQuizzes.length === 0) return 0;
    
    const totalScore = completedQuizzes.reduce((sum, q) => sum + q.lastScore, 0);
    return Math.round(totalScore / completedQuizzes.length);
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: { [key: string]: string } = {
      'EASY': 'Facile',
      'MEDIUM': 'Moyen',
      'HARD': 'Difficile'
    };
    return labels[difficulty] || difficulty;
  }

  getEmptyStateMessage(): string {
    if (this.searchTerm || this.filterCourse || this.filterDifficulty || this.filterStatus) {
      return 'Aucun quiz ne correspond à vos critères de recherche.';
    }
    return this.canCreateQuiz() 
      ? 'Commencez par créer votre premier quiz.' 
      : 'Aucun quiz n\'est disponible pour le moment.';
  }

  // Search and Filter Management
  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.filterCourse = '';
    this.filterDifficulty = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filterCourse || this.filterDifficulty || this.filterStatus);
  }

  getActiveFiltersText(): string {
    const filters = [];
    
    if (this.filterCourse) {
      const course = this.courses.find(c => c.id == this.filterCourse);
      if (course) {
        filters.push(`Cours: ${course.title}`);
      }
    }
    
    if (this.filterDifficulty) {
      const difficultyLabels: { [key: string]: string } = {
        'EASY': 'Facile',
        'MEDIUM': 'Moyen',
        'HARD': 'Difficile'
      };
      filters.push(`Difficulté: ${difficultyLabels[this.filterDifficulty]}`);
    }
    
    if (this.filterStatus) {
      const statusLabels: { [key: string]: string } = {
        'completed': 'Complétés',
        'pending': 'Non passés'
      };
      filters.push(`Statut: ${statusLabels[this.filterStatus]}`);
    }
    
    return filters.join(', ');
  }

  canCreateQuiz(): boolean {
    return this.authService.canCreateQuiz();
  }

  // Modal Management
  openCreateModal() {
    this.editMode = false;
    this.currentQuiz = {
      title: '',
      description: '',
      courseId: '',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      passingScore: 70,
      maxAttempts: 3,
      isActive: true
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.editMode = false;
    this.currentQuiz = {};
    this.saving = false;
  }

  saveQuiz() {
    if (!this.currentQuiz.title?.trim()) {
      this.showToast('Le titre est obligatoire', 'error');
      return;
    }

    if (!this.currentQuiz.courseId) {
      this.showToast('Veuillez sélectionner un cours', 'error');
      return;
    }

    this.saving = true;
    this.error = '';

    const quizData = {
      ...this.currentQuiz,
      title: this.currentQuiz.title.trim(),
      description: this.currentQuiz.description?.trim() || null
    };

    const url = this.editMode 
      ? `http://localhost:8080/quiz-service/api/quizzes/${this.currentQuiz.id}`
      : 'http://localhost:8080/quiz-service/api/quizzes';
    
    const method = this.editMode 
      ? this.http.put(url, quizData) 
      : this.http.post(url, quizData);
    
    method.subscribe({
      next: () => {
        this.saving = false;
        this.closeCreateModal();
        this.loadQuizzes();
        this.showToast(
          this.editMode ? 'Quiz modifié avec succès !' : 'Quiz créé avec succès !', 
          'success'
        );
      },
      error: (err: any) => {
        this.saving = false;
        console.error('Error saving quiz:', err);
        this.showToast('Erreur lors de l\'enregistrement du quiz', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Questions Management
  manageQuestions(quiz: any) {
    this.selectedQuiz = quiz;
    this.showQuestionsModal = true;
    this.loadQuestions(quiz.id);
  }

  closeQuestionsModal() {
    this.showQuestionsModal = false;
    this.showQuestionForm = false;
    this.selectedQuiz = null;
    this.questions = [];
  }

  loadQuestions(quizId: number) {
    this.loadingQuestions = true;
    this.http.get<any[]>(`http://localhost:8080/quiz-service/api/quizzes/${quizId}/questions`).subscribe({
      next: (data: any) => {
        this.questions = data.map((q: any) => ({
          ...q,
          options: q.options ? q.options.split(',') : []
        }));
        this.loadingQuestions = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading questions:', err);
        this.loadingQuestions = false;
        this.showToast('Erreur lors du chargement des questions', 'error');
      }
    });
  }

  // Question Form Management
  openQuestionForm() {
    this.editQuestionMode = false;
    this.currentQuestion = { quizId: this.selectedQuiz.id };
    this.currentStep = 1;
    this.dynamicOptions = ['', '', '', ''];
    this.showQuestionForm = true;
  }

  editQuestion(question: any) {
    this.editQuestionMode = true;
    this.currentQuestion = { ...question };
    this.dynamicOptions = [...question.options];
    while (this.dynamicOptions.length < 4) {
      this.dynamicOptions.push('');
    }
    this.currentStep = 1;
    this.showQuestionForm = true;
  }

  cancelQuestionForm() {
    this.showQuestionForm = false;
    this.currentQuestion = {};
    this.currentStep = 1;
    this.dynamicOptions = ['', '', '', ''];
    this.editQuestionMode = false;
  }

  saveQuestion() {
    if (!this.isQuestionFormValid()) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    this.savingQuestion = true;
    const validOptions = this.getValidOptions();
    const questionData = {
      ...this.currentQuestion,
      options: validOptions.join(','),
      quizId: this.selectedQuiz.id
    };

    const url = this.editQuestionMode
      ? `http://localhost:8080/quiz-service/api/quizzes/questions/${this.currentQuestion.id}`
      : `http://localhost:8080/quiz-service/api/quizzes/${this.selectedQuiz.id}/questions`;
    
    const method = this.editQuestionMode 
      ? this.http.put(url, questionData) 
      : this.http.post(url, questionData);

    method.subscribe({
      next: () => {
        this.savingQuestion = false;
        this.loadQuestions(this.selectedQuiz.id);
        this.cancelQuestionForm();
        this.showToast(
          this.editQuestionMode ? 'Question modifiée avec succès !' : 'Question ajoutée avec succès !', 
          'success'
        );
      },
      error: (err: any) => {
        this.savingQuestion = false;
        console.error('Error saving question:', err);
        this.showToast('Erreur lors de l\'enregistrement de la question', 'error');
      }
    });
  }

  deleteQuestion(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.')) {
      this.http.delete(`http://localhost:8080/quiz-service/api/quizzes/questions/${id}`).subscribe({
        next: () => {
          this.loadQuestions(this.selectedQuiz.id);
          this.showToast('Question supprimée avec succès !', 'success');
        },
        error: (err: any) => {
          console.error('Error deleting question:', err);
          this.showToast('Erreur lors de la suppression de la question', 'error');
        }
      });
    }
  }

  // Wizard Navigation
  nextStep() {
    if (this.canProceedToNextStep() && this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.currentQuestion.questionText?.trim());
      case 2:
        return this.getValidOptions().length >= 2;
      case 3:
        return !!(this.currentQuestion.correctAnswer?.trim());
      default:
        return false;
    }
  }

  isQuestionFormValid(): boolean {
    return !!(
      this.currentQuestion.questionText?.trim() &&
      this.getValidOptions().length >= 2 &&
      this.currentQuestion.correctAnswer?.trim()
    );
  }

  // Options Management
  getValidOptions(): string[] {
    return this.dynamicOptions.filter(option => option.trim());
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  addOption() {
    if (this.dynamicOptions.length < 6) {
      this.dynamicOptions.push('');
    }
  }

  removeOption(index: number) {
    if (this.dynamicOptions.length > 2) {
      this.dynamicOptions.splice(index, 1);
      // Vérifier si la réponse correcte est toujours valide
      const validOptions = this.getValidOptions();
      if (this.currentQuestion.correctAnswer && !validOptions.includes(this.currentQuestion.correctAnswer)) {
        this.currentQuestion.correctAnswer = '';
      }
    }
  }

  selectCorrectAnswer(option: string) {
    this.currentQuestion.correctAnswer = option;
  }

  // Quiz Actions
  takeQuiz(quizId: number) {
    this.router.navigate(['/quiz/take', quizId]);
  }

  viewResults(quizId: number) {
    this.loadingResult = true;
    this.showResultsModal = true;
    this.selectedResult = null;

    const attempt = this.studentAttempts.find((a: any) => a.quizId === quizId);
    if (attempt) {
      const quiz = this.quizzes.find((q: any) => q.id === quizId);
      this.selectedResult = { ...attempt, quizTitle: quiz?.title || 'Quiz' };
      this.loadingResult = false;
      this.cdr.detectChanges();
    } else {
      // Fallback: fetch from API
      this.http.get<any[]>(`http://localhost:8080/quiz-service/api/quizzes/attempts/student/${this.studentId}`).subscribe({
        next: (attempts: any) => {
          const a = attempts.find((x: any) => x.quizId === quizId);
          const quiz = this.quizzes.find((q: any) => q.id === quizId);
          this.selectedResult = a ? { ...a, quizTitle: quiz?.title || 'Quiz' } : null;
          this.loadingResult = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingResult = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeResultsModal() {
    this.showResultsModal = false;
    this.selectedResult = null;
  }

  editQuiz(quiz: any) {
    this.editMode = true;
    this.currentQuiz = { ...quiz };
    this.showCreateModal = true;
  }

  deleteQuiz(quizId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.')) {
      this.http.delete(`http://localhost:8080/quiz-service/api/quizzes/${quizId}`).subscribe({
        next: () => {
          this.loadQuizzes();
          this.showToast('Quiz supprimé avec succès !', 'success');
        },
        error: (err: any) => {
          console.error('Error deleting quiz:', err);
          this.showToast('Erreur lors de la suppression du quiz', 'error');
        }
      });
    }
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    if (type === 'success') {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 4000);
    } else {
      this.error = message;
      setTimeout(() => {
        this.error = '';
        this.cdr.detectChanges();
      }, 4000);
    }
    this.cdr.detectChanges();
  }

  // Search highlighting
  highlightSearchTerm(text: string): string {
    if (!this.searchTerm?.trim() || !text) {
      return text;
    }
    
    const searchTerm = this.searchTerm.trim();
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // Keyboard shortcuts for search
  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.clearSearch();
      event.preventDefault();
    }
  }

  // Global keyboard shortcut listener (you can add this to ngOnInit if needed)
  onGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }
}