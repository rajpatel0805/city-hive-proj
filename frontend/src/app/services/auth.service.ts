import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  status: {
    code: number;
    message: string;
  };
  data: {
    id: number;
    email: string;
    created_at: string;
  };
  errors?: string[];
  token: string;
}

export interface StoredUser {
  id: number;
  email: string;
  created_at: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'user';
  private authStateSubject = new BehaviorSubject<boolean>(this.hasStoredUser());
  readonly authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  isAuthenticated(): boolean {
    return this.authStateSubject.value;
  }

  getToken(): string | null {
    return this.getStoredUser()?.token || null;
  }

  login(email: string, password: string): Observable<void> {
    const credentials = {
      user: {
        email,
        password
      }
    };

    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/v1/users/sign_in`,
      credentials,
      {
        headers: this.getJsonHeaders(),
        withCredentials: true
      }
    ).pipe(
      map((response) => {
        this.storeUser(response);
        return undefined;
      })
    );
  }

  signUp(email: string, password: string, passwordConfirmation: string): Observable<void> {
    const credentials = {
      user: {
        email,
        password,
        password_confirmation: passwordConfirmation
      }
    };

    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/v1/users/sign_up`,
      credentials,
      {
        headers: this.getJsonHeaders(),
        withCredentials: true
      }
    ).pipe(
      map((response) => {
        this.storeUser(response);
        return undefined;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.delete(
      `${environment.apiUrl}/api/v1/users/sign_out`,
      {
        headers: this.getJsonHeaders(),
        withCredentials: true
      }
    ).pipe(
      map(() => undefined),
      catchError((error) => {
        console.error('Logout failed:', error);
        return of(undefined);
      }),
      tap(() => this.clearSession())
    );
  }

  handleUnauthorized(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
    this.authStateSubject.next(false);
  }

  private storeUser(response: AuthResponse): void {
    if (!response?.data?.id || !response?.token) {
      throw new Error('Invalid response from server');
    }

    const userData: StoredUser = {
      ...response.data,
      token: response.token
    };

    localStorage.setItem(this.storageKey, JSON.stringify(userData));
    this.authStateSubject.next(true);
  }

  private getStoredUser(): StoredUser | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }

  private hasStoredUser(): boolean {
    return !!this.getStoredUser()?.token;
  }

  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
}
