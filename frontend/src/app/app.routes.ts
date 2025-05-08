import { Routes } from '@angular/router';
import { SmsMessengerComponent } from './sms-messenger/sms-messenger.component';

export const routes: Routes = [
  { path: '', component: SmsMessengerComponent },
  { path: '**', redirectTo: '' }
];
