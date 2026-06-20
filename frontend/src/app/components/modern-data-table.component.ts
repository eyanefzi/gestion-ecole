import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  action: (row: any) => void;
  visible?: (row: any) => boolean;
}

@Component({
  selector: 'app-modern-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modern-table-container">
      <!-- Header with search and filters -->
      <div class="table-header" *ngIf="showHeader">
        <div class="header-left">
          <h2 class="table-title" *ngIf="title">{{title}}</h2>
          <p class="table-subtitle" *ngIf="subtitle">{{subtitle}}</p>
        </div>
        <div class="header-right">
          <div class="search-container" *ngIf="searchable">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                class="search-input"
                placeholder="Rechercher..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch()"
              />
              <button 
                class="clear-search" 
                *ngIf="searchTerm"
                (click)="clearSearch()"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>

      <!-- Loading state -->
      <div class="loading-container" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <!-- Empty state -->
      <div class="empty-container" *ngIf="!loading && filteredData.length === 0">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <h3>Aucune donnée trouvée</h3>
        <p>{{emptyMessage || 'Aucun élément ne correspond à votre recherche'}}</p>
      </div>

      <!-- Table -->
      <div class="table-wrapper" *ngIf="!loading && filteredData.length > 0">
        <table class="modern-table">
          <thead>
            <tr>
              <th 
                *ngFor="let column of columns" 
                [class]="'align-' + (column.align || 'left')"
                [style.width]="column.width"
                (click)="column.sortable ? sort(column.key) : null"
                [class.sortable]="column.sortable"
              >
                <div class="th-content">
                  <span>{{column.label}}</span>
                  <div class="sort-indicator" *ngIf="column.sortable">
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      stroke-width="2"
                      [class.active]="sortColumn === column.key"
                      [class.desc]="sortColumn === column.key && sortDirection === 'desc'"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              *ngFor="let row of paginatedData; let i = index; trackBy: trackByFn"
              class="table-row"
              [class.selected]="isSelected(row)"
              (click)="onRowClick(row)"
            >
              <td 
                *ngFor="let column of columns"
                [class]="'align-' + (column.align || 'left')"
              >
                <div class="cell-content">
                  @switch (column.type) {
                    @case ('badge') {
                      <span class="badge" [class]="'badge-' + getBadgeClass(getValue(row, column.key))">
                        {{getValue(row, column.key)}}
                      </span>
                    }
                    @case ('actions') {
                      <div class="actions-container">
                        <button 
                          *ngFor="let action of getVisibleActions(row)"
                          class="action-btn"
                          [class]="'btn-' + (action.color || 'secondary')"
                          (click)="$event.stopPropagation(); action.action(row)"
                          [title]="action.label"
                        >
                          <svg *ngIf="action.icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <ng-container [ngSwitch]="action.icon">
                              <g *ngSwitchCase="'edit'">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </g>
                              <g *ngSwitchCase="'delete'">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/>
                                <path d="M14 11v6"/>
                              </g>
                              <g *ngSwitchCase="'view'">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </g>
                              <g *ngSwitchDefault>
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="12" cy="5" r="1"/>
                                <circle cx="12" cy="19" r="1"/>
                              </g>
                            </ng-container>
                          </svg>
                          <span class="action-label">{{action.label}}</span>
                        </button>
                      </div>
                    }
                    @default {
                      <span [innerHTML]="formatValue(row, column)"></span>
                    }
                  }
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="table-footer" *ngIf="!loading && filteredData.length > 0">
        <div class="footer-info">
          <span>
            Affichage de {{(currentPage - 1) * pageSize + 1}} à 
            {{Math.min(currentPage * pageSize, filteredData.length)}} 
            sur {{filteredData.length}} résultats
          </span>
        </div>
        <div class="pagination" *ngIf="totalPages > 1">
          <button 
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <button 
            *ngFor="let page of getVisiblePages()"
            class="page-btn"
            [class.active]="page === currentPage"
            (click)="goToPage(page)"
          >
            {{page}}
          </button>
          
          <button 
            class="page-btn"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modern-table-container {
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px;
      border-bottom: 1px solid #f3f4f6;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
    }

    .header-left {
      flex: 1;
    }

    .table-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .table-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .search-container {
      position: relative;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      pointer-events: none;
    }

    .search-input {
      padding: 10px 16px 10px 40px;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      background: white;
      color: #111827;
      width: 280px;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .clear-search {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s;
    }

    .clear-search:hover {
      color: #374151;
    }

    .loading-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f4f6;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      color: #d1d5db;
      margin-bottom: 16px;
    }

    .empty-container h3 {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 8px 0;
    }

    .empty-container p {
      font-size: 14px;
      color: #9ca3af;
      margin: 0;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .modern-table {
      width: 100%;
      border-collapse: collapse;
    }

    .modern-table thead {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    }

    .modern-table th {
      padding: 16px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
      position: relative;
    }

    .modern-table th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
    }

    .modern-table th.sortable:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .th-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-indicator {
      transition: all 0.2s;
      opacity: 0.5;
    }

    .sort-indicator.active {
      opacity: 1;
      color: #3b82f6;
    }

    .sort-indicator.desc {
      transform: rotate(180deg);
    }

    .modern-table td {
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
      color: #374151;
    }

    .table-row {
      transition: all 0.2s;
      cursor: pointer;
    }

    .table-row:hover {
      background: linear-gradient(135deg, #f9fafb 0%, rgba(59, 130, 246, 0.02) 100%);
    }

    .table-row.selected {
      background: rgba(59, 130, 246, 0.05);
      border-left: 4px solid #3b82f6;
    }

    .align-left { text-align: left; }
    .align-center { text-align: center; }
    .align-right { text-align: right; }

    .cell-content {
      display: flex;
      align-items: center;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-success { background: #ecfdf5; color: #2563eb; }
    .badge-warning { background: #fffbeb; color: #d97706; }
    .badge-danger { background: #fef2f2; color: #dc2626; }
    .badge-info { background: #eff6ff; color: #2563eb; }
    .badge-secondary { background: #f3f4f6; color: #6b7280; }

    .actions-container {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-primary { background: #eff6ff; color: #2563eb; }
    .btn-primary:hover { background: #dbeafe; }

    .btn-secondary { background: #f3f4f6; color: #6b7280; }
    .btn-secondary:hover { background: #e5e7eb; }

    .btn-success { background: #ecfdf5; color: #2563eb; }
    .btn-success:hover { background: #d1fae5; }

    .btn-warning { background: #fffbeb; color: #d97706; }
    .btn-warning:hover { background: #fef3c7; }

    .btn-danger { background: #fef2f2; color: #dc2626; }
    .btn-danger:hover { background: #fee2e2; }

    .action-label {
      display: none;
    }

    @media (min-width: 768px) {
      .action-label {
        display: inline;
      }
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid #f3f4f6;
      background: #f9fafb;
    }

    .footer-info {
      font-size: 14px;
      color: #6b7280;
    }

    .pagination {
      display: flex;
      gap: 4px;
    }

    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
    }

    .page-btn:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .page-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .table-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }

      .table-footer {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .pagination {
        justify-content: center;
      }
    }
  `]
})
export class ModernDataTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() loading: boolean = false;
  @Input() searchable: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() pageSize: number = 10;
  @Input() emptyMessage?: string;
  @Input() selectable: boolean = false;

  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  selectedRows: any[] = [];

  filteredData: any[] = [];
  paginatedData: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateData();
  }

  ngOnChanges() {
    this.updateData();
  }

  updateData() {
    this.filteredData = this.filterData();
    this.sortData();
    this.updatePagination();
  }

  filterData(): any[] {
    if (!this.searchTerm.trim()) {
      return [...this.data];
    }

    const term = this.searchTerm.toLowerCase();
    return this.data.filter(row => {
      return this.columns.some(column => {
        const value = this.getValue(row, column.key);
        return value?.toString().toLowerCase().includes(term);
      });
    });
  }

  sortData() {
    if (!this.sortColumn) return;

    const col = this.columns.find(c => c.key === this.sortColumn);

    this.filteredData.sort((a, b) => {
      let aVal = this.getValue(a, this.sortColumn);
      let bVal = this.getValue(b, this.sortColumn);

      // Handle nulls/undefined — always last
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;

      if (col?.type === 'date') {
        // Parse dates for correct chronological sort
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        comparison = aDate - bDate;
      } else if (col?.type === 'number' || typeof aVal === 'number') {
        comparison = Number(aVal) - Number(bVal);
      } else {
        // String comparison — case insensitive
        comparison = aVal.toString().toLowerCase().localeCompare(bVal.toString().toLowerCase(), 'fr');
      }

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  onSearch() {
    this.currentPage = 1;
    this.updateData();
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.updateData();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
    
    if (this.selectable) {
      const index = this.selectedRows.findIndex(r => r === row);
      if (index > -1) {
        this.selectedRows.splice(index, 1);
      } else {
        this.selectedRows.push(row);
      }
      this.selectionChange.emit(this.selectedRows);
    }
  }

  isSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  formatValue(row: any, column: TableColumn): string {
    const value = this.getValue(row, column.key);
    
    if (column.render) {
      return column.render(value, row);
    }

    switch (column.type) {
      case 'date':
        return value ? new Date(value).toLocaleDateString('fr-FR') : '';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
      default:
        return value?.toString() || '';
    }
  }

  getBadgeClass(value: any): string {
    const val = value?.toString().toLowerCase();
    switch (val) {
      case 'active':
      case 'actif':
      case 'success':
      case 'completed':
      case 'complété':
      case 'disponible':
        return 'success';
      case 'pending':
      case 'en attente':
      case 'warning':
      case 'non passé':
        return 'warning';
      case 'inactive':
      case 'inactif':
      case 'error':
      case 'failed':
        return 'danger';
      case 'info':
        return 'info';
      case 'easy':
      case 'facile':
        return 'success';
      case 'medium':
      case 'moyen':
        return 'warning';
      case 'hard':
      case 'difficile':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getVisibleActions(row: any): TableAction[] {
    return this.actions.filter(action => 
      !action.visible || action.visible(row)
    );
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get Math() {
    return Math;
  }
}