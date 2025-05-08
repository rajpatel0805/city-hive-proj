import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, Message } from '../services/message.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sms-messenger',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './sms-messenger.component.html',
  styleUrls: ['./sms-messenger.component.scss']
})
export class SmsMessengerComponent implements OnInit {
  newMessage: { phone: string, text: string, status: string } = { phone: '', text: '', status: '' };
  messages: Message[] = [];
  isPhoneValid = false;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadMessages();
    
    // Subscribe to authentication state changes
    this.messageService.getAuthStateChanged().subscribe(authenticated => {
      if (authenticated) {
        this.retryCount = 0; // Reset retry count on successful auth
        this.loadMessages();
      }
    });

    // Subscribe to clear messages event
    this.messageService.getClearMessages().subscribe(() => {
      this.messages = [];
      this.clearMessage();
    });
  }

  formatDisplayPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) return phoneNumber;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Only allow digits
    input.value = input.value.replace(/[^\d]/g, '');
    this.newMessage.phone = input.value;
    this.validatePhone();
  }

  validatePhone(): void {
    const phoneRegex = /^\d{10}$/;
    this.isPhoneValid = phoneRegex.test(this.newMessage.phone);
  }

  loadMessages(): void {
    this.messageService.fetchMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.retryCount = 0; // Reset retry count on successful load
        console.log('Loaded messages:', this.messages);
      },
      error: (error) => {
        console.error('Failed to load messages:', error);
        this.messages = [];
        
        // If we get a 401 and haven't exceeded retry limit, try again after a delay
        if (error.status === 401 && this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Retrying message load (attempt ${this.retryCount})...`);
          setTimeout(() => this.loadMessages(), 1000); // Wait 1 second before retrying
        }
      }
    });
  }

  sendMessage(): void {
    if (!this.isPhoneValid || !this.newMessage.text || this.newMessage.phone.length !== 10) return;

    this.messageService.sendMessage(this.newMessage).subscribe({
      next: (response) => {
        console.log('Message sent response:', response);
        this.loadMessages();
        this.clearMessage();
      },
      error: (err) => console.error('Send failed', err)
    });
  }

  getCharacterCount(): number {
    return this.newMessage.text?.length || 0;
  }

  getMessageStatus(): string {
    return this.newMessage.status || "";
  }


  clearMessage(): void {
    this.newMessage = { phone: '', text: '', status: '' };
    this.isPhoneValid = false;
  }
}
