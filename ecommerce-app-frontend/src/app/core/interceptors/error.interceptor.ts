import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad request';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            
            // Only logout if the 401 is from an auth-critical endpoint
            // Don't logout for optional endpoints like cart sync
            const isAuthCriticalEndpoint = 
              req.url.includes('/auth/') || 
              req.url.includes('/orders/') ||
              req.url.includes('/checkout');
            
            if (isAuthCriticalEndpoint) {
              console.error('Authentication failed on critical endpoint:', req.url);
              authService.logout(); // This will redirect to /products
            } else {
              console.warn('401 Unauthorized on non-critical endpoint:', req.url, '- User remains logged in');
            }
            break;
          case 403:
            errorMessage = 'Access forbidden';
            break;
          case 404:
            errorMessage = error.error?.message || 'Resource not found';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error Code: ${error.status}`;
        }
      }

      console.error('HTTP Error:', errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
