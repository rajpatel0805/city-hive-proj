import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/messages`; // Using environment configuration

  private authRequired = new BehaviorSubject<boolean>(false);
  private authStateChanged = new BehaviorSubject<boolean>(false);
  private clearMessages = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {
    // Show login modal by default if user is not authenticated
    if (!localStorage.getItem('user')) {
      this.requireAuth();
    }
  }

  getAuthRequired(): Observable<boolean> {
    return this.authRequired.asObservable();
  }

  getAuthStateChanged(): Observable<boolean> {
    return this.authStateChanged.asObservable();
  }

  getClearMessages(): Observable<void> {
    return this.clearMessages.asObservable();
  }

  requireAuth() {
    this.authRequired.next(true);
    this.authStateChanged.next(false);
    this.clearMessages.next();
  }

  private getAuthHeaders(): HttpHeaders {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.token) {
      this.requireAuth();
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${user.token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.requireAuth();
      localStorage.removeItem('user'); // Clear invalid user data
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

  resetAuthRequired() {
    // Ensure we have a valid token before resetting auth state
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      this.authRequired.next(false);
      // Emit auth state change immediately
      this.authStateChanged.next(true);
    } else {
      this.requireAuth();
    }
  }
}
