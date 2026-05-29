import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Notificacion } from './auth.service';
import { NotificationUiService } from './notification-ui.service';

@Injectable({ providedIn: 'root' })
export class ClientNavigationService {

  constructor(
    private readonly router: Router,
    private readonly notifService: NotificationUiService
  ) {}

  navegarSegunNotificacion(type: Notificacion['type'], cerrarPanel: () => void): void {
    if (type === 'APPOINTMENT_ACCEPTED' || type === 'APPOINTMENT_REJECTED') {
      cerrarPanel();
      this.router.navigate(['/estado-cliente']);
    } else if (type === 'APPOINTMENT_COMPLETED') {
      cerrarPanel();
      this.router.navigate(['/historial-cliente']);
    }
  }

  manejarNotificacion(n: Notificacion, cerrarPanel: () => void): void {
    this.notifService.marcarLeida(n, () => this.navegarSegunNotificacion(n.type, cerrarPanel));
  }
}
