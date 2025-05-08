import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { HeaderComponent } from './components/header/header.component';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginModalComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="content">
      <app-login-modal></app-login-modal>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .content {
      padding-top: 4rem; /* Add space for fixed header */
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    // The MessageService constructor will handle showing the login modal if needed
  }
}
