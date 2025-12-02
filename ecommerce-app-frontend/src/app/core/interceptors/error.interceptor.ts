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

            // Log detailed 401 error information for debugging
            console.group('🔴 401 Unauthorized Error Details');
            console.log('Request URL:', req.url);
            console.log('Request Method:', req.method);
            console.log('Backend Error Message:', error.error?.message || 'No message provided');
            console.log('Backend Error:', error.error);
            console.log('Status Text:', error.statusText);
            console.log('Headers Sent:', req.headers.keys());
            console.log('Has Authorization Header:', req.headers.has('Authorization'));
            console.groupEnd();

            // Only logout if the 401 is from an auth-critical endpoint
            // Don't logout for optional endpoints like cart sync

            // Cart endpoints should NOT trigger logout (even though URL contains /orders/)
            const isCartEndpoint = req.url.includes('/cart');

            // Critical endpoints that should trigger logout
            const isAuthCriticalEndpoint =
              req.url.includes('/auth/') ||
              (req.url.includes('/orders/') && !isCartEndpoint) ||  // Orders but NOT cart
              req.url.includes('/checkout');

            if (isAuthCriticalEndpoint) {
              console.error('❌ Authentication failed on critical endpoint:', req.url);
              authService.logout(); // This will redirect to /products
            } else {
              console.warn('⚠️ 401 Unauthorized on non-critical endpoint:', req.url, '- User remains logged in');
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
