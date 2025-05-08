import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from '../../services/message.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  template: `
    <header class="app-header" *ngIf="isLoggedIn">
      <div class="header-content">
        <h1>City Hive</h1>
        <button class="logout-button" (click)="showLogoutConfirmation()">
          <span>Logout</span>
        </button>
      </div>
    </header>

    <app-confirmation-modal
      [show]="showConfirmModal"
      title="Confirm Logout"
      message="Are you sure you want to log out?"
      confirmText="Yes, Log Me Out"
      cancelText="No, Stay Logged In"
      (confirm)="handleLogout()"
      (cancel)="hideLogoutConfirmation()"
    ></app-confirmation-modal>
  `,
  styles: [`
    .app-header {
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .logout-button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .logout-button:hover {
      background: #c0392b;
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  showConfirmModal = false;

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.messageService.getAuthStateChanged().subscribe(authenticated => {
      this.isLoggedIn = authenticated;
    });

    // Initial check
    this.isLoggedIn = !!localStorage.getItem('user');
  }

  showLogoutConfirmation() {
    this.showConfirmModal = true;
  }

  hideLogoutConfirmation() {
    this.showConfirmModal = false;
  }

  handleLogout() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.delete(`${environment.apiUrl}/users/sign_out`, {
      headers,
      withCredentials: true
    }).subscribe({
      next: () => {
        localStorage.removeItem('user');
        this.messageService.requireAuth();
        this.hideLogoutConfirmation();
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
} 