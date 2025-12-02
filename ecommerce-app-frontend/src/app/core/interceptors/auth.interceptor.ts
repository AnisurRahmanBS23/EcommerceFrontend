import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Skip adding token for auth endpoints (login/register)
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (token && !isAuthEndpoint) {
    // Check if token is expired before sending
    const isExpired = authService.isTokenExpired();

    // Debug logging
    console.log('🔐 Auth Interceptor:', {
      url: req.url,
      hasToken: !!token,
      isExpired: isExpired,
      tokenPreview: token.substring(0, 20) + '...',
      willAddAuth: !isExpired
    });

    if (isExpired) {
      console.warn('⚠️ Token is expired! Request will fail with 401.');
      console.warn('Token should be refreshed or user should re-login.');
    }

    // Clone the request and add the authorization header
    const cleanToken = token.replace(/^"|"$/g, '').trim();
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });
    return next(clonedRequest);
  }

  // No token available
  if (!token && !isAuthEndpoint) {
    console.warn('⚠️ No token available for request:', req.url);
  }

  return next(req);
};
