import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class Login {
  loginRequest: LoginRequest = {
    usernameOrEmail: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  returnUrl?: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get return url from route parameters (if user was redirected to login)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
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

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
