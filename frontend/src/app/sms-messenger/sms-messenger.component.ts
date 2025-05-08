import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, Message } from '../services/message.service';

@Component({
  selector: 'app-sms-messenger',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sms-messenger.component.html',
  styleUrls: ['./sms-messenger.component.scss']
})
export class SmsMessengerComponent implements OnInit {
  messageForm: FormGroup;
  messages: Message[] = [];
  private retryCount = 0;
  private maxRetries = 3;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.messageForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      text: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  formatDisplayPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) return phoneNumber;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/[^\d]/g, '');
    if (digits !== input.value) {
      input.value = digits;
    }
    this.messageForm.get('phone')?.setValue(digits);
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
        
        // Retry for transient errors (avoid looping on auth redirects)
        if (error.status !== 401 && this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Retrying message load (attempt ${this.retryCount})...`);
          setTimeout(() => this.loadMessages(), 1000); // Wait 1 second before retrying
        }
      }
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const phone = this.messageForm.get('phone')?.value || '';
    const text = this.messageForm.get('text')?.value || '';

    this.messageService.sendMessage({ phone, text }).subscribe({
      next: (response) => {
        console.log('Message sent response:', response);
        this.loadMessages();
        this.clearMessage();
      },
      error: (err) => console.error('Send failed', err)
    });
  }

  getCharacterCount(): number {
    return this.messageForm.get('text')?.value?.length || 0;
  }

  clearMessage(): void {
    this.messageForm.reset();
  }
}
