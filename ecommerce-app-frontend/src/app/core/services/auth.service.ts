import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal for reactive UI
  public isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.authApi}/auth/register`,
      request
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Login user
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.authApi}/auth/login`,
      request
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/products']);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(roleName) ?? false;
  }

  /**
   * Check if current user is an Admin
   */
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  /**
   * Check if current user is a Manager
   */
  isManager(): boolean {
    return this.hasRole('Manager');
  }

  /**
   * Check if current user is a Customer
   */
  isCustomer(): boolean {
    return this.hasRole('Customer');
  }

  /**
   * Get user roles
   */
  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles ?? [];
  }

  /**
   * Get default route based on user role
   */
  getDefaultRoute(): string {
    if (this.isAdmin() || this.isManager()) {
      return '/admin/dashboard';
    }
    return '/products';
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    // Store token
    localStorage.setItem(this.TOKEN_KEY, response.token);

    // Store user info with roles
    const user: User = {
      userId: response.userId,
      username: response.username,
      email: response.email,
      roles: response.roles || [] // Store roles from response
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Update observables
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
  }

  /**
   * Check if token exists
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
