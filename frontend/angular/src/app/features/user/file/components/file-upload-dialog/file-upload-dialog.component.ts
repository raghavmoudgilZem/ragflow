import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { FILE_UPLOAD } from '../../../../../shared/constants/constant';

@Component({
  selector: 'app-file-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './file-upload-dialog.component.html',
  styleUrl: './file-upload-dialog.component.scss',
})
export class FileUploadDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<FileUploadDialogComponent>);

  readonly ACCEPTED_FILE_TYPES = FILE_UPLOAD.ACCEPTED_FILE_TYPES;

  parseOnCreation = false;
  selectedFiles = signal<File[]>([]);
  isDragOver = signal(false);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  addFiles(files: File[]): void {
    // TODO: Add file validation (file type, size limits, etc.)
    this.selectedFiles.update((current) => [...current, ...files]);
  }

  removeFile(file: File, event: Event): void {
    event.stopPropagation();
    this.selectedFiles.update((current) => current.filter((f) => f !== file));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.selectedFiles().length > 0) {
      this.dialogRef.close({
        files: this.selectedFiles(),
        parseOnCreation: this.parseOnCreation,
      });
    }
  }
}
