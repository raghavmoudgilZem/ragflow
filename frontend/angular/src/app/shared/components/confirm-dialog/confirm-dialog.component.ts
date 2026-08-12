import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="confirm-message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        mat-flat-button
        [class.danger-btn]="data.isDanger"
        [class.confirm-btn]="!data.isDanger"
        (click)="onConfirm()"
      >
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .confirm-dialog-panel {
        .mat-mdc-dialog-container {
          .mdc-dialog__surface {
            background-color: var(--bg-surface) !important;
          }
        }

        h2[mat-dialog-title] {
          color: var(--text-primary) !important;
        }

        mat-dialog-content {
          min-width: 400px;
          padding: 20px 24px;
        }

        .confirm-message {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }

        .confirm-btn {
          background-color: var(--text-primary) !important;
          color: var(--bg-base) !important;
        }

        .danger-btn {
          background-color: rgb(216, 73, 75) !important;
          color: #ffffff !important;
        }

        button.mat-mdc-button {
          color: var(--text-secondary) !important;
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
