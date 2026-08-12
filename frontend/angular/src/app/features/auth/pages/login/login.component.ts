import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login.component',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm!: FormGroup;
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _router: Router,
    private readonly _notification: NotificationService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get controls() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const rawData = this.loginForm.value;

      const payload = {
        email: rawData.email,
        password: this._authService.encryptPassword(rawData.password),
      };
      this._authService.login(payload).subscribe({
        next: (res: LoginResponse) => {
          const token = res?.access_token;
          if (token) {
            this._authService.setUserToken(token);
            this._authService.initializeSession();
          }
        },
        error: (err: LoginError) => {
          const message = err.error?.message;
          this._notification.showError(message);
        },
      });
    }
  }

  get isAutofilled(): boolean {
    const emailAutofilled = !!this.emailInput?.nativeElement?.matches(':autofill');
    const passwordAutofilled = !!this.passwordInput?.nativeElement?.matches(':autofill');
    return emailAutofilled && passwordAutofilled;
  }
}
