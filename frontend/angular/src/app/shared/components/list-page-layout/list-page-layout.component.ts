import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import {
  MultiSelectFilterPanelComponent,
  FilterConfig,
  AppliedFilters,
} from '../multi-select-filter-panel/multi-select-filter-panel.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
  onClick: () => void;
}

@Component({
  selector: 'app-list-page-layout',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatDividerModule,
    MultiSelectFilterPanelComponent,
    EmptyStateComponent,
  ],
  templateUrl: './list-page-layout.component.html',
  styleUrl: './list-page-layout.component.scss',
})
export class ListPageLayoutComponent {
  filterPanelOpen = false;

  // Main heading text
  @Input() title = '';

  // Subtitle/description shown below the title
  @Input() subtitle = '';

  // Current search input value
  @Input() searchValue = '';

  // Number of selected items; shows bulk-action bar when > 0
  @Input() selectedCount = 0;

  // Actions shown in the bulk-selection bar
  @Input() bulkActions: BulkAction[] = [];

  // Filter configuration with hierarchical categories
  @Input() filterConfig: FilterConfig | null = null;

  // Currently applied filters
  @Input() appliedFilters: AppliedFilters = {};

  // Show empty state when no content
  @Input() isEmpty = false;

  // Empty state message
  @Input() emptyMessage = 'No data available';

  // Emits whenever the search input changes
  @Output() searchChange = new EventEmitter<string>();

  // Emits when filters are applied
  @Output() filtersApplied = new EventEmitter<AppliedFilters>();

  get hasActiveFilters(): boolean {
    return Object.keys(this.appliedFilters).length > 0;
  }

  get activeFilterCount(): number {
    return Object.values(this.appliedFilters).reduce((sum, arr) => sum + arr.length, 0);
  }

  toggleFilterPanel(): void {
    // TODO: Remove alert when filter functionality is fully implemented
    alert('Filter functionality will be implemented soon.');
    // this.filterPanelOpen = !this.filterPanelOpen;
  }

  onFiltersApplied(filters: AppliedFilters): void {
    this.filtersApplied.emit(filters);
    this.filterPanelOpen = false;
  }

  onFilterPanelClosed(): void {
    this.filterPanelOpen = false;
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }
}
