import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-wrapper">
      <div class="home-container">
        <!-- Header -->
        <div class="home-header">
          <div class="logo">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1>Gestion d'école</h1>
          <p class="subtitle">Plateforme de gestion scolaire moderne et intuitive</p>
        </div>

        <!-- Features -->
        <div class="features">
          <div class="feature-card">
            <div class="feature-icon blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h3>Gestion des cours</h3>
            <p>Créez et gérez les cours, les matières et les programmes scolaires</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Suivi des étudiants</h3>
            <p>Suivez les inscriptions, les notes et la progression de chaque élève</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon green">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <h3>Évaluations & Quiz</h3>
            <p>Créez des examens, quiz et évaluations pour tester les connaissances</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">Cloud Native</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">3</span>
            <span class="stat-label">Rôles utilisateurs</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">Micro</span>
            <span class="stat-label">Services Architecture</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="cta-section">
          <h2>Prêt à gérer votre établissement ?</h2>
          <div class="cta-buttons">
            <button class="btn-primary" (click)="goToLogin()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Se connecter
            </button>
            <button class="btn-secondary" (click)="goToRegister()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Créer un compte
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="home-footer">
          <p>Propulsé par Keycloak & Spring Cloud Microservices</p>
          <div class="tech-badges">
            <span class="badge">Angular</span>
            <span class="badge">Spring Boot</span>
            <span class="badge">Node.js</span>
            <span class="badge">PostgreSQL</span>
            <span class="badge">MySQL</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0b1120 0%, #172033 50%, #1e293b 100%);
      padding: 40px 20px;
      position: relative;
      overflow: hidden;
    }

    .home-wrapper::before {
      content: '';
      position: absolute;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
      border-radius: 50%;
      top: -350px;
      right: -200px;
      animation: float 20s ease-in-out infinite;
    }

    .home-wrapper::after {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      bottom: -200px;
      left: -200px;
      animation: float 15s ease-in-out infinite reverse;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(40px, 30px); }
    }

    .home-container {
      position: relative;
      z-index: 1;
      max-width: 1100px;
      width: 100%;
      text-align: center;
    }

    .home-header {
      margin-bottom: 50px;
      animation: fadeInDown 0.8s ease-out;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25);
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25); }
      50% { transform: scale(1.05); box-shadow: 0 25px 50px rgba(59, 130, 246, 0.35); }
    }

    .home-header h1 {
      font-size: 52px;
      font-weight: 800;
      color: white;
      margin: 0 0 12px 0;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #ffffff 0%, #bfdbfe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
      font-weight: 500;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 32px 28px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .feature-card:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .feature-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 20px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    }

    .feature-card:hover .feature-icon {
      transform: scale(1.1) rotate(3deg);
    }

    .feature-icon.blue {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
      color: #60a5fa;
    }

    .feature-icon.purple {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%);
      color: #a78bfa;
    }

    .feature-icon.green {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
      color: #34d399;
    }

    .feature-card h3 {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin: 0 0 10px 0;
    }

    .feature-card p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.55);
      margin: 0;
      line-height: 1.6;
    }

    .stats-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      margin-bottom: 50px;
      animation: fadeInUp 0.8s ease-out 0.3s both;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-number {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.45);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
    }

    .cta-section {
      margin-bottom: 50px;
      animation: fadeInUp 0.8s ease-out 0.4s both;
    }

    .cta-section h2 {
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin: 0 0 28px 0;
      letter-spacing: -0.5px;
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      min-width: 200px;
      justify-content: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(59, 130, 246, 0.45);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: white;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
    }

    .btn-primary:active,
    .btn-secondary:active {
      transform: translateY(-1px);
    }

    .home-footer {
      animation: fadeIn 0.8s ease-out 0.6s both;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .home-footer p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      margin: 0 0 14px 0;
    }

    .tech-badges {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .badge {
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s;
    }

    .badge:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      color: white;
    }

    @media (max-width: 768px) {
      .home-header h1 {
        font-size: 36px;
      }

      .subtitle {
        font-size: 15px;
      }

      .features {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .stats-row {
        flex-direction: column;
        gap: 20px;
      }

      .stat-divider {
        width: 40px;
        height: 1px;
      }

      .cta-section h2 {
        font-size: 24px;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) {
    // Vérifier si déjà connecté
    const token = localStorage.getItem('access_token');
    if (token) {
      this.router.navigate(['/dashboard']);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
