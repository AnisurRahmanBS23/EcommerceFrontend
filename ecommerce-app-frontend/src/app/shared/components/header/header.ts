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
    const menuItems: MenuItem[] = [];

    // Add Admin Panel menu item if user is admin
    if (this.authService.isAdmin()) {
      menuItems.push({
        label: 'Admin Panel',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/admin/dashboard'])
      });
      menuItems.push({
        separator: true
      });
    }

    // Add My Orders for all authenticated users
    menuItems.push({
      label: 'My Orders',
      icon: 'pi pi-shopping-bag',
      command: () => this.router.navigate(['/orders'])
    });

    menuItems.push({
      separator: true
    });

    // Add Logout
    menuItems.push({
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    });

    this.userMenuItems = menuItems;
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
