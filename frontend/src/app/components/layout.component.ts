import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="main-app">
      <app-navbar></app-navbar>
      
      <div class="content">
        <div class="topbar">
          <div class="topbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search or type command..." />
            <span class="kbd">⌘K</span>
          </div>
          <div class="topbar-right">
            <button class="topbar-icon-btn" title="Toggle theme">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-app {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
    }

    .content {
      flex: 1;
      margin-left: 260px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      height: 56px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topbar-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 7px 14px;
      width: 280px;
      color: #9ca3af;
    }

    .topbar-search input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 13.5px;
      color: #374151;
      flex: 1;
    }

    .topbar-search input::placeholder { color: #9ca3af; }

    .kbd {
      font-size: 11px;
      color: #9ca3af;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 2px 6px;
      font-family: monospace;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topbar-icon-btn {
      width: 34px;
      height: 34px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }
    .topbar-icon-btn:hover { background: #f3f4f6; color: #374151; }

    .page-content { flex: 1; }

    @media (max-width: 1024px) {
      .content { margin-left: 230px; }
    }

    @media (max-width: 768px) {
      .content { margin-left: 0; }
      .topbar { padding: 0 16px; }
      .topbar-search { width: 200px; }
    }
  `]
})
export class LayoutComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Vérifier l'authentification
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/']);
    }
  }
}
