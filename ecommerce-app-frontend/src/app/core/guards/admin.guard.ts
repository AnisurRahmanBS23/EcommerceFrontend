import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect admin-only routes
 * Checks if user has 'Admin' role
 */
export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Not logged in, redirect to login
    router.navigate(['/auth/login']);
    return false;
  }

  if (!authService.isAdmin()) {
    // Logged in but not admin, redirect to products
    console.warn('Access denied: Admin role required');
    router.navigate(['/products']);
    return false;
  }

  // User is admin
  return true;
};

/**
 * Guard to protect manager-only routes (includes admin)
 * Checks if user has 'Manager' or 'Admin' role
 */
export const managerGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!authService.isManager() && !authService.isAdmin()) {
    console.warn('Access denied: Manager or Admin role required');
    router.navigate(['/products']);
    return false;
  }

  return true;
};

/**
 * Generic role guard factory
 * Usage: roleGuard(['Admin', 'Manager'])
 */
export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const userRoles = authService.getUserRoles();
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      console.warn(`Access denied: One of these roles required: ${allowedRoles.join(', ')}`);
      router.navigate(['/products']);
      return false;
    }

    return true;
  };
};
