import { Component, NgZone, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit {

  usuario: string = '';
  password: string = '';
  mensaje: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    this.tryInitGoogleButton('gBtnLoginOverlay');
  }

  irRegistro() {
    this.router.navigate(['/register-usuario']);
  }

  iniciarSesion() {
    const data = {
      email: this.usuario,
      password: this.password
    };

    this.authService.login(data).subscribe({
      next: (res) => {
        this.authService.guardarSesion(res);
        if (res.role === 'SALESPERSON') {
          this.router.navigate(['/vendedor']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: () => {
        this.mensaje = 'Correo o contraseña incorrectos';
      }
    });
  }

  private tryInitGoogleButton(elementId: string, attempts = 0) {
    if (typeof (window as any).google !== 'undefined') {
      this.setupGoogleButton(elementId);
    } else if (attempts < 50) {
      setTimeout(() => this.tryInitGoogleButton(elementId, attempts + 1), 100);
    } else {
      console.warn('[ServiClick] Google Identity Services no cargó en 5 segundos.');
    }
  }

  private setupGoogleButton(elementId: string) {
    try {
      console.log('[ServiClick] Google Client ID usado:', environment.googleClientId);
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            this.procesarCredencialGoogle(response.credential);
          });
        }
      });

      const container = document.getElementById(elementId);
      if (container) {
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: 600
        });
      }
    } catch (e) {
      console.error('[ServiClick] Error al inicializar Google Sign-In:', e);
    }
  }

  private procesarCredencialGoogle(credential: string) {
    this.authService.loginConGoogle(credential).subscribe({
      next: (httpRes) => {
        if (httpRes.status === 200) {
          const res = httpRes.body;
          this.authService.guardarSesion(res);
          if (res.role === 'SALESPERSON') {
            this.router.navigate(['/vendedor']);
          } else {
            this.router.navigate(['/cliente']);
          }
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
      error: () => {
        this.mensaje = 'Error al iniciar sesión con Google';
      }
    });
  }
}
