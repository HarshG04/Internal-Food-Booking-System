import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('fc_user');
    const token = localStorage.getItem('fc_token');
    if (stored && token) {
      const user: User = JSON.parse(stored);
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
    }
  }

  // POST /api/auth/login
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, request)
      .pipe(
        tap((res) => {
          this.currentUser.set(res.user);
          this.isLoggedIn.set(true);
          localStorage.setItem('fc_user', JSON.stringify(res.user));
          localStorage.setItem('fc_token', res.token);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('fc_token');
  }

  logout(): void {
    this.clearSession();
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem('fc_user');
    localStorage.removeItem('fc_token');
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  getUserId(): number | null {
    return this.currentUser()?.employeeId ?? null;
  }
}
