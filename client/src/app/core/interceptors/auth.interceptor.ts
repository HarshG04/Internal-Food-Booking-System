import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const credentialsInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const withCredentials = req.clone({ withCredentials: true });

  return next(withCredentials).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
