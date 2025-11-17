import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

// PrimeNG Imports
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    ButtonModule,
    MenuModule,
    BadgeModule,
    TooltipModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser$;
  cartItemCount = this.cartService.itemCount;

  userMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.updateUserMenu();

    // Subscribe to auth changes to update menu
    this.authService.currentUser$.subscribe(() => {
      this.updateUserMenu();
    });
  }

  private updateUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'My Orders',
        icon: 'pi pi-shopping-bag',
        command: () => this.router.navigate(['/orders'])
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
