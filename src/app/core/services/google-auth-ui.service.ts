import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleAuthUiService {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly ngZone: NgZone
  ) {}

  iniciarBoton(elementId: string, onError: () => void): void {
    this.tryInit(elementId, onError, 0);
  }

  private tryInit(elementId: string, onError: () => void, attempts: number): void {
    if (typeof (window as any).google !== 'undefined') {
      this.setupButton(elementId, onError);
    } else if (attempts < 50) {
      setTimeout(() => this.tryInit(elementId, onError, attempts + 1), 100);
    } else {
      onError();
    }
  }

  private setupButton(elementId: string, onError: () => void): void {
    try {
      const g = (window as any).google;
      g.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => this.procesarCredencial(response.credential, onError));
        }
      });
      const container = document.getElementById(elementId);
      if (container) {
        g.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 600 });
      }
    } catch {
      onError();
    }
  }

  procesarCredencial(credential: string, onError: () => void): void {
    this.authService.loginConGoogle(credential).subscribe({
      next: (httpRes) => {
        if (httpRes.status === 200) {
          const res = httpRes.body;
          this.authService.guardarSesion(res);
          this.router.navigate([res.role === 'SALESPERSON' ? '/vendedor' : '/cliente']);
        } else if (httpRes.status === 202) {
          const pending = httpRes.body;
          this.authService.guardarGooglePendiente({
            idToken: credential,
            email: pending.email,
            name: pending.name,
            lastName: pending.lastName
          });
          this.router.navigate(['/select-role']);
        }
      },
      error: onError
    });
  }
}
