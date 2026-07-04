import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession } from './auth-session';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSession);
  const token = session.token();
  const isBackendRequest = request.url.startsWith(environment.apiBaseUrl);
  const isAuthenticationRequest = request.url.includes('/authentication/');

  if (!token || !isBackendRequest || isAuthenticationRequest) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  })).pipe(catchError(error => {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      session.clear();
    }
    return throwError(() => error);
  }));
};
