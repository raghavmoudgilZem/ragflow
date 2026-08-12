import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { SearchService } from '../../services/search.service';
import { SearchApp } from '../../models/search.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  private searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchApps = signal<SearchApp[]>([]);
  totalApps = signal<number>(0);
  isLoading = signal<boolean>(false);

  searchFilter = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(50);

  isCreateModalOpen = signal<boolean>(false);
  isRenameModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);

  selectedApp = signal<SearchApp | null>(null);
  appNameInput = signal<string>('');

  // Computed Filtered List
  filteredApps = computed(() => {
    const filter = this.searchFilter().toLowerCase().trim();
    if (!filter) return this.searchApps();
    return this.searchApps().filter((app) =>
      app.name.toLowerCase().includes(filter)
    );
  });

  ngOnInit(): void {
    this.fetchSearchApps();
  }

  fetchSearchApps(): void {
    this.isLoading.set(true);
    this.searchService.getSearchApps().subscribe({
      next: (res) => {
        if (res.code === 0 && res.data) {
          this.searchApps.set(res.data.search_apps || []);
          this.totalApps.set(res.data.total || 0);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openCreateModal(): void {
    this.appNameInput.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitCreate(): void {
    const name = this.appNameInput().trim();
    if (!name) return;

    this.searchService.createSearchApp({ name }).subscribe({
      next: (res) => {
        if (res.code === 0 && res.data) {
          this.closeCreateModal();
          this.router.navigate([res.data.id], {
            relativeTo: this.route,
            queryParams: { isNew: 'true' },
          });
        }
      },
    });
  }

  openRenameModal(app: SearchApp, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedApp.set(app);
    this.appNameInput.set(app.name);
    this.isRenameModalOpen.set(true);
  }

  closeRenameModal(): void {
    this.isRenameModalOpen.set(false);
    this.selectedApp.set(null);
  }

  submitRename(): void {
    const app = this.selectedApp();
    const name = this.appNameInput().trim();
    if (!app || !name) return;

    this.searchService.updateSearchApp(app.id, { name }).subscribe({
      next: (res) => {
        if (res.code === 0) {
          this.closeRenameModal();
          this.fetchSearchApps();
        }
      },
    });
  }

  openDeleteModal(app: SearchApp, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedApp.set(app);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedApp.set(null);
  }

  submitDelete(): void {
    const app = this.selectedApp();
    if (!app) return;

    this.searchService.deleteSearchApp(app.id).subscribe({
      next: (res) => {
        if (res.code === 0) {
          this.closeDeleteModal();
          this.fetchSearchApps();
        }
      },
    });
  }

  navigateToDetail(appId: string): void {
    this.router.navigate([appId], { relativeTo: this.route });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'S';
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
}