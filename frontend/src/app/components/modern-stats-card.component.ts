import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modern-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modern-stat-card" [class]="'theme-' + theme">
      <div class="stat-header">
        <div class="stat-icon" [class]="iconColor">
          <ng-content select="[slot=icon]"></ng-content>
        </div>
        <div class="stat-trend" [class]="trendClass">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (trend === 'up') {
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            } @else if (trend === 'down') {
              <polyline points="1 18 10.5 8.5 15.5 13.5 23 6"/>
              <polyline points="17 18 23 18 23 12"/>
            } @else {
              <line x1="5" y1="12" x2="19" y2="12"/>
            }
          </svg>
          <span>{{trendValue}}%</span>
        </div>
      </div>
      
      <div class="stat-content">
        <div class="stat-value">
          <span class="value-number">{{value}}</span>
          @if (suffix) {
            <span class="value-suffix">{{suffix}}</span>
          }
        </div>
        <h3 class="stat-title">{{title}}</h3>
        @if (subtitle) {
          <p class="stat-subtitle">{{subtitle}}</p>
        }
      </div>

      @if (showProgress) {
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressValue"></div>
          </div>
          <span class="progress-text">{{progressValue}}% de l'objectif</span>
        </div>
      }

      <div class="stat-sparkline" *ngIf="sparklineData.length > 0">
        <svg width="100%" height="40" viewBox="0 0 200 40">
          <polyline
            [attr.points]="sparklinePoints"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            opacity="0.6"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .modern-stat-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .modern-stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-500, #3b82f6), var(--primary-600, #2563eb));
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .modern-stat-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .modern-stat-card:hover::before {
      transform: scaleX(1);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .stat-icon::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, currentColor, currentColor);
      opacity: 0.1;
      border-radius: inherit;
    }

    .stat-icon.blue { color: #3b82f6; }
    .stat-icon.green { color: #3b82f6; }
    .stat-icon.purple { color: #8b5cf6; }
    .stat-icon.orange { color: #f59e0b; }
    .stat-icon.pink { color: #ec4899; }
    .stat-icon.red { color: #ef4444; }
    .stat-icon.cyan { color: #06b6d4; }
    .stat-icon.indigo { color: #6366f1; }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    .stat-trend.positive {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .stat-trend.negative {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .stat-trend.neutral {
      background: rgba(107, 114, 128, 0.1);
      color: #6b7280;
      border: 1px solid rgba(107, 114, 128, 0.2);
    }

    .stat-content {
      margin-bottom: 20px;
    }

    .stat-value {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 8px;
    }

    .value-number {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      line-height: 1;
    }

    .value-suffix {
      font-size: 16px;
      font-weight: 500;
      color: #6b7280;
    }

    .stat-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 4px 0;
    }

    .stat-subtitle {
      font-size: 14px;
      color: #9ca3af;
      margin: 0;
    }

    .progress-container {
      margin-bottom: 16px;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #f3f4f6;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-500, #3b82f6), var(--primary-600, #2563eb));
      border-radius: 3px;
      transition: width 1s ease-out;
    }

    .progress-text {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }

    .stat-sparkline {
      height: 40px;
      color: var(--primary-500, #3b82f6);
      opacity: 0.7;
    }

    /* Theme variations */
    .theme-primary .modern-stat-card::before {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .theme-blue .modern-stat-card::before {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .theme-purple .modern-stat-card::before {
      background: linear-gradient(90deg, #8b5cf6, #7c3aed);
    }

    .theme-orange .modern-stat-card::before {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .theme-pink .modern-stat-card::before {
      background: linear-gradient(90deg, #ec4899, #db2777);
    }

    .theme-red .modern-stat-card::before {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    @media (max-width: 768px) {
      .modern-stat-card {
        padding: 20px;
      }

      .value-number {
        font-size: 28px;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class ModernStatsCardComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() value: string | number = 0;
  @Input() suffix?: string;
  @Input() iconColor: string = 'blue';
  @Input() theme: string = 'primary';
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() trendValue: number = 0;
  @Input() showProgress: boolean = false;
  @Input() progressValue: number = 0;
  @Input() sparklineData: number[] = [];

  get trendClass(): string {
    switch (this.trend) {
      case 'up': return 'positive';
      case 'down': return 'negative';
      default: return 'neutral';
    }
  }

  get sparklinePoints(): string {
    if (this.sparklineData.length === 0) return '';
    
    const width = 200;
    const height = 40;
    const padding = 4;
    
    const max = Math.max(...this.sparklineData);
    const min = Math.min(...this.sparklineData);
    const range = max - min || 1;
    
    return this.sparklineData
      .map((value, index) => {
        const x = (index / (this.sparklineData.length - 1)) * (width - 2 * padding) + padding;
        const y = height - padding - ((value - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(' ');
  }
}