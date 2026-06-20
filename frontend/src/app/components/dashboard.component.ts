import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ModernStatsCardComponent } from './modern-stats-card.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ModernStatsCardComponent],
  template: `
    <div class="dashboard-container" [class]="'theme-' + getUserTheme()">
      <!-- Welcome Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-section">
            <div class="avatar-container">
              <div class="user-avatar">
                <span>{{getUserInitials()}}</span>
                <div class="status-indicator"></div>
              </div>
            </div>
            <div class="welcome-text">
              <h1>Bienvenue, {{userName}} 👋</h1>
              <p>{{getWelcomeMessage()}}</p>
              <div class="user-stats">
                <span class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Dernière connexion: {{getLastLoginTime()}}
                </span>
                <span class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  {{getRoleLabel()}}
                </span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn secondary" (click)="exportData()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exporter
            </button>
            <button class="action-btn primary" (click)="navigate('courses')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {{getMainActionLabel()}}
            </button>
          </div>
        </div>
      </div>

      <!-- Modern Stats Grid -->
      <div class="stats-grid">
        <app-modern-stats-card
          title="Cours disponibles"
          [value]="totalCourses"
          iconColor="blue"
          theme="blue"
          trend="up"
          [trendValue]="12"
          [showProgress]="true"
          [progressValue]="75"
          [sparklineData]="coursesSparkline"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </app-modern-stats-card>

        <app-modern-stats-card
          title="Étudiants actifs"
          [value]="totalStudents"
          iconColor="green"
          theme="primary"
          trend="up"
          [trendValue]="8"
          [showProgress]="true"
          [progressValue]="60"
          [sparklineData]="studentsSparkline"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </app-modern-stats-card>

        <app-modern-stats-card
          title="Inscriptions totales"
          [value]="totalEnrollments"
          iconColor="purple"
          theme="purple"
          trend="up"
          [trendValue]="24"
          [showProgress]="true"
          [progressValue]="85"
          [sparklineData]="enrollmentsSparkline"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </app-modern-stats-card>

        <app-modern-stats-card
          title="Services actifs"
          [value]="servicesUp"
          suffix="/6"
          iconColor="orange"
          theme="orange"
          trend="neutral"
          [trendValue]="0"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </app-modern-stats-card>

        <app-modern-stats-card
          title="Quiz disponibles"
          [value]="totalQuizzes"
          iconColor="cyan"
          theme="blue"
          trend="up"
          [trendValue]="20"
        >
          <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </app-modern-stats-card>

        @if (isAdmin()) {
          <app-modern-stats-card
            title="Performance système"
            value="98.5"
            suffix="%"
            iconColor="indigo"
            theme="purple"
            trend="up"
            [trendValue]="2"
            subtitle="Uptime des services"
          >
            <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </app-modern-stats-card>
        }
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <div class="card chart-card">
          <div class="card-header">
            <h2>Statistiques d'inscription</h2>
            <select class="chart-filter">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>Cette année</option>
            </select>
          </div>
          <div class="chart-container">
            <canvas #enrollmentChart></canvas>
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-header">
            <h2>Répartition par catégorie</h2>
            <select class="chart-filter">
              <option>Tous</option>
              <option>Cours</option>
            </select>
          </div>
          <div class="chart-container">
            <canvas #categoryChart></canvas>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card main-card">
          <div class="card-header">
            <h2>Activité récente</h2>
            <button class="icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
          <div class="activity-timeline">
            <div class="timeline-item">
              <div class="timeline-marker blue"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4>Nouveau cours ajouté</h4>
                  <span class="timeline-time">Il y a 2h</span>
                </div>
                <p>Advanced English Grammar a été publié</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker green"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4>Nouvel étudiant inscrit</h4>
                  <span class="timeline-time">Il y a 5h</span>
                </div>
                <p>Marie Dubois a rejoint la plateforme</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker purple"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4>Quiz complété</h4>
                  <span class="timeline-time">Hier</span>
                </div>
                <p>15 étudiants ont terminé le quiz de vocabulaire</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card side-card">
          <div class="card-header">
            <h2>Actions rapides</h2>
          </div>
          <div class="quick-actions">
            <button class="quick-action-btn" (click)="navigate('courses')">
              <div class="quick-action-icon blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div class="quick-action-text">
                <h4>Parcourir les cours</h4>
                <p>Découvrir le catalogue</p>
              </div>
            </button>

            @if (isTutor()) {
              <button class="quick-action-btn" (click)="navigate('students')">
                <div class="quick-action-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div class="quick-action-text">
                  <h4>Gérer les étudiants</h4>
                  <p>Voir la liste complète</p>
                </div>
              </button>
            }

            <button class="quick-action-btn" (click)="navigate('quiz')">
              <div class="quick-action-icon purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div class="quick-action-text">
                <h4>Passer un quiz</h4>
                <p>Tester vos connaissances</p>
              </div>
            </button>


          </div>
        </div>
      </div>

      <div class="card system-card">
        <div class="card-header">
          <h2>Architecture Microservices</h2>
          <div class="status-badge">
            <span class="status-dot"></span>
            Tous les services opérationnels
          </div>
        </div>
        <div class="services-grid">
          <div class="service-item">
            <div class="service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div class="service-info">
              <h4>Eureka Server</h4>
              <p>Service Discovery</p>
            </div>
            <div class="service-status active">
              <span></span>
              Active
            </div>
          </div>

          <div class="service-item">
            <div class="service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <div class="service-info">
              <h4>API Gateway</h4>
              <p>Routing & Load Balancing</p>
            </div>
            <div class="service-status active">
              <span></span>
              Active
            </div>
          </div>

          <div class="service-item">
            <div class="service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="service-info">
              <h4>Auth Service</h4>
              <p>Authentication & Authorization</p>
            </div>
            <div class="service-status active">
              <span></span>
              Active
            </div>
          </div>

          <div class="service-item">
            <div class="service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div class="service-info">
              <h4>Courses Service</h4>
              <p>Course Management</p>
            </div>
            <div class="service-status active">
              <span></span>
              Active
            </div>
          </div>

          <div class="service-item">
            <div class="service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="service-info">
              <h4>Students Service</h4>
              <p>Student Management</p>
            </div>
            <div class="service-status active">
              <span></span>
              Active
            </div>
          </div>

          <div class="service-item">
            <div class="service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="service-info">
              <h4>Quiz Service</h4>
              <p>Assessment Management</p>
            </div>
            <div class="service-status active">
              <span></span>
              Active
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: calc(100vh - 56px);
      background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
      padding: 24px 28px;
      position: relative;
    }

    .dashboard-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 220px;
      background: linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.06) 100%);
      border-radius: 0 0 50px 50px;
      z-index: 0;
    }

    .dashboard-header { 
      margin-bottom: 32px; 
      position: relative;
      z-index: 1;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 24px;
    }

    .welcome-section {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;
    }

    .avatar-container {
      position: relative;
    }

    .user-avatar {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 24px;
      box-shadow: 0 8px 24px rgba(59,130,246,0.3);
      position: relative;
      overflow: hidden;
    }

    .user-avatar::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .status-indicator {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      background: #22c55e;
      border: 3px solid white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .welcome-text h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.5px;
    }

    .welcome-text p { 
      margin: 0 0 12px 0; 
      font-size: 16px; 
      color: #6b7280; 
      line-height: 1.5;
    }

    .user-stats {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #9ca3af;
      font-weight: 500;
    }

    .stat-item svg {
      color: #3b82f6;
    }

    .header-actions { 
      display: flex; 
      gap: 12px; 
      align-items: center;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.6s ease;
    }

    .action-btn:hover::before {
      width: 300px;
      height: 300px;
    }

    .action-btn.secondary {
      background: white;
      color: #374151;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .action-btn.secondary:hover { 
      background: #f9fafb; 
      transform: translateY(-2px);
      box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      box-shadow: 0 8px 20px rgba(59,130,246,.3);
    }
    .action-btn.primary:hover { 
      transform: translateY(-2px);
      box-shadow: 0 12px 25px rgba(59,130,246,.4);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    /* Charts */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    .chart-card { 
      min-height: 420px; 
      backdrop-filter: blur(20px);
    }

    .chart-container { 
      padding: 24px; 
      height: 320px; 
    }

    .chart-filter {
      padding: 8px 16px;
      background: rgba(249,250,251,0.8);
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      color: #374151;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }
    .chart-filter:focus { 
      outline: none; 
      border-color: #3b82f6; 
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }

    /* Cards */
    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      padding: 24px 28px 20px;
      border-bottom: 1px solid rgba(243,244,246,0.8);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(255,255,255,0.4) 100%);
    }

    .card-header h2 { 
      margin: 0 0 4px; 
      font-size: 18px; 
      font-weight: 700; 
      color: #111827; 
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      background: rgba(249,250,251,0.8);
      border: 1px solid rgba(229,231,235,0.6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
    }
    .icon-btn:hover { 
      background: rgba(243,244,246,0.8); 
      color: #374151; 
      transform: scale(1.05);
    }

    /* Content grid */
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    /* Timeline */
    .activity-timeline { 
      padding: 28px; 
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      padding-bottom: 24px;
      position: relative;
    }
    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 9px;
      top: 32px;
      width: 2px;
      height: calc(100% - 16px);
      background: linear-gradient(180deg, #e5e7eb 0%, transparent 100%);
    }

    .timeline-marker {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
      box-shadow: 0 0 0 4px rgba(255,255,255,0.8);
      position: relative;
      z-index: 1;
    }
    .timeline-marker.blue   { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .timeline-marker.green  { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .timeline-marker.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

    .timeline-content { flex: 1; }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .timeline-header h4 { 
      margin: 0; 
      font-size: 15px; 
      font-weight: 600; 
      color: #111827; 
    }
    .timeline-time { 
      font-size: 12px; 
      color: #9ca3af; 
      font-weight: 500;
    }
    .timeline-content p { 
      margin: 0 0 8px; 
      font-size: 14px; 
      color: #6b7280; 
      line-height: 1.5;
    }

    /* Quick actions */
    .quick-actions { 
      padding: 20px; 
      display: flex; 
      flex-direction: column; 
      gap: 12px; 
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(249,250,251,0.6);
      border: 1px solid rgba(243,244,246,0.8);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }
    .quick-action-btn:hover { 
      background: rgba(243,244,246,0.8); 
      border-color: rgba(229,231,235,0.8);
      transform: translateX(4px);
    }

    .quick-action-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }

    .quick-action-icon::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, currentColor, currentColor);
      opacity: 0.1;
      border-radius: inherit;
    }

    .quick-action-icon.blue   { color: #3b82f6; }
    .quick-action-icon.green  { color: #22c55e; }
    .quick-action-icon.purple { color: #8b5cf6; }
    .quick-action-icon.orange { color: #f59e0b; }
    .quick-action-icon.red    { color: #ef4444; }

    .quick-action-text h4 { 
      margin: 0 0 4px; 
      font-size: 15px; 
      font-weight: 600; 
      color: #111827; 
    }
    .quick-action-text p  { 
      margin: 0; 
      font-size: 13px; 
      color: #6b7280; 
    }

    /* System card */
    .system-card { 
      grid-column: 1 / -1; 
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(219,234,254,0.8);
      border: 1px solid rgba(147,197,253,0.6);
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      color: #2563eb;
      backdrop-filter: blur(10px);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .services-grid {
      padding: 28px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .service-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(249,250,251,0.6);
      border: 1px solid rgba(243,244,246,0.8);
      border-radius: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
    }
    .service-item:hover { 
      background: rgba(243,244,246,0.8); 
      border-color: rgba(229,231,235,0.8);
      transform: translateY(-2px);
    }

    .service-icon {
      width: 48px;
      height: 48px;
      background: rgba(219,234,254,0.6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      flex-shrink: 0;
    }

    .service-info { flex: 1; }
    .service-info h4 { 
      margin: 0 0 4px; 
      font-size: 15px; 
      font-weight: 600; 
      color: #111827; 
    }
    .service-info p  { 
      margin: 0; 
      font-size: 13px; 
      color: #6b7280; 
    }

    .service-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .service-status.active { 
      background: rgba(219,234,254,0.6); 
      color: #2563eb; 
    }
    .service-status span { 
      width: 6px; 
      height: 6px; 
      background: #3b82f6; 
      border-radius: 50%; 
    }

    /* Theme variations */
    .theme-admin {
      --primary-color: #7c3aed;
      --primary-light: #f5f3ff;
    }

    .theme-tutor {
      --primary-color: #2563eb;
      --primary-light: #eff6ff;
    }

    .theme-student {
      --primary-color: #0ea5e9;
      --primary-light: #f0f9ff;
    }

    /* Responsive */
    @media (max-width: 1400px) {
      .content-grid { grid-template-columns: 1fr; }
      .charts-grid  { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .dashboard-container { padding: 16px; }
      .header-content { flex-direction: column; align-items: stretch; }
      .welcome-section { flex-direction: column; text-align: center; }
      .stats-grid { grid-template-columns: 1fr; }
      .services-grid { grid-template-columns: 1fr; }
      .user-stats { justify-content: center; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('enrollmentChart') enrollmentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  private enrollmentChart?: Chart;
  private categoryChart?: Chart;

  totalCourses = 0;
  totalStudents = 0;
  totalEnrollments = 0;
  totalQuizzes = 0;
  servicesUp = 6;
  userName = '';
  userRole = '';

  // Données pour les sparklines
  coursesSparkline: number[] = [12, 19, 15, 27, 22, 35, 28];
  studentsSparkline: number[] = [8, 15, 12, 20, 18, 25, 22];
  enrollmentsSparkline: number[] = [5, 12, 8, 18, 15, 22, 20];

  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUserInfo().firstName || this.authService.getUserInfo().username;
    this.userRole = this.authService.getUserRole() || '';
    this.loadStats();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.enrollmentChartRef && this.categoryChartRef) {
        this.createEnrollmentChart();
        this.createCategoryChart();
      }
    }, 1000);
  }

  loadStats() {
    // Charger les cours
    this.http.get<any[]>('http://localhost:8080/courses-service/courses').subscribe({
      next: (data) => {
        this.totalCourses = data.length;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.totalCourses = 0;
      }
    });
    
    // Charger les étudiants
    this.http.get<any[]>('http://localhost:8080/students-service/students').subscribe({
      next: (data) => {
        this.totalStudents = data.length;
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.totalStudents = 0;
      }
    });

    // Charger les inscriptions
    this.http.get<any[]>('http://localhost:8080/students-service/students/enrollments').subscribe({
      next: (data) => {
        this.totalEnrollments = data.length;
      },
      error: (err) => {
        console.error('Error loading enrollments:', err);
        this.totalEnrollments = 0;
      }
    });

    // Charger les quizzes
    this.http.get<any[]>('http://localhost:8080/quiz-service/api/quizzes').subscribe({
      next: (data) => {
        this.totalQuizzes = data.length;
      },
      error: (err) => {
        console.error('Error loading quizzes:', err);
        this.totalQuizzes = 0;
      }
    });
  }

  isTutor(): boolean {
    return this.authService.isTutor();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isStudent(): boolean {
    return this.authService.isStudent();
  }

  navigate(page: string) {
    this.router.navigate(['/' + page]);
  }

  getUserTheme(): string {
    switch(this.userRole) {
      case 'ADMIN': return 'admin';
      case 'TUTOR': return 'tutor';
      case 'STUDENT': return 'student';
      default: return 'student';
    }
  }

  getUserInitials(): string {
    const userInfo = this.authService.getUserInfo();
    if (userInfo.firstName && userInfo.lastName) {
      return (userInfo.firstName[0] + userInfo.lastName[0]).toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Bon matin';
    else if (hour < 18) greeting = 'Bon après-midi';
    else greeting = 'Bonsoir';

    switch(this.userRole) {
      case 'ADMIN':
        return greeting + ' ! Voici un aperçu de votre plateforme d\'administration.';
      case 'TUTOR':
        return greeting + ' ! Gérez vos cours et suivez vos étudiants.';
      case 'STUDENT':
        return greeting + ' ! Continuez votre parcours d\'apprentissage.';
      default:
        return greeting + ' ! Voici un aperçu de votre activité sur Gestion d\'école.';
    }
  }

  getLastLoginTime(): string {
    const lastLogin = new Date();
    lastLogin.setHours(lastLogin.getHours() - 2);
    return lastLogin.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getRoleLabel(): string {
    switch(this.userRole) {
      case 'ADMIN': return 'Administrateur';
      case 'TUTOR': return 'Tuteur';
      case 'STUDENT': return 'Étudiant';
      default: return 'Utilisateur';
    }
  }

  getMainActionLabel(): string {
    switch(this.userRole) {
      case 'ADMIN': return 'Gérer les utilisateurs';
      case 'TUTOR': return 'Créer un cours';
      case 'STUDENT': return 'Parcourir les cours';
      default: return 'Nouveau cours';
    }
  }

  exportData(): void {
    const data = {
      courses: this.totalCourses,
      students: this.totalStudents,
      enrollments: this.totalEnrollments,

      quizzes: this.totalQuizzes,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-export-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  createEnrollmentChart() {
    if (!this.enrollmentChartRef) return;

    const ctx = this.enrollmentChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.enrollmentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Inscriptions',
            data: [12, 19, 15, 27, 22, 35, 28],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#6b7280',
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 'normal'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9ca3af'
            }
          }
        }
      }
    });
  }

  createCategoryChart() {
    if (!this.categoryChartRef) return;

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cours', 'Étudiants', 'Quiz'],
        datasets: [
          {
            data: [this.totalCourses, this.totalStudents, this.totalQuizzes],
            backgroundColor: [
              '#3b82f6',
              '#22c55e',
              '#8b5cf6'
            ],
            borderWidth: 0,
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#6b7280',
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 'normal'
              }
            }
          }
        }
      }
    });
  }
}