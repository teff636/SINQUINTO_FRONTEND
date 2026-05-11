import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  const esRutaPublica = req.url.includes('/api/auth/');

  if (token && !esRutaPublica) {
    const reqClon = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqClon);
  }

  return next(req);
};