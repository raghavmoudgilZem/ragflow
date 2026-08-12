import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AUTH_CONSTANTS } from './auth.constants';

interface TransformResponse {
  success: boolean;
  data: unknown;
  timestamp: string;
  path: string;
}

function isTransformResponse(body: unknown): body is TransformResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    'data' in body
  );
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    map((event) => {
      if (event instanceof HttpResponse && isTransformResponse(event.body)) {
        return event.clone({ body: event.body.data });
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }),
  );
};
