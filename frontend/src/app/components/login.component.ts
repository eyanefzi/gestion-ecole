import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="logo">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1>Gestion d'école</h1>
            <p>Plateforme de gestion scolaire moderne et intuitive</p>
          </div>

          @if (showRegister) {
            <div class="register-view">
              <form (ngSubmit)="onRegister()" class="auth-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Prénom *</label>
                    <input 
                      type="text" 
                      id="firstName"
                      [(ngModel)]="registerData.firstName" 
                      name="firstName"
                      placeholder="Votre prénom"
                      minlength="2"
                      maxlength="50"
                      required
                      [disabled]="loading"
                      #firstName="ngModel">
                    <small class="field-hint">Minimum 2 caractères</small>
                    @if (firstName.invalid && firstName.touched) {
                      <small class="field-error">Le prénom est requis (min. 2 caractères)</small>
                    }
                  </div>
                  <div class="form-group">
                    <label for="lastName">Nom *</label>
                    <input 
                      type="text" 
                      id="lastName"
                      [(ngModel)]="registerData.lastName" 
                      name="lastName"
                      placeholder="Votre nom"
                      minlength="2"
                      maxlength="50"
                      required
                      [disabled]="loading"
                      #lastName="ngModel">
                    <small class="field-hint">Minimum 2 caractères</small>
                    @if (lastName.invalid && lastName.touched) {
                      <small class="field-error">Le nom est requis (min. 2 caractères)</small>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label for="regUsername">Nom d'utilisateur *</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input 
                      type="text" 
                      id="regUsername"
                      [(ngModel)]="registerData.username" 
                      name="regUsername"
                      placeholder="Choisissez un nom d'utilisateur"
                      minlength="3"
                      maxlength="30"
                      pattern="[a-zA-Z0-9_-]+"
                      required
                      [disabled]="loading"
                      #regUsername="ngModel">
                  </div>
                  <small class="field-hint">3-30 caractères (lettres, chiffres, _ et - uniquement)</small>
                  @if (regUsername.invalid && regUsername.touched) {
                    <small class="field-error">
                      @if (regUsername.errors?.['required']) {
                        Le nom d'utilisateur est requis
                      }
                      @if (regUsername.errors?.['minlength']) {
                        Minimum 3 caractères
                      }
                      @if (regUsername.errors?.['pattern']) {
                        Uniquement lettres, chiffres, _ et -
                      }
                    </small>
                  }
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input 
                      type="email" 
                      id="email"
                      [(ngModel)]="registerData.email" 
                      name="email"
                      placeholder="votre@email.com"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      required
                      [disabled]="loading"
                      #email="ngModel">
                  </div>
                  <small class="field-hint">Format: exemple@domaine.com</small>
                  @if (email.invalid && email.touched) {
                    <small class="field-error">
                      @if (email.errors?.['required']) {
                        L'email est requis
                      }
                      @if (email.errors?.['pattern']) {
                        Format d'email invalide
                      }
                    </small>
                  }
                </div>

                <div class="form-group">
                  <label for="regPassword">Mot de passe *</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input 
                      type="password" 
                      id="regPassword"
                      [(ngModel)]="registerData.password" 
                      name="regPassword"
                      placeholder="Créez un mot de passe"
                      minlength="8"
                      required
                      [disabled]="loading"
                      #regPassword="ngModel">
                  </div>
                  <small class="field-hint">Minimum 8 caractères</small>
                  @if (regPassword.invalid && regPassword.touched) {
                    <small class="field-error">
                      @if (regPassword.errors?.['required']) {
                        Le mot de passe est requis
                      }
                      @if (regPassword.errors?.['minlength']) {
                        Minimum 8 caractères requis
                      }
                    </small>
                  }
                  <div class="password-strength">
                    <div class="strength-bar" [class.weak]="getPasswordStrength() === 'weak'" 
                         [class.medium]="getPasswordStrength() === 'medium'"
                         [class.strong]="getPasswordStrength() === 'strong'">
                    </div>
                    <small>Force: {{getPasswordStrengthLabel()}}</small>
                  </div>
                </div>

                <div class="form-group">
                  <label for="role">Rôle *</label>
                  <select 
                    id="role"
                    [(ngModel)]="registerData.role" 
                    name="role"
                    [disabled]="loading"
                    class="select-input"
                    required>
                    <option value="STUDENT">Étudiant</option>
                    <option value="TUTOR">Tuteur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                  <small class="field-hint">Choisissez votre rôle dans la plateforme</small>
                </div>

                <button type="submit" class="btn-primary" [disabled]="loading || !isRegisterFormValid()">
                  @if (!loading) {
                    <span>Créer mon compte</span>
                  } @else {
                    <span class="loading-content">
                      <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none"/>
                      </svg>
                      Création...
                    </span>
                  }
                </button>

                @if (error) {
                  <div class="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {{error}}
                  </div>
                }

                @if (successMessage) {
                  <div class="alert alert-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    {{successMessage}}
                  </div>
                }
              </form>

              <div class="auth-switch">
                <p>Vous avez déjà un compte ?</p>
                <button (click)="toggleView()" class="btn-link">Se connecter</button>
              </div>
            </div>
          } @else {
            <div class="login-view">
              <form (ngSubmit)="onLogin()" class="auth-form">
                <div class="form-group">
                  <label for="username">Nom d'utilisateur</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input 
                      type="text" 
                      id="username"
                      [(ngModel)]="username" 
                      name="username"
                      placeholder="Entrez votre nom d'utilisateur"
                      required
                      [disabled]="loading"
                      autocomplete="username">
                  </div>
                </div>

                <div class="form-group">
                  <div class="label-row">
                    <label for="password">Mot de passe</label>
                    <button type="button" class="btn-forgot" (click)="onForgotPassword()">Mot de passe oublié ?</button>
                  </div>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input 
                      type="password" 
                      id="password"
                      [(ngModel)]="password" 
                      name="password"
                      placeholder="Entrez votre mot de passe"
                      required
                      [disabled]="loading"
                      autocomplete="current-password">
                  </div>
                </div>

                <button type="submit" class="btn-primary" [disabled]="loading">
                  @if (!loading) {
                    <span>Se connecter</span>
                  } @else {
                    <span class="loading-content">
                      <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none"/>
                      </svg>
                      Connexion...
                    </span>
                  }
                </button>

                @if (error) {
                  <div class="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {{error}}
                  </div>
                }
              </form>

              <div class="divider">
                <span>ou continuer avec</span>
              </div>

              <div class="social-login">
                <button class="btn-social btn-google" (click)="loginWithGoogle()">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button class="btn-social btn-linkedin" (click)="loginWithLinkedIn()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>

                <button class="btn-social btn-github" (click)="loginWithGitHub()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>

                <button class="btn-social btn-microsoft" (click)="loginWithMicrosoft()">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
                    <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
                    <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
                    <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
                  </svg>
                  Microsoft
                </button>
              </div>

              <div class="auth-switch">
                <p>Vous n'avez pas de compte ?</p>
                <button (click)="toggleView()" class="btn-link">Créer un compte</button>
              </div>
            </div>
          }
        </div>

        <div class="login-footer">
          <p>Gestion d'école - Powered by Keycloak & Spring Cloud</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0b1120;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .login-wrapper::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
      border-radius: 50%;
      top: -250px;
      right: -250px;
    }

    .login-wrapper::after {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
      border-radius: 50%;
      bottom: -200px;
      left: -200px;
    }

    .login-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .logo {
      width: 72px;
      height: 72px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 24px rgba(59,130,246,0.3);
    }

    .login-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .login-header p {
      font-size: 15px;
      color: #64748b;
      margin: 0;
    }

    .auth-form {
      margin-bottom: 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .btn-forgot {
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
    }

    .btn-forgot:hover {
      color: #2563eb;
      text-decoration: underline;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
      z-index: 1;
    }

    .form-group input,
    .select-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.2s;
      background: white;
      color: #0f172a;
      box-sizing: border-box;
    }

    .input-wrapper input {
      padding-left: 48px;
    }

    .form-group input::placeholder {
      color: #94a3b8;
    }

    .form-group input:focus,
    .select-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
    }

    .input-wrapper input:focus ~ .input-icon {
      color: #3b82f6;
    }

    .form-group input:disabled,
    .select-input:disabled {
      background: #f8fafc;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .select-input {
      cursor: pointer;
    }

    .btn-primary {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(59,130,246,0.3);
      margin-top: 8px;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59,130,246,0.35);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .loading-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .alert {
      padding: 14px 16px;
      border-radius: 12px;
      margin-top: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      animation: shake 0.5s;
    }

    .alert-error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .field-hint {
      display: block;
      font-size: 12px;
      color: rgba(100, 116, 139, 0.8);
      margin-top: 4px;
    }

    .field-error {
      display: block;
      font-size: 12px;
      color: #dc2626;
      margin-top: 4px;
      font-weight: 500;
    }

    .password-strength {
      margin-top: 8px;
    }

    .strength-bar {
      height: 4px;
      border-radius: 2px;
      background: #e5e7eb;
      margin-bottom: 4px;
      transition: all 0.3s;
    }

    .strength-bar.weak {
      width: 33%;
      background: #ef4444;
    }

    .strength-bar.medium {
      width: 66%;
      background: #f59e0b;
    }

    .strength-bar.strong {
      width: 100%;
      background: #22c55e;
    }

    .password-strength small {
      font-size: 12px;
      color: rgba(100, 116, 139, 0.8);
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 28px 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: #e2e8f0;
    }

    .divider span {
      position: relative;
      background: rgba(255, 255, 255, 0.98);
      padding: 0 16px;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .social-login {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 28px;
    }

    .btn-social {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      color: #334155;
    }

    .btn-social:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .btn-social:active {
      transform: translateY(0);
    }

    .btn-google:hover {
      border-color: #4285F4;
      background: #f8fbff;
    }

    .btn-linkedin {
      color: #0077b5;
    }

    .btn-linkedin:hover {
      border-color: #0077b5;
      background: #f0f8ff;
    }

    .btn-github:hover {
      border-color: #333;
      background: #f6f8fa;
    }

    .btn-microsoft:hover {
      border-color: #00a4ef;
      background: #f0f9ff;
    }

    .auth-switch {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .auth-switch p {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 8px 0;
    }

    .btn-link {
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
    }

    .btn-link:hover {
      color: #2563eb;
      text-decoration: underline;
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
    }

    @media (max-width: 580px) {
      .login-card {
        padding: 32px 24px;
      }

      .login-header h1 {
        font-size: 24px;
      }

      .logo {
        width: 64px;
        height: 64px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .social-login {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';
  showRegister = false;
  successMessage = '';

  registerData = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT'
  };

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Vérifier si déjà connecté
    const token = localStorage.getItem('access_token');
    if (token) {
      this.router.navigate(['/dashboard']);
    }
    
    // Déterminer si on affiche le formulaire d'inscription
    this.showRegister = this.router.url === '/register';
  }

  toggleView() {
    if (this.showRegister) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/register']);
    }
    this.showRegister = !this.showRegister;
    this.error = '';
    this.successMessage = '';
    this.loading = false;
  }

  onLogin() {
      console.log('Login attempt started');

      if (!this.username || !this.password) {
        this.error = 'Veuillez remplir tous les champs';
        return;
      }

      if (this.username.length < 3) {
        this.error = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
        return;
      }

      this.loading = true;
      this.error = '';
      console.log('Sending login request...');

      this.http.post<any>('http://localhost:8080/api/auth/login', {
        username: this.username,
        password: this.password
      }).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          localStorage.setItem('user_id', response.user.id.toString());
          localStorage.setItem('username', response.user.username);
          localStorage.setItem('user_role', response.user.role);
          localStorage.setItem('user_email', response.user.email);
          localStorage.setItem('user_firstname', response.user.firstName || '');
          localStorage.setItem('user_lastname', response.user.lastName || '');
          this.loading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.log('Login error received:', err);
          console.log('Error status:', err.status);
          console.log('Error body:', err.error);

          this.loading = false;

          if (err.status === 0) {
            this.error = 'Impossible de se connecter au serveur. Vérifiez que les services sont démarrés.';
          } else if (err.status === 400) {
            this.error = err.error?.message || 'Requête invalide. Vérifiez vos informations.';
          } else if (err.status === 401) {
            this.error = err.error?.message || 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.';
          } else if (err.status === 403) {
            this.error = err.error?.message || 'Accès refusé. Votre compte est peut-être désactivé.';
          } else if (err.status === 503) {
            this.error = 'Service d\'authentification indisponible. Réessayez plus tard.';
          } else {
            this.error = err.error?.message || 'Erreur de connexion. Veuillez réessayer.';
          }

          console.log('Error message set to:', this.error);
          console.log('Loading set to:', this.loading);

          // Réinitialiser le mot de passe en cas d'erreur d'authentification
          if (err.status === 401) {
            this.password = '';
          }

          // Force change detection
          this.cdr.detectChanges();

          setTimeout(() => {
            console.log('After timeout - Error:', this.error, 'Loading:', this.loading);
          }, 100);
        }
      });
    }


  onRegister() {
    console.log('Register attempt started');
    
    // Validation côté client
    if (!this.isRegisterFormValid()) {
      this.error = 'Veuillez remplir correctement tous les champs requis';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    console.log('Sending registration request...');

    this.http.post<any>('http://localhost:8080/api/auth/register', this.registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection vers la page de connexion...';
        this.cdr.detectChanges();
        
        this.registerData = {
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'STUDENT'
        };

        setTimeout(() => {
          console.log('Switching to login view');
          this.showRegister = false;
          this.error = '';
          this.successMessage = '';
          this.loading = false;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => {
        console.log('Registration error:', err);
        this.loading = false;
        
        if (err.status === 0) {
          this.error = 'Impossible de se connecter au serveur. Vérifiez que les services sont démarrés.';
        } else if (err.status === 400) {
          // Afficher le message d'erreur détaillé du backend
          const errorMsg = err.error?.error || err.error?.message || 'Données invalides';
          this.error = `Erreur: ${errorMsg}. Vérifiez que Keycloak est configuré correctement.`;
        } else if (err.status === 401) {
          this.error = 'Erreur d\'authentification avec Keycloak. Contactez l\'administrateur.';
        } else if (err.status === 409) {
          this.error = err.error?.message || 'Ce nom d\'utilisateur ou email existe déjà';
        } else {
          this.error = err.error?.message || 'Erreur lors de la création du compte. Veuillez réessayer.';
        }
        
        this.cdr.detectChanges();
        console.log('Error message set to:', this.error);
      }
    });
  }

  isRegisterFormValid(): boolean {
    return !!(
      this.registerData.firstName && this.registerData.firstName.length >= 2 &&
      this.registerData.lastName && this.registerData.lastName.length >= 2 &&
      this.registerData.username && this.registerData.username.length >= 3 &&
      this.registerData.email && this.isValidEmail(this.registerData.email) &&
      this.registerData.password && this.registerData.password.length >= 8 &&
      this.registerData.role
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    return emailRegex.test(email);
  }

  getPasswordStrength(): string {
    const password = this.registerData.password;
    if (!password || password.length < 6) return 'weak';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    switch(strength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      default: return '';
    }
  }

  onForgotPassword() {
    alert('La fonctionnalité de récupération de mot de passe sera bientôt disponible.');
  }

  loginWithGoogle() {
    alert('La connexion avec Google sera bientôt disponible via Keycloak.');
  }

  loginWithLinkedIn() {
    alert('La connexion avec LinkedIn sera bientôt disponible via Keycloak.');
  }

  loginWithGitHub() {
    alert('La connexion avec GitHub sera bientôt disponible via Keycloak.');
  }

  loginWithMicrosoft() {
    alert('La connexion avec Microsoft sera bientôt disponible via Keycloak.');
  }
}
