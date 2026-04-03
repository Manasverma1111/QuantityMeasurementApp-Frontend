import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, SignupRequest, User, JwtPayload } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'https://quantitymeasurementapp-v01.onrender.com/api/auth';
  private readonly SPRING_URL = 'https://quantitymeasurementapp-v01.onrender.com';

  // private readonly API_URL    = 'http://localhost:8080/api/auth';
  // private readonly SPRING_URL = 'http://localhost:8080';         // base for OAuth2 redirect

  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  private readonly JSON_HEADERS = new HttpHeaders({ 'Content-Type': 'application/json' });

  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());

  // ── Local Login ───────────────────────────────────────────────────────────
  // POST /api/auth/login
  // Body  → LoginRequest:  { "email": "...", "password": "..." }
  // Reply → AuthResponse:  { "token": "...", "email": "...", "name": "..." }
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials, { headers: this.JSON_HEADERS })
      .pipe(
        tap((res) => this.handleAuthSuccess(res, 'local')),
        catchError((err) => this.handleError(err)),
      );
  }

  // ── Signup ────────────────────────────────────────────────────────────────
  // POST /api/auth/register
  // Body  → RegisterRequest: { "name": "...", "email": "...", "password": "..." }
  // Reply → AuthResponse:    { "token": "...", "email": "...", "name": "..." }
  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, data, { headers: this.JSON_HEADERS })
      .pipe(
        tap((res) => this.handleAuthSuccess(res, 'local')),
        catchError((err) => this.handleError(err)),
      );
  }

  // ── Google OAuth2 — Spring Boot redirect flow ─────────────────────────────
  //
  // HOW THIS WORKS:
  //   1. Angular redirects the browser to Spring Boot's OAuth2 endpoint
  //   2. Spring Boot → Google consent screen → user approves
  //   3. Spring's successHandler runs: generates JWT, writes JSON { "token": "..." }
  //   4. Browser lands on the callback page with the token in the URL or body
  //
  // Your SecurityConfig.successHandler writes:
  //   response.getWriter().write("{\"token\":\"" + token + "\"}");
  //
  // ⚠️  Problem: this writes raw JSON to the browser window — Angular can't read it
  //     automatically. You need the successHandler to REDIRECT to Angular with the
  //     token in the URL instead. See the note at the bottom of this file.
  //
  // For now, Angular simply triggers the redirect. The token is picked up by
  // the OAuthCallbackComponent (see app.routes.ts).
  loginWithGoogle(): void {
    // Full page redirect — Spring Boot handles the entire OAuth2 flow
    window.location.href = `${this.SPRING_URL}/oauth2/authorization/google`;
  }

  // Called by OAuthCallbackComponent after Spring redirects back with ?token=...
  handleGoogleCallback(token: string, email: string, name: string): void {
    const fakeResponse: AuthResponse = { token, email, name };
    this.handleAuthSuccess(fakeResponse, 'google');
    this.router.navigate(['/dashboard']);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedIn$.next(false);
    this.router.navigate(['/auth/login']);
  }

  // ── JWT Helpers ───────────────────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  decodeToken(token: string): JwtPayload {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  }

  // ── Private ───────────────────────────────────────────────────────────────
  private handleAuthSuccess(res: AuthResponse, provider: 'local' | 'google'): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);

    const user: User = { email: res.email, name: res.name, provider };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isLoggedIn$.next(true);
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Reads Spring Boot error body: { timestamp, status, error, message, path }
  private handleError(err: any): Observable<never> {
    const message =
      err?.error?.message || err?.error?.error || err?.message || 'An unexpected error occurred';
    return throwError(() => ({ ...err, userMessage: message }));
  }
}
