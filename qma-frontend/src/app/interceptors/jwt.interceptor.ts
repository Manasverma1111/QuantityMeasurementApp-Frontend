// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { catchError, throwError } from 'rxjs';
// import { AuthService } from '../services/auth.service';
// import { Router } from '@angular/router';

// export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const router      = inject(Router);

//   const token = authService.getToken();

//   // Attach Bearer token to every request EXCEPT auth endpoints themselves
//   const isAuthEndpoint = req.url.includes('/api/auth/');
//   const authReq = (token && !isAuthEndpoint)
//     ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
//     : req;

//   return next(authReq).pipe(
//     catchError((err: HttpErrorResponse) => {
//       if (err.status === 401) {
//         // No refresh token in your AuthResponse — just log out on 401
//         authService.logout();
//         router.navigate(['/auth/login']);
//       }
//       return throwError(() => err);
//     })
//   );
// };

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  const isAuthEndpoint = req.url.includes('/api/auth');

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {

      // 🔥 ONLY logout if it's truly auth-related
      const isAuthError =
        err.status === 401 &&
        req.url.includes('/api/auth');   // only auth endpoints

      if (isAuthError) {
        authService.logout();
        router.navigate(['/auth/login']);
      } else {
        console.warn('Non-auth error, not logging out:', err.message);
      }

      return throwError(() => err);
    })
  );
};