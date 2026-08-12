import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterCategory {
  id: string;
  label: string;
  expanded?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  options: FilterOption[];
}

export interface FilterConfig {
  categories: FilterCategory[];
}

export interface AppliedFilters {
  [categoryId: string]: string[];
}

@Component({
  selector: 'app-multi-select-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './multi-select-filter-panel.component.html',
  styleUrls: ['./multi-select-filter-panel.component.scss'],
})
export class MultiSelectFilterPanelComponent {
  config = input.required<FilterConfig>();
  initialFilters = input<AppliedFilters>({});

  filtersApplied = output<AppliedFilters>();
  panelClosed = output<void>();

  readonly selectedFilters = signal<AppliedFilters>({});
  filterSearch = signal('');

  filteredCategories = computed(() => {
    const search = this.filterSearch().toLowerCase().trim();
    if (!search) {
      return this.config().categories;
    }

    return this.config()
      .categories.map((category) => ({
        ...category,
        options: category.options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(search) || opt.value.toLowerCase().includes(search),
        ),
      }))
      .filter((category) => category.options.length > 0);
  });

  activeFilterCount = computed(() => {
    const filters = this.selectedFilters();
    return Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
  });

  constructor() {
    this.selectedFilters.set({ ...this.initialFilters() });
  }

  isOptionSelected(categoryId: string, optionValue: string): boolean {
    const categoryFilters = this.selectedFilters()[categoryId] || [];
    return categoryFilters.includes(optionValue);
  }

  toggleOption(categoryId: string, optionValue: string, multiSelect: boolean): void {
    const current = { ...this.selectedFilters() };
    const categoryFilters = current[categoryId] || [];

    if (multiSelect) {
      current[categoryId] = categoryFilters.includes(optionValue)
        ? categoryFilters.filter((v) => v !== optionValue)
        : [...categoryFilters, optionValue];
    } else if (categoryFilters.includes(optionValue)) {
      current[categoryId] = [];
    } else {
      current[categoryId] = [optionValue];
    }

    if (current[categoryId]?.length === 0) {
      delete current[categoryId];
    }

    this.selectedFilters.set(current);
  }

  clearAll(): void {
    this.selectedFilters.set({});
  }

  applyFilters(): void {
    this.filtersApplied.emit(this.selectedFilters());
    this.panelClosed.emit();
  }

  cancel(): void {
    this.selectedFilters.set({ ...this.initialFilters() });
    this.panelClosed.emit();
  }
}
