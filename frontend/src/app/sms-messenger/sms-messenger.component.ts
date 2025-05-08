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
  newMessage: { phone: string, text: string } = { phone: '', text: '' };
  messages: Message[] = [];
  isPhoneValid = false;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  formatPhoneNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }

  unformatPhoneNumber(value: string): string {
    return value.replace(/\D/g, '');
  }

  formatDisplayPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) return phoneNumber;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    const unformattedValue = this.unformatPhoneNumber(input.value);
    const formattedValue = this.formatPhoneNumber(unformattedValue);
    
    // Store the unformatted value in the model
    this.newMessage.phone = unformattedValue;
    
    // Update the input with the formatted value
    input.value = formattedValue;
    
    // Calculate new cursor position
    const formattedLength = formattedValue.length;
    const unformattedLength = unformattedValue.length;
    
    // Adjust cursor position based on added formatting characters
    if (cursorPosition !== null) {
      let newPosition = cursorPosition;
      if (unformattedLength <= 3) {
        if (cursorPosition > 3) newPosition += 1;
      } else if (unformattedLength <= 6) {
        if (cursorPosition > 3) newPosition += 2;
        if (cursorPosition > 6) newPosition += 1;
      } else {
        if (cursorPosition > 3) newPosition += 2;
        if (cursorPosition > 6) newPosition += 1;
        if (cursorPosition > 10) newPosition += 1;
      }
      input.setSelectionRange(Math.min(newPosition, formattedLength), Math.min(newPosition, formattedLength));
    }

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
        console.log('Loaded messages:', this.messages);
      },
      error: (error) => {
        console.error('Failed to load messages:', error);
        this.messages = [];
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

  clearMessage(): void {
    this.newMessage = { phone: '', text: '' };
    this.isPhoneValid = false;
  }
}
