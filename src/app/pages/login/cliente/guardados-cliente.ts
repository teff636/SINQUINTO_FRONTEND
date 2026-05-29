import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { ClientNavigationService } from '../../../core/services/client-navigation.service';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { ClientQuickPanelComponent } from '../../../shared/client-quick-panel/client-quick-panel';

export interface ServicioGuardado {
  serviceOfferId: number;
  sellerId: number;
  photo: string;
  title: string;
  description: string;
  category: string;
  price: number;
  estimatedDuration: number;
  vendedor?: string;
}

@Component({
  selector: 'app-guardados-cliente',
  standalone: true,
  imports: [CommonModule, AppTopbarComponent, ClientQuickPanelComponent],
  templateUrl: './guardados-cliente.html',
  styleUrls: ['./guardados-cliente.css']
})
export class GuardadosClienteComponent implements OnInit, OnDestroy {
  iniciales: string = 'CL';
  guardados: ServicioGuardado[] = [];

  notifAbierta: boolean = false;

  get pendientesResena(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly notifService: NotificationUiService,
    private readonly clientNav: ClientNavigationService
  ) {}

  ngOnInit(): void {
    this.cargarIniciales();
    this.cargarGuardados();
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.iniciarPolling(usuario.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
  }

  cargarIniciales(): void {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      this.iniciales = 'CL';
      return;
    }

    try {
      const usuario = JSON.parse(usuarioGuardado);
      const email = usuario?.email || '';
      this.iniciales = email.substring(0, 2).toUpperCase() || 'CL';
    } catch {
      this.iniciales = 'CL';
    }
  }

  cargarGuardados(): void {
    const data = localStorage.getItem('servicios_guardados_cliente');

    if (!data) {
      this.guardados = [];
      return;
    }

    try {
      this.guardados = JSON.parse(data);
    } catch {
      this.guardados = [];
    }

    this.cdr.detectChanges();
  }

  quitarGuardado(servicio: ServicioGuardado): void {
    this.guardados = this.guardados.filter(
      item => item.serviceOfferId !== servicio.serviceOfferId
    );

    localStorage.setItem(
      'servicios_guardados_cliente',
      JSON.stringify(this.guardados)
    );

    this.cdr.detectChanges();
  }

  verServicio(servicio: ServicioGuardado): void {
    this.router.navigate(['/ver-servicio'], {
      state: { servicio }
    });
  }

  manejarNotificacion(n: Notificacion): void {
    this.clientNav.manejarNotificacion(n, () => { this.notifAbierta = false; });
  }

  marcarTodasLeidas(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.marcarTodas(usuario.userId);
  }

  irInicio(): void { this.router.navigate(['/cliente']); }
  volverCliente(): void { this.router.navigate(['/cliente']); }
  irGuardados(): void { this.router.navigate(['/guardados-cliente']); }
  irEstado(): void { this.router.navigate(['/estado-cliente']); }
  irHistorial(): void { this.router.navigate(['/historial-cliente']); }
  irPerfil(): void { this.router.navigate(['/perfil-cliente']); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

