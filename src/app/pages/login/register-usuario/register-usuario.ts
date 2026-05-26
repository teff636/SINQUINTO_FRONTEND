import { Component, NgZone, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-register-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register-usuario.html',
  styleUrls: ['./register-usuario.css']
})
export class RegisterUsuarioComponent implements AfterViewInit {

  @Output() cerrar = new EventEmitter<void>();
  mostrarExito: boolean = false;

  nombre = '';
  apellido = '';
  correo = '';
  password = '';
  telefono = '';
  mensaje = '';
  rol: string = 'CUSTOMER';

  constructor(
    private authService: AuthService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.tryInitGoogleButton('gBtnRegisterOverlay');
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
        this.mensaje = 'Error al continuar con Google';
      }
    });
  }

  registrar() {
    console.log('CLICK REGISTRAR FUNCIONA');

    if (!this.nombre || !this.apellido || !this.correo || !this.password || !this.telefono) {
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    const data = {
      name: this.nombre,
      lastName: this.apellido,
      email: this.correo,
      password: this.password,
      phoneNumber: this.telefono,
      role: this.rol
    };

    this.authService.register(data).subscribe({
      next: () => {
        console.log('REGISTRO EXITOSO');
        this.mostrarExito = true;
        setTimeout(() => {
          this.mostrarExito = false;
          this.cerrar.emit();
        }, 2000);
      },
      error: (err) => {
        console.log(err);
        if (err.status === 409) {
          this.mensaje = 'Este correo ya está registrado';
        } else {
          this.mensaje = 'Error al registrar, intenta de nuevo';
        }
      }
    });
  }

  volverLogin() {
    this.cerrar.emit();
  }
}
