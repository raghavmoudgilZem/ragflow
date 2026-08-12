import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { DatasetService } from '../../services/dataset.service';
import { RenameDatasetDialogData, RenameDatasetDialogResult } from '../../types';

function sameNameValidator(currentName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const trimmed = (control.value ?? '').trim();
    return trimmed.length > 0 && trimmed === currentName.trim() ? { sameName: true } : null;
  };
}

function trimmedRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const trimmed = (control.value ?? '').trim();
    return trimmed.length === 0 ? { required: true } : null;
  };
}

function trimmedMinLengthValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const trimmed = (control.value ?? '').trim();
    if (trimmed.length === 0) return null; // let trimmedRequiredValidator own the empty case
    return trimmed.length < min
      ? { minlength: { requiredLength: min, actualLength: trimmed.length } }
      : null;
  };
}

@Component({
  selector: 'app-rename-dataset-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './rename-dataset-modal.component.html',
  styleUrl: './rename-dataset-modal.component.scss',
})
export class RenameDatasetModalComponent implements AfterViewInit {
  @ViewChild('nameInput') nameInputRef?: ElementRef<HTMLInputElement>;

  private dialogRef = inject(MatDialogRef<RenameDatasetModalComponent, RenameDatasetDialogResult>);
  private datasetService = inject(DatasetService);
  private snackBar = inject(MatSnackBar);

  private readonly snackConfig = {
    horizontalPosition: 'right' as const,
    verticalPosition: 'top' as const,
  };

  isSubmitting = signal(false);
  serverError = signal<string | null>(null); // 409-from-backend or generic API error text
  isSameName = signal(false);

  nameControl: FormControl<string | null>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: RenameDatasetDialogData) {
    this.nameControl = new FormControl(data.currentName, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      trimmedRequiredValidator(),
      trimmedMinLengthValidator(3),
    ]);

    this.isSameName.set(true);

    // Clear server-side error as soon as the user starts typing again
    this.nameControl.valueChanges.subscribe((value) => {
      if (this.serverError()) {
        this.serverError.set(null);
      }
      const trimmed = (value ?? '').trim();
      this.isSameName.set(trimmed.length > 0 && trimmed === this.data.currentName.trim());
    });
  }

  ngAfterViewInit(): void {
    this.dialogRef.afterOpened().subscribe(() => {
      this.nameInputRef?.nativeElement.focus();
      this.nameInputRef?.nativeElement.select();
    });
  }

  get canSave(): boolean {
    return this.nameControl.valid && !this.isSameName() && !this.isSubmitting();
  }

  onSave(): void {
    this.nameControl.markAsTouched();
    if (!this.canSave) {
      return;
    }

    const newName = (this.nameControl.value ?? '').trim();
    this.isSubmitting.set(true);
    this.serverError.set(null);

    this.datasetService.renameDataset(this.data.id, newName).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Dataset renamed successfully', 'Dismiss', {
          duration: 4000,
          panelClass: ['snack-success'],
          ...this.snackConfig,
        });
        this.dialogRef.close({ renamed: true, id: res.id, newName: res.name });
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.handleError(err);
      },
    });
  }

  onCancel(): void {
    if (this.isSubmitting()) return;
    this.dialogRef.close({ renamed: false });
  }

  private handleError(err: HttpErrorResponse): void {
    const status = err.status;
    const backendMessage = err.error?.message as string | undefined;

    if (status === 400) {
      const detail = Array.isArray(err.error?.message) ? err.error.message[0] : err.error?.message;
      this.serverError.set(detail ?? 'Please enter a valid dataset name');
      this.nameControl.setErrors({ serverError: true });
      this.nameControl.markAsTouched();
      return;
    }

    if (status === 409) {
      this.serverError.set(backendMessage ?? 'A dataset with this name already exists');
      this.nameControl.setErrors({ serverError: true }); // ← makes the control genuinely invalid
      this.nameControl.markAsTouched();
      return;
    }

    if (status === 403) {
      this.snackBar.open(
        backendMessage ?? 'You do not have permission to rename this dataset',
        'Dismiss',
        { duration: 6000, panelClass: ['snack--error'], ...this.snackConfig },
      );
      return;
    }

    if (status === 404) {
      this.snackBar.open('This dataset no longer exists', 'Dismiss', {
        duration: 6000,
        panelClass: ['snack--error'],
        ...this.snackConfig,
      });
      this.dialogRef.close({ renamed: false, notFound: true, id: this.data.id }); // close safely — nothing left to rename
      return;
    }

    if (status === 0) {
      this.snackBar.open('Network error. Please check your connection', 'Dismiss', {
        duration: 6000,
        panelClass: ['snack--error'],
        ...this.snackConfig,
      });
      return;
    }

    this.snackBar.open('Something went wrong. Please try again.', 'Dismiss', {
      duration: 6000,
      panelClass: ['snack--error'],
      ...this.snackConfig,
    });
  }
}
