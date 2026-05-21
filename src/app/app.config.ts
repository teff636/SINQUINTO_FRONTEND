import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpLogInterceptor } from './core/interceptors/http-log.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(withInterceptors([authInterceptor, httpLogInterceptor])),
    provideAnimations()
  ]
};
