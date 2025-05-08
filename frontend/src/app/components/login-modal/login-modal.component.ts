import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  status: {
    code: number;
    message: string;
  };
  data: {
    id: number;
    email: string;
    created_at: string;
  };
  errors?: string[];
  token: string;
}

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="showModal" [class.show]="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Please sign in</h2>
        </div>
        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control"
                placeholder="Enter your email"
                [class.error]="authForm.get('email')?.invalid && authForm.get('email')?.touched"
              >
              <div class="error-message" *ngIf="authForm.get('email')?.invalid && authForm.get('email')?.touched">
                Please enter a valid email address
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <input 
                type="password" 
                id="password" 
                formControlName="password" 
                class="form-control"
                placeholder="Enter your password"
                [class.error]="authForm.get('password')?.invalid && authForm.get('password')?.touched"
              >
              <div class="error-message" *ngIf="authForm.get('password')?.invalid && authForm.get('password')?.touched">
                Password is required
              </div>
            </div>
          </div>

          <div class="form-group" *ngIf="!isLogin">
            <label for="passwordConfirmation">Confirm Password</label>
            <div class="input-wrapper">
              <input 
                type="password" 
                id="passwordConfirmation" 
                formControlName="passwordConfirmation" 
                class="form-control"
                placeholder="Confirm your password"
                [class.error]="authForm.get('passwordConfirmation')?.invalid && authForm.get('passwordConfirmation')?.touched"
              >
              <div class="error-message" *ngIf="authForm.get('passwordConfirmation')?.invalid && authForm.get('passwordConfirmation')?.touched">
                Passwords must match
              </div>
            </div>
          </div>

          <div class="error-message" *ngIf="authError">
            {{ authError }}
          </div>

          <button 
            type="submit" 
            [disabled]="!authForm.valid"
            [class.loading]="isLoading"
          >
            <span class="button-text">Sign {{ isLogin ? 'In' : 'Up' }}</span>
            <span class="loading-spinner"></span>
          </button>

          <div class="toggle-auth">
            <p>
              <a href="#" (click)="toggleAuthMode($event)">
                Sign {{isLogin ? 'Up' : 'In'}}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 1 !important; /* Force visibility for debugging */
      visibility: visible !important; /* Force visibility for debugging */
    }

    .modal-backdrop.show {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      width: 400px;
      max-width: 90%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      transform: none !important; /* Force visibility for debugging */
      color: black !important; /* Force text visibility */
    }

    .modal-backdrop.show .modal-content {
      transform: translateY(0);
    }

    .modal-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .modal-header h2 {
      color: #2c3e50;
      font-size: 2rem;
      margin: 0;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #7f8c8d;
      margin: 0;
      font-size: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .input-wrapper {
      position: relative;
    }

    .form-control {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s ease;
      background: white;
      color: #2c3e50;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      display: block;
    }

    button {
      width: 100%;
      padding: 1rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      margin-top: 1rem;
    }

    button:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    button:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .button-text {
      display: inline-block;
      transition: opacity 0.2s ease;
    }

    .loading .button-text {
      opacity: 0;
    }

    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      opacity: 0;
      transition: opacity 0.2s ease;
      animation: spin 0.8s linear infinite;
    }

    .loading .loading-spinner {
      opacity: 1;
    }

    @keyframes spin {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }

    /* Add these new styles for placeholder text */
    .form-control::placeholder {
      color: #95a5a6;
      opacity: 0.8;
    }

    /* Style for autofill */
    .form-control:-webkit-autofill,
    .form-control:-webkit-autofill:hover,
    .form-control:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0px 1000px white inset;
      -webkit-text-fill-color: #2c3e50;
      transition: background-color 5000s ease-in-out 0s;
    }

    .toggle-auth {
      text-align: center;
      margin-top: 1.5rem;
      color: #7f8c8d !important; /* Force text visibility */
    }

    .toggle-auth p {
      margin: 0;
      font-size: 0.9rem;
      color: inherit !important; /* Force text visibility */
    }

    .toggle-auth a {
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
      margin-left: 0.5rem;
    }

    .toggle-auth a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginModalComponent implements OnInit {
  authForm!: FormGroup;
  showModal = false;
  isLoading = false;
  authError = '';
  isLogin = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    console.log('LoginModal initialized, isLogin:', this.isLogin);
    this.messageService.getAuthRequired().subscribe(required => {
      console.log('Auth required changed:', required);
      this.showModal = required;
    });
  }

  private initializeForm() {
    console.log('Initializing form, isLogin:', this.isLogin);
    const baseControls = {
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    };

    const signupControls = {
      ...baseControls,
      passwordConfirmation: ['', Validators.required]
    };

    this.authForm = this.fb.group(this.isLogin ? baseControls : signupControls);
  }

  toggleAuthMode(event: Event) {
    event.preventDefault();
    this.isLogin = !this.isLogin;
    this.authError = '';
    this.initializeForm();
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.isLoading = true;
      this.authError = '';

      if (!this.isLogin && this.authForm.value.password !== this.authForm.value.passwordConfirmation) {
        this.authError = 'Passwords do not match';
        this.isLoading = false;
        return;
      }

      const credentials = {
        user: {
          email: this.authForm.value.email,
          password: this.authForm.value.password,
          ...(this.isLogin ? {} : { password_confirmation: this.authForm.value.passwordConfirmation })
        }
      };

      const endpoint = this.isLogin ? 'sign_in' : 'sign_up';
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      console.log('Making auth request to:', `${environment.apiUrl}/users/${endpoint}`);
      console.log('With credentials:', JSON.stringify(credentials));
      console.log('And headers:', headers);

      this.http.post<AuthResponse>(
        `${environment.apiUrl}/users/${endpoint}`,
        credentials,
        {
          headers,
          withCredentials: true
        }
      ).subscribe({
        next: (response) => {
          if (response.data && response.data.id) {
            const userData = {
              ...response.data,
              token: response.token
            };
            localStorage.setItem('user', JSON.stringify(userData));
            this.messageService.resetAuthRequired();
            this.showModal = false;
            this.authError = '';
            this.isLoading = false;
          } else {
            this.authError = 'Invalid response from server';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Auth failed:', error);
          this.isLoading = false;
          if (error.error?.errors) {
            this.authError = error.error.errors.join(', ');
          } else {
            this.authError = error.error?.error || 'Authentication failed';
          }
        }
      });
    }
  }
} 