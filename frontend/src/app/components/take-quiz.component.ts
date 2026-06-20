import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-container">
      @if (loading) {
        <div class="loading">Chargement du quiz...</div>
      } @else if (showResult) {
        <div class="result-card">
          <div class="result-icon" [class.passed]="result.passed" [class.failed]="!result.passed">
            @if (result.passed) {
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            } @else {
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            }
          </div>
          <h1>{{result.message}}</h1>
          <div class="score-display">
            <div class="score-circle">
              <span class="score-value">{{result.score}}%</span>
            </div>
          </div>
          <div class="result-stats">
            <div class="stat">
              <span class="stat-value">{{result.correctAnswers}}</span>
              <span class="stat-label">Bonnes réponses</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{result.totalQuestions - result.correctAnswers}}</span>
              <span class="stat-label">Mauvaises réponses</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{result.totalQuestions}}</span>
              <span class="stat-label">Total questions</span>
            </div>
          </div>
          <div class="result-actions">
            <button class="btn-secondary" (click)="goBack()">Retour aux quiz</button>
          </div>
        </div>
      } @else {
        <div class="quiz-header">
          <h1>{{quiz.title}}</h1>
          <p>{{quiz.description}}</p>
          <div class="quiz-meta">
            <span class="difficulty">📊 {{quiz.difficulty}}</span>
            @if (quiz.timeLimit) {
              <span class="time">⏱️ {{quiz.timeLimit}} minutes</span>
            }
            <span class="passing">✅ Score minimum: {{quiz.passingScore}}%</span>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="getProgress()"></div>
          <span class="progress-text">Question {{currentQuestionIndex + 1}} / {{questions.length}}</span>
        </div>

        @if (questions.length > 0) {
          <div class="question-card">
            <h2>Question {{currentQuestionIndex + 1}}</h2>
            <p class="question-text">{{getCurrentQuestion().questionText}}</p>
            
            <div class="options">
              <div class="option" 
                   *ngFor="let option of getCurrentQuestion().optionsArray"
                   [class.selected]="answers[getCurrentQuestion().id] === option"
                   (click)="selectAnswer(option)">
                <div class="option-radio">
                  <div class="radio-dot"></div>
                </div>
                <span>{{option}}</span>
              </div>
            </div>

            <div class="navigation">
              <button class="btn-secondary" 
                      (click)="previousQuestion()" 
                      [disabled]="currentQuestionIndex === 0">
                ← Précédent
              </button>
              
              @if (currentQuestionIndex < questions.length - 1) {
                <button class="btn-primary" (click)="nextQuestion()">
                  Suivant →
                </button>
              } @else {
                <button class="btn-submit" (click)="submitQuiz()">
                  ✓ Soumettre le quiz
                </button>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .quiz-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
    }

    .loading {
      text-align: center;
      padding: 60px;
      font-size: 18px;
      color: #666;
    }

    .quiz-header {
      background: #2563eb;
      color: white;
      padding: 40px;
      border-radius: 16px;
      margin-bottom: 24px;
    }

    .quiz-header h1 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 700;
    }

    .quiz-header p {
      margin: 0 0 20px 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .quiz-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .quiz-meta span {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .progress-bar {
      position: relative;
      height: 50px;
      background: #f0f0f0;
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #2563eb;
      transition: width 0.3s ease;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 600;
      color: #333;
      z-index: 1;
    }

    .question-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .question-card h2 {
      margin: 0 0 16px 0;
      color: #2563eb;
      font-size: 18px;
      font-weight: 600;
    }

    .question-text {
      font-size: 20px;
      font-weight: 500;
      color: #333;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }

    .option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .option:hover {
      border-color: #3b82f6;
      background: #f8f9ff;
    }

    .option.selected {
      border-color: #3b82f6;
      background: linear-gradient(135deg, rgba(59,130,246,.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .option-radio {
      width: 24px;
      height: 24px;
      border: 2px solid #ccc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s;
    }

    .option.selected .option-radio {
      border-color: #3b82f6;
      background: #2563eb;
    }

    .radio-dot {
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .option.selected .radio-dot {
      opacity: 1;
    }

    .option span {
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }

    .navigation {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .btn-primary, .btn-secondary, .btn-submit {
      padding: 14px 32px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-submit {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #111827;
    }

    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .result-card {
      background: white;
      padding: 60px 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .result-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .result-icon.passed {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #111827;
    }

    .result-icon.failed {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #111827;
    }

    .result-card h1 {
      margin: 0 0 32px 0;
      font-size: 32px;
      color: #333;
    }

    .score-display {
      margin-bottom: 40px;
    }

    .score-circle {
      width: 180px;
      height: 180px;
      margin: 0 auto;
      border-radius: 50%;
      background: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
      color: #111827;
    }

    .result-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: #2563eb;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .result-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .quiz-container {
        padding: 16px;
      }

      .question-card {
        padding: 24px;
      }

      .result-stats {
        grid-template-columns: 1fr;
      }

      .result-actions {
        flex-direction: column;
      }
    }
  `]
})
export class TakeQuizComponent implements OnInit {
  quiz: any = {};
  questions: any[] = [];
  currentQuestionIndex = 0;
  answers: { [key: number]: string } = {};
  loading = true;
  showResult = false;
  result: any = {};
  studentId: number | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadStudentId();
      this.loadQuiz(+quizId);
    }
  }

  loadStudentId() {
    const email = localStorage.getItem('user_email');
    if (email) {
      console.log('Loading student by email:', email);
      this.http.get<any[]>('http://localhost:8080/students-service/students').subscribe({
        next: (students) => {
          const student = students.find(s => s.email === email);
          if (student) {
            this.studentId = student.id;
            console.log('Student ID loaded:', this.studentId);
            // Vérifier si l'étudiant a déjà passé ce quiz
            this.checkPreviousAttempts();
          } else {
            console.error('No student found with email:', email);
          }
        },
        error: (err) => console.error('Error loading students:', err)
      });
    } else {
      console.error('No user_email found in localStorage');
    }
  }

  checkPreviousAttempts() {
    if (!this.studentId || !this.quiz.id) return;

    this.http.get<any[]>(`http://localhost:8080/quiz-service/api/quizzes/${this.quiz.id}/attempts/student/${this.studentId}`).subscribe({
      next: (attempts) => {
        if (attempts && attempts.length > 0) {
          // L'étudiant a déjà passé ce quiz
          this.result = {
            id: attempts[0].id,
            score: attempts[0].score,
            totalQuestions: attempts[0].totalQuestions,
            correctAnswers: attempts[0].correctAnswers,
            passed: attempts[0].passed,
            message: attempts[0].passed 
              ? 'Vous avez déjà réussi ce quiz!' 
              : 'Vous avez déjà passé ce quiz.'
          };
          this.showResult = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error checking attempts:', err)
    });
  }

  loadQuiz(quizId: number) {
    this.http.get<any>(`http://localhost:8080/quiz-service/api/quizzes/${quizId}`).subscribe({
      next: (data) => {
        this.quiz = data.quiz;
        // Parser les options pour chaque question
        this.questions = data.questions.map((q: any) => ({
          ...q,
          optionsArray: q.options ? q.options.split(',').map((opt: string) => opt.trim()) : []
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading quiz:', err);
        this.loading = false;
      }
    });
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(option: string) {
    this.answers[this.getCurrentQuestion().id] = option;
    this.cdr.detectChanges();
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.cdr.detectChanges();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.cdr.detectChanges();
    }
  }

  getProgress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  submitQuiz() {
    console.log('Submit quiz - studentId:', this.studentId);
    console.log('localStorage user_id:', localStorage.getItem('user_id'));
    
    if (!this.studentId) {
      alert('Erreur: Profil étudiant non trouvé');
      return;
    }

    const unanswered = this.questions.filter(q => !this.answers[q.id]);
    if (unanswered.length > 0) {
      if (!confirm(`Vous n'avez pas répondu à ${unanswered.length} question(s). Voulez-vous quand même soumettre?`)) {
        return;
      }
    }

    const submission = {
      quizId: this.quiz.id,
      studentId: this.studentId,
      studentName: localStorage.getItem('user_firstname') + ' ' + localStorage.getItem('user_lastname'),
      answers: this.answers
    };

    console.log('Submitting quiz with data:', submission);

    this.http.post<any>('http://localhost:8080/quiz-service/api/quizzes/submit', submission).subscribe({
      next: (result) => {
        this.result = result;
        this.showResult = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
        alert('Erreur lors de la soumission du quiz');
      }
    });
  }

  retakeQuiz() {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.showResult = false;
    this.cdr.detectChanges();
  }

  goBack() {
    this.router.navigate(['/quiz']);
  }
}
