import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import {
  AuthSession,
  LoginRequest,
  LoginResponse,
} from '../models/auth.models';

const AUTH_STORAGE_KEY = 'bahia_auth_session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private session: AuthSession | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.loadSession();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    this.session = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.session?.accessToken ?? null;
  }

  getUser() {
    return this.session?.user ?? null;
  }

  getClientId(): string {
    const clientId = this.session?.user.clientId;
    return clientId != null ? String(clientId) : '';
  }

  getClientName(): string {
    return this.session?.user.clientName?.trim() ?? '';
  }

  getUserEmail(): string {
    return this.session?.user.email ?? '';
  }

  private setSession(response: LoginResponse): void {
    this.session = {
      accessToken: response.accessToken,
      user: response.user,
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.session));
    }
  }

  private loadSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;

    try {
      this.session = JSON.parse(stored) as AuthSession;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      this.session = null;
    }
  }
}
