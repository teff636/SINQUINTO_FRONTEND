import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { ClientNavigationService } from '../../../core/services/client-navigation.service';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { ClientQuickPanelComponent } from '../../../shared/client-quick-panel/client-quick-panel';

export interface SolicitudCliente {
  appointmentId: number;
  serviceOfferId: number;
  serviceTitle: string;
  sellerName: string;
  category: string;
  date: string;
  price: number;
  status: string;
}

type FiltroEstado = 'TODAS' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

@Component({
  selector: 'app-estado-cliente',
  standalone: true,
  imports: [CommonModule, AppTopbarComponent, ClientQuickPanelComponent],
  templateUrl: './estado-cliente.html',
  styleUrls: ['./estado-cliente.css']
})
export class EstadoClienteComponent implements OnInit, OnDestroy {
  iniciales: string = 'CL';
  cargando: boolean = true;
  filtroActivo: FiltroEstado = 'TODAS';
  solicitudes: SolicitudCliente[] = [];

  notifAbierta: boolean = false;

  get pendientesResena(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationUiService,
    private readonly clientNav: ClientNavigationService
  ) {}

  ngOnInit(): void {
    this.cargarIniciales();
    this.cargarSolicitudes();
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.iniciarPolling(usuario.userId ?? usuario.id ?? usuario.clientId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
  }

  cargarIniciales(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { this.iniciales = 'CL'; return; }
    try {
      const u = JSON.parse(raw);
      this.iniciales = (u?.email || '').substring(0, 2).toUpperCase() || 'CL';
    } catch { this.iniciales = 'CL'; }
  }

  cargarSolicitudes(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) { this.router.navigate(['/login']); return; }

    const userId: number = usuario.userId ?? usuario.id ?? usuario.clientId;

    if (!userId) {
      this.cargando = false;
      return;
    }

    this.authService.obtenerSolicitudesCliente(userId).subscribe({
      next: (data) => {
        this.solicitudes = (data || []).map((s: any) => ({
          ...s,
          status: (s.status || '').toUpperCase()
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get solicitudesFiltradas(): SolicitudCliente[] {
    const active = this.solicitudes.filter(s => s.status !== 'COMPLETED');
    if (this.filtroActivo === 'TODAS') return active;
    if (this.filtroActivo === 'ACCEPTED') return active.filter(s => s.status === 'ACCEPTED' || s.status === 'CONFIRMED');
    return active.filter(s => s.status === this.filtroActivo);
  }

  get totalSolicitudes(): number { return this.solicitudes.length; }
  get pendientes(): number { return this.solicitudes.filter(s => s.status === 'PENDING').length; }
  get aceptadas(): number { return this.solicitudes.filter(s => s.status === 'ACCEPTED' || s.status === 'CONFIRMED').length; }
  get finalizadas(): number { return this.solicitudes.filter(s => s.status === 'COMPLETED').length; }

  cambiarFiltro(filtro: FiltroEstado): void { this.filtroActivo = filtro; }

  estadoLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada',
      COMPLETED: 'Completada', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada'
    };
    return map[status] ?? status;
  }

  estadoDescripcion(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Esperando respuesta del vendedor',
      ACCEPTED: 'El vendedor aceptó tu solicitud. Prepárate para la cita.',
      REJECTED: 'El vendedor no pudo aceptar esta solicitud.',
      COMPLETED: 'Servicio finalizado'
    };
    return map[status] ?? '';
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
  verSolicitud(_solicitud: SolicitudCliente): void { this.router.navigate(['/estado-cliente']); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

