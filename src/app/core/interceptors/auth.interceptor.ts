import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  const accessToken = authService.getAccessToken();
  const isAuthRoute =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/signup') ||
    req.url.includes('/auth/refresh');

  // Skip attaching token for auth routes
  if (isAuthRoute) {
    return next(req);
  }

  const authReq = accessToken
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't retry on refresh request failure to avoid infinite loop
      if (error.status === 401 && !isAuthRoute) {
        return from(authService.refreshToken()).pipe(
          switchMap((tokens) => {
            authService.setTokens(tokens.accessToken, tokens.refreshToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            authService.logout();
            // Redirect to login immediately
            window.location.href = '/login';
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
