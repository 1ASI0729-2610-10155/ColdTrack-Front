import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthSession } from './auth-session';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthSession).token();
  const isBackendRequest = request.url.startsWith(environment.apiBaseUrl);
  const isAuthenticationRequest = request.url.includes('/authentication/');

  if (!token || !isBackendRequest || isAuthenticationRequest) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
