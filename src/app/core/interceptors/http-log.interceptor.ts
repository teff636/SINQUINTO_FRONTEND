import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const httpLogInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const start = Date.now();

  if (req.url.includes('/api/logs')) {
    return next(req);
  }

  logger.api(`→ ${req.method} ${req.url}`);

  return next(req).pipe(
    tap(() => {
      const ms = Date.now() - start;
      logger.httpLog(`✓ ${req.method} ${req.url} (${ms}ms)`);
    }),
    catchError(err => {
      logger.httpError(
        `✗ ${req.method} ${req.url} — ${err.status} ${err.statusText}`,
        JSON.stringify(err.error)
      );
      return throwError(() => err);
    })
  );
};
