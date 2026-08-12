import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _snackBar = inject(MatSnackBar);

  showError(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'], 
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
  
}
