import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-folder-dialog',
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
  templateUrl: './create-folder-dialog.component.html',
  styleUrl: './create-folder-dialog.component.scss',
})
export class CreateFolderDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateFolderDialogComponent>);

  folderName = '';

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.folderName.trim()) {
      this.dialogRef.close(this.folderName.trim());
    }
  }
}
