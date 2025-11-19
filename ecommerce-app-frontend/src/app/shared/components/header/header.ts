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
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ToolbarModule,
    ButtonModule,
    MenuModule,
    BadgeModule,
    TooltipModule,
    SelectButtonModule,
    TagModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser$;
  cartItemCount = this.cartService.itemCount;

  userMenuItems: MenuItem[] = [];

  // Mode switching
  currentMode: 'admin' | 'customer' = 'customer';
  modeOptions = [
    { label: 'Customer View', value: 'customer', icon: 'pi pi-shopping-cart' },
    { label: 'Admin Panel', value: 'admin', icon: 'pi pi-cog' }
  ];

  ngOnInit(): void {
    this.updateUserMenu();
    this.detectInitialMode();

    // Subscribe to auth changes to update menu
    this.authService.currentUser$.subscribe(() => {
      this.updateUserMenu();
      this.detectInitialMode();
    });

    // Subscribe to route changes to update mode indicator
    this.router.events.subscribe(() => {
      this.detectInitialMode();
    });
  }

  /**
   * Detect initial mode based on current route
   */
  private detectInitialMode(): void {
    if (this.authService.isAdmin() || this.authService.isManager()) {
      const currentUrl = this.router.url;
      this.currentMode = currentUrl.startsWith('/admin') ? 'admin' : 'customer';
    }
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

  /**
   * Handle mode change
   */
  onModeChange(event: any): void {
    const newMode = event.value;

    if (newMode === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/products']);
    }
  }

  /**
   * Check if user can switch modes (admin or manager)
   */
  canSwitchMode(): boolean {
    return this.authService.isAdmin() || this.authService.isManager();
  }

  /**
   * Get mode badge label
   */
  getModeBadgeLabel(): string {
    return this.currentMode === 'admin' ? 'Admin Mode' : 'Customer View';
  }

  /**
   * Get mode badge severity
   */
  getModeBadgeSeverity(): 'success' | 'info' | 'warn' | 'danger' {
    return this.currentMode === 'admin' ? 'warn' : 'info';
  }
}
