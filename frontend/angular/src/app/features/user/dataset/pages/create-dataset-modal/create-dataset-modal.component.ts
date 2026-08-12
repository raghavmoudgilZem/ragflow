import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';

// Angular Material
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Feature
import {
  EmbeddingModel,
  ChunkingMethod,
  Pipeline,
  ParseType,
  CreateDatasetPayload,
} from '../../models/dataset.model';
import { DatasetService } from '../../services/dataset.service';

// Shared
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoaderComponent } from '../../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-create-dataset-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    LoaderComponent,
  ],
  templateUrl: './create-dataset-modal.component.html',
  styleUrls: ['./create-dataset-modal.component.scss'],
})
export class CreateDatasetModal implements OnInit, OnDestroy {
  // ─── DI ───────────────────────────────────────────────────────────────────
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateDatasetModal>);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private datasetService = inject(DatasetService);
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private authService = inject(AuthService);

  // ─── Template ref for search input ────────────────────────────────────────
  @ViewChild('chunkingSearchInput') chunkingSearchInput?: ElementRef<HTMLInputElement>;

  // ─── Signals ──────────────────────────────────────────────────────────────
  embeddingModels = signal<EmbeddingModel[]>([]);
  chunkingMethods = signal<ChunkingMethod[]>([]);
  pipelines = signal<Pipeline[]>([]);
  isLoadingModels = signal(false);
  isLoadingMethods = signal(false);
  isLoadingPipelines = signal(false);
  isSubmitting = signal(false);
  modelsLoadError = signal(false);

  // ─── Chunking search ──────────────────────────────────────────────────────
  chunkingSearchTerm = signal('');
  filteredChunkingMethods = computed(() => {
    const term = this.chunkingSearchTerm().toLowerCase();
    if (!term) return this.chunkingMethods();
    return this.chunkingMethods().filter((m) => m.label.toLowerCase().includes(term));
  });

  // ─── Form ─────────────────────────────────────────────────────────────────
  form!: FormGroup;

  get nameControl(): AbstractControl {
    return this.form.get('name')!;
  }
  get embeddingModelControl(): AbstractControl {
    return this.form.get('embeddingModel')!;
  }
  get parseTypeControl(): AbstractControl {
    return this.form.get('parseType')!;
  }
  get chunkingMethodControl(): AbstractControl {
    return this.form.get('chunkingMethod')!;
  }
  get pipelineIdControl(): AbstractControl {
    return this.form.get('pipelineId')!;
  }

  get isBuiltIn(): boolean {
    return this.parseTypeControl.value === 'built-in';
  }
  get isPipeline(): boolean {
    return this.parseTypeControl.value === 'pipeline';
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
    this.watchParseTypeChanges();
    this.setupCloseGuard();
    this.loadEmbeddingModels();
    this.loadChunkingMethods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Form ─────────────────────────────────────────────────────────────────
  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      embeddingModel: ['', Validators.required],
      parseType: ['built-in' as ParseType],
      chunkingMethod: [null, Validators.required],
      pipelineId: [null],
    });
  }

  private watchParseTypeChanges(): void {
    this.parseTypeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: ParseType) => {
        const chunking = this.chunkingMethodControl;
        const pipeline = this.pipelineIdControl;

        if (type === 'built-in') {
          chunking.setValidators(Validators.required);
          pipeline.clearValidators();
          pipeline.setValue(null);
        } else {
          pipeline.setValidators(Validators.required);
          chunking.clearValidators();
          chunking.setValue(null);
        }

        // Fetch pipelines on-demand — only on first Pipeline selection
        if (this.pipelines().length === 0 && !this.isLoadingPipelines()) {
          this.loadPipelines();
        }

        chunking.updateValueAndValidity();
        pipeline.updateValueAndValidity();
      });
  }

  // ─── Data loading ─────────────────────────────────────────────────────────
  private loadEmbeddingModels(): void {
    this.isLoadingModels.set(true);
    this.modelsLoadError.set(false);

    this.datasetService
      .getEmbeddingModels()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingModels.set(false)),
      )
      .subscribe({
        next: (models) => {
          this.embeddingModels.set(models);
          if (models.length > 0) this.embeddingModelControl.setValue(models[0].id);
        },
        error: () => this.modelsLoadError.set(true),
      });
  }

  private loadChunkingMethods(): void {
    this.isLoadingMethods.set(true);

    this.datasetService
      .getChunkingMethods()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingMethods.set(false)),
      )
      .subscribe({
        next: (methods) => this.chunkingMethods.set(methods),
        error: () => this.chunkingMethods.set([]),
      });
  }

  private loadPipelines(): void {
    this.isLoadingPipelines.set(true);
    this.datasetService
      .getPipelines()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingPipelines.set(false)),
      )
      .subscribe({
        next: (pipelines) => this.pipelines.set(pipelines),
        error: () => {
          this.pipelines.set([]);
          this.snackBar.open(
            'Failed to load pipelines. You can still switch to Built-in parse type.',
            'Dismiss',
            {
              duration: 5000,
              panelClass: ['snack--error'],
              horizontalPosition: 'right',
              verticalPosition: 'top',
            },
          );
        },
      });
  }

  // ─── Close guard ──────────────────────────────────────────────────────────
  private setupCloseGuard(): void {
    this.dialogRef
      .backdropClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.attemptClose());

    this.dialogRef
      .keydownEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.attemptClose();
        }
      });
  }

  attemptClose(): void {
    if (this.form.dirty) {
      this.openConfirmDialog();
    } else {
      this.dialogRef.close(null);
    }
  }

  private openConfirmDialog(): void {
    const confirmRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        panelClass: 'confirm-dialog-panel',
        data: {
          title: 'Discard changes?',
          message: "You have unsaved changes. Closing will discard everything you've entered.",
          confirmText: 'Discard',
          cancelText: 'Keep editing',
          isDanger: true,
        },
      },
    );

    confirmRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) this.dialogRef.close(null);
      });
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    const payload: CreateDatasetPayload = {
      name: formValue.name.trim(),
      embeddingModel: formValue.embeddingModel,
      parseType: formValue.parseType,
      ...(this.isBuiltIn && { chunkingMethod: formValue.chunkingMethod }),
      ...(this.isPipeline && { pipelineId: formValue.pipelineId }),
    };

    this.datasetService
      .createDataset(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Dataset created successfully', 'Dismiss', {
            duration: 4000,
            panelClass: ['snack--success'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close({ refresh: true });
        },
        error: (err) => {
          const status = err?.status;

          if (status === 401) {
            this.snackBar.open('Your session has expired. Redirecting to login…', 'Dismiss', {
              duration: 3000,
              panelClass: ['snack--error'],
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.dialogRef.close(null);
            setTimeout(() => this.authService.clearSession(), 3000);
            return;
          }

          const message =
            status === 409
              ? 'A dataset with this name already exists.'
              : status === 0 || status === undefined
                ? 'Network error. Please check your connection and try again.'
                : status >= 500
                  ? 'Server error. Please try again later.'
                  : 'Failed to create dataset. Please try again.';

          this.snackBar.open(message, 'Dismiss', {
            duration: 6000,
            panelClass: ['snack--error'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
  }

  // ─── Chunking search ──────────────────────────────────────────────────────
  onChunkingSearch(term: string): void {
    this.chunkingSearchTerm.set(term);
  }

  /**
   * Called when the chunking dropdown opens or closes.
   * On open: clears search so full list shows, then focuses the
   * search input after the panel animates in (small timeout needed).
   * On close: resets search term so next open shows full list.
   */
  onChunkingDropdownOpen(isOpen: boolean): void {
    if (isOpen) {
      this.chunkingSearchTerm.set('');
      // Wait for the panel to finish rendering before focusing the input
      setTimeout(() => {
        this.chunkingSearchInput?.nativeElement.focus();
      }, 50);
    } else {
      this.chunkingSearchTerm.set('');
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
