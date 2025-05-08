import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly isLoggedIn$: Observable<boolean>;
  showConfirmModal = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.authState$;
  }

  showLogoutConfirmation() {
    this.showConfirmModal = true;
  }

  hideLogoutConfirmation() {
    this.showConfirmModal = false;
  }

  handleLogout() {
    this.authService.logout().subscribe(() => {
      this.hideLogoutConfirmation();
      this.router.navigate(['/login']);
    });
  }
}
