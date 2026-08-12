import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { RenameDatasetModalComponent } from '../rename-dataset-modal/rename-dataset-modal.component';
import { CreateDatasetModal } from '../create-dataset-modal/create-dataset-modal.component';
import { DatasetFilterPanelComponent } from '../dataset-filter-panel/dataset-filter-panel.component';

import { Dataset, PaginatedDatasetResponse } from '../../models';
import {
  DatasetCardData,
  DatasetCardAction,
  RenameDatasetDialogResult,
  DatasetFilters,
} from '../../types';
import { DatasetService } from '../../services';
import {
  CardComponent,
  ConfirmDialogComponent,
  ConfirmDialogData,
  ICardMenuAction,
  LoaderComponent,
} from '../../../../../shared/components';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

type DatasetLoadError = 'network' | 'unauthorized' | 'invalid-params' | 'server' | null;

@Component({
  selector: 'app-dataset',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    CardComponent,
    LoaderComponent,
    DatasetFilterPanelComponent,
  ],
  templateUrl: './dataset.component.html',
  styleUrl: './dataset.component.scss',
})
export class DatasetComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private datasetService = inject(DatasetService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  private searchInput$ = new Subject<string>();
  private static readonly DEFAULT_PAGE_SIZE = 10;

  datasets = signal<DatasetCardData[]>([]);
  isLoading = signal(false);
  loadError = signal<DatasetLoadError>(null);
  filters = signal<DatasetFilters>({});

  searchTerm = signal('');
  page = signal(1);
  pageSize = signal(10);
  total = signal(0);

  hasEverHadDatasets = signal(false);

  deletingIds = signal<Set<string>>(new Set());

  cardMenuActions: ICardMenuAction<DatasetCardAction>[] = [
    { label: 'Rename', icon: 'edit', action: 'rename' },
    { label: 'Delete', icon: 'delete_outline', action: 'delete', className: 'delete-item' },
  ];

  get hasDatasets(): boolean {
    return this.datasets().length > 0;
  }

  get hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.createdFrom || f.createdTo || f.embeddingModel);
  }

  get isSearchActive(): boolean {
    return this.searchTerm().trim().length > 0;
  }

  get showPaginator(): boolean {
    return this.total() > DatasetComponent.DEFAULT_PAGE_SIZE;
  }

  get errorMessage(): string {
    switch (this.loadError()) {
      case 'network':
        return 'Network error. Please check your connection and try again.';
      case 'unauthorized':
        return 'Your session has expired. Redirecting to login…';
      case 'invalid-params':
        return 'Something went wrong loading this page. Resetting to page 1…';
      case 'server':
        return 'Server error. Please try again later.';
      default:
        return 'Failed to load datasets. Please try again.';
    }
  }

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.page.set(1); // reset to page 1 whenever the search term changes
        this.loadDatasets();
      });

    this.loadDatasets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFiltersApplied(filters: DatasetFilters): void {
    this.filters.set(filters);
    this.page.set(1);
    this.loadDatasets();
  }

  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  clearSearch(): void {
    this.searchInput$.next('');
  }

  loadDatasets(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.datasetService
      .getDatasets({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.searchTerm() || undefined,
        filters: this.filters(),
      })
      .subscribe({
        next: (data) => {
          this.datasets.set(
            data.items.map((d: Dataset) => ({
              id: d.id,
              title: d.name,
              createdAt: d.createdAt,
              fileCount: d.fileCount,
            })),
          );
          this.total.set(data.total);
          if (data.total > 0) {
            this.hasEverHadDatasets.set(true);
          }
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => this.handleLoadError(err),
      });
  }

  private handleLoadError(err: HttpErrorResponse): void {
    this.isLoading.set(false);

    if (err.status === 401) {
      this.loadError.set('unauthorized');
      this.snackBar.open('Your session has expired. Redirecting to login…', 'Dismiss', {
        duration: 3000,
        panelClass: ['snack--error'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      setTimeout(() => this.authService.clearSession(), 1500);
      return;
    }

    if (err.status === 400) {
      this.loadError.set('invalid-params');
      this.page.set(1);
      this.pageSize.set(10);
      setTimeout(() => this.loadDatasets(), 1000);
      return;
    }

    if (err.status === 0 || err.status === undefined) {
      this.loadError.set('network');
      return;
    }

    if (err.status >= 500) {
      this.loadError.set('server');
      return;
    }

    this.loadError.set('server');
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1); // MatPaginator is 0-indexed, our API is 1-indexed
    this.pageSize.set(event.pageSize);
    this.loadDatasets();
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(CreateDatasetModal, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'dataset-dialog-panel',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.refresh) {
        this.loadDatasets();
      }
    });
  }

  onCardMenuAction(event: { action: DatasetCardAction; data: DatasetCardData }): void {
    switch (event.action) {
      case 'rename':
        this.openRenameModal(event.data);
        break;
      case 'delete':
        this.openDeleteConfirm(event.data);
        break;
    }
  }

  openRenameModal(dataset: DatasetCardData): void {
    const dialogRef = this.dialog.open<
      RenameDatasetModalComponent,
      unknown,
      RenameDatasetDialogResult
    >(RenameDatasetModalComponent, {
      width: '440px',
      maxWidth: '95vw',
      panelClass: 'rename-dataset-dialog-panel',
      disableClose: true,
      autoFocus: false,
      data: { id: dataset.id, currentName: dataset.title },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.renamed && result.newName) {
        this.datasets.update((list) =>
          list.map((d) => (d.id === result.id ? { ...d, title: result.newName! } : d)),
        );
      } else if (result?.notFound && result.id) {
        this.datasets.update((list) => list.filter((d) => d.id !== result.id));
      }
    });
  }

  onCardClick(dataset: DatasetCardData): void {
    // TODO: navigate to dataset detail page
    console.log('Dataset clicked:', dataset.id);
  }

  openDeleteConfirm(dataset: DatasetCardData): void {
    if (this.deletingIds().has(dataset.id)) {
      return; // already deleting this one — ignore duplicate trigger
    }

    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        panelClass: 'confirm-dialog-panel',
        data: {
          title: 'Delete Dataset',
          message: 'Are you sure you want to delete this dataset? This action cannot be undone.',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          isDanger: true,
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.performDelete(dataset);
      }
    });
  }

  private performDelete(dataset: DatasetCardData): void {
    this.deletingIds.update((ids) => new Set(ids).add(dataset.id));

    this.datasetService.deleteDataset(dataset.id).subscribe({
      next: () => {
        this.deletingIds.update((ids) => {
          const next = new Set(ids);
          next.delete(dataset.id);
          return next;
        });

        this.snackBar.open('Dataset deleted successfully', 'Dismiss', {
          duration: 4000,
          panelClass: ['snack--success'],
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        const newTotal = this.total() - 1;
        const maxValidPage = Math.max(1, Math.ceil(newTotal / this.pageSize()));

        if (this.page() > maxValidPage) {
          // Current page no longer exists given the new total — step back
          this.page.set(maxValidPage);
        }

        this.loadDatasets(); // re-fetch — preserves current search/filter state automatically
      },
      error: (err: HttpErrorResponse) => {
        this.deletingIds.update((ids) => {
          const next = new Set(ids);
          next.delete(dataset.id);
          return next;
        });
        this.handleDeleteError(err, dataset);
      },
    });
  }

  private handleDeleteError(err: HttpErrorResponse, dataset: DatasetCardData): void {
    if (err.status === 403) {
      this.snackBar.open('You do not have permission to delete this dataset.', 'Dismiss', {
        duration: 6000,
        panelClass: ['snack--error'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      return;
    }

    if (err.status === 404) {
      // Already gone (e.g. deleted from another session) — remove the
      // stale card here too, same pattern as Rename's 404 handling.
      this.snackBar.open('Dataset not found.', 'Dismiss', {
        duration: 6000,
        panelClass: ['snack--error'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      this.datasets.update((list) => list.filter((d) => d.id !== dataset.id));
      this.total.update((t) => Math.max(0, t - 1));
      return;
    }

    // Network failure, 500, or anything else unexpected
    this.snackBar.open('Something went wrong. Please try again.', 'Dismiss', {
      duration: 6000,
      panelClass: ['snack--error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(',', '');
  }
}
