import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Message {
  id?: number;
  phone_number: string;
  body: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/api/v1/messages`; // Using environment configuration
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.handleUnauthorized();
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.authService.handleUnauthorized();
    }
    return throwError(() => error);
  }

  sendMessage(message: { phone: string, text: string }): Observable<Message> {
    const payload = {
      phone: message.phone,
      text: message.text
    };
    
    return this.http.post<Message>(this.apiUrl, payload, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteMessage(message: Message): Observable<Message> {
    console.warn(this.apiUrl + "/" + message.id)
    return this.http.delete<Message>(this.apiUrl + "/" + message.id, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  fetchMessages(): Observable<Message[]> {
    try {
      return this.http.get<Message[]>(this.apiUrl, {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }).pipe(
        map(messages => messages.reverse()),
        catchError(this.handleError.bind(this))
      );
    } catch (error) {
      return throwError(() => error);
    }
  }
}
