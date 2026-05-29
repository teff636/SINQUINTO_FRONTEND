import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Notificacion } from './auth.service';
import { NotificationUiService } from './notification-ui.service';

@Injectable({ providedIn: 'root' })
export class VendorNavigationService {

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly notifService: NotificationUiService
  ) {}

  irInicio(): void { this.router.navigate(['/vendedor']); }
  irMisServicios(): void { this.router.navigate(['/mis-servicios']); }
  irSolicitudes(): void { this.router.navigate(['/solicitudes-vendedor']); }
  irHistorial(): void { this.router.navigate(['/historial-vendedor']); }
  irPerfil(): void { this.router.navigate(['/perfil-vendedor']); }

  marcarTodasLeidas(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.marcarTodas(usuario.userId);
  }

  manejarNotificacion(n: Notificacion, cerrarPanel: () => void): void {
    this.notifService.marcarLeida(n, () => {
      if (n.type === 'APPOINTMENT_REQUESTED') {
        cerrarPanel();
        this.router.navigate(['/solicitudes-vendedor']);
      }
    });
  }
}
