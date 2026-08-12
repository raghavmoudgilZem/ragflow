import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

interface DialogData {
  fileName?: string;
  title?: string;
  helperText?: string;
}

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './input-dialog.component.html',
  styleUrl: './input-dialog.component.scss',
})
export class InputDialogComponent {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<InputDialogComponent>);

  fileName = this.data?.fileName || '';
  title = this.data?.title || 'File Name';
  helperText = this.data?.helperText || '';

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.fileName.trim()) {
      this.dialogRef.close(this.fileName.trim());
    }
  }
}
