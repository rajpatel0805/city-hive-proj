import { Routes } from '@angular/router';
import { SmsMessengerComponent } from './sms-messenger/sms-messenger.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'messages' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'messages', component: SmsMessengerComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'messages' }
];
