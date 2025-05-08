import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  authForm: FormGroup;
  isLoading = false;
  authError = '';
  isLogin = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        passwordConfirmation: ['']
      },
      { validators: [this.passwordMatchValidator()] }
    );

    this.updatePasswordConfirmationValidators();
  }

  get emailControl(): AbstractControl | null {
    return this.authForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.authForm.get('password');
  }

  get passwordConfirmationControl(): AbstractControl | null {
    return this.authForm.get('passwordConfirmation');
  }

  toggleAuthMode(event: Event) {
    event.preventDefault();
    this.isLogin = !this.isLogin;
    this.authError = '';
    this.updatePasswordConfirmationValidators();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authError = '';

    const email = this.emailControl?.value as string;
    const password = this.passwordControl?.value as string;
    const passwordConfirmation = this.passwordConfirmationControl?.value as string;

    const request$ = this.isLogin
      ? this.authService.login(email, password)
      : this.authService.signUp(email, password, passwordConfirmation);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/messages']);
      },
      error: (error) => {
        this.isLoading = false;
        this.authError = this.getErrorMessage(error);
      }
    });
  }

  private updatePasswordConfirmationValidators(): void {
    if (!this.passwordConfirmationControl) {
      return;
    }

    if (this.isLogin) {
      this.passwordConfirmationControl.clearValidators();
      this.passwordConfirmationControl.setValue('');
    } else {
      this.passwordConfirmationControl.setValidators([Validators.required]);
    }

    this.passwordConfirmationControl.updateValueAndValidity();
    this.authForm.updateValueAndValidity();
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (this.isLogin) {
        return null;
      }

      const password = control.get('password')?.value;
      const confirmation = control.get('passwordConfirmation')?.value;

      if (!password || !confirmation) {
        return null;
      }

      return password === confirmation ? null : { passwordMismatch: true };
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === 'object') {
      const httpError = error as HttpErrorResponse;
      if (httpError.error?.errors) {
        return httpError.error.errors.join(', ');
      }

      if (httpError.error?.error) {
        return httpError.error.error;
      }
    }

    return 'Authentication failed';
  }
}
