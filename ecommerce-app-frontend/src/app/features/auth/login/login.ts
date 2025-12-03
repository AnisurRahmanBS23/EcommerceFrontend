import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginRequest: LoginRequest = {
    usernameOrEmail: '',
    password: ''
  };

  loading = false;
  googleLoading = false;
  errorMessage = '';
  returnUrl?: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Get return url from route parameters (if user was redirected to login)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeGoogleSignIn();
    }
  }

  private initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '306628083972-mmnb0emv57peap4tuhoaukj61mhjucu9.apps.googleusercontent.com',
        callback: this.handleGoogleSignIn.bind(this)
      });
    }
  }

  onLogin(): void {
    if (!this.loginRequest.usernameOrEmail || !this.loginRequest.password) {
      this.errorMessage = 'Please enter username/email and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Login successful', response);

        // Use returnUrl if exists, otherwise redirect based on user role
        const redirectTo = this.returnUrl || this.authService.getDefaultRoute();
        this.router.navigate([redirectTo]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  signInWithGoogle(): void {
    this.googleLoading = true;
    this.errorMessage = '';

    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    } else {
      this.googleLoading = false;
      this.errorMessage = 'Google Sign-In is not available. Please try again later.';
    }
  }

  private handleGoogleSignIn(response: any): void {
    if (response.credential) {
      // Send the ID token to backend
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: (authResponse) => {
          this.googleLoading = false;
          console.log('Google login successful', authResponse);

          // Use returnUrl if exists, otherwise redirect based on user role
          const redirectTo = this.returnUrl || this.authService.getDefaultRoute();
          this.router.navigate([redirectTo]);
        },
        error: (error) => {
          this.googleLoading = false;
          this.errorMessage = error.message || 'Google login failed. Please try again.';
          console.error('Google login error:', error);
        }
      });
    } else {
      this.googleLoading = false;
      this.errorMessage = 'Google sign-in was cancelled or failed.';
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
