import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { VendorQuickPanelComponent } from '../../../shared/vendor-quick-panel/vendor-quick-panel';

export interface Solicitud {
  appointmentId: number;
  serviceOfferId: number;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  date: string;
  price: number;
  status: string;
}

@Component({
  selector: 'app-solicitudes-vendedor',
  standalone: true,
  imports: [CommonModule, AppTopbarComponent, VendorQuickPanelComponent],
  templateUrl: './solicitudes-vendedor.html',
  styleUrls: ['./solicitudes-vendedor.css']
})
export class SolicitudesVendedorComponent implements OnInit, OnDestroy {

  iniciales: string = '';
  solicitudes: Solicitud[] = [];
  todasSolicitudes: Solicitud[] = [];
  cargando: boolean = true;

  notifAbierta: boolean = false;

  get notifCount(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationUiService,
    private readonly vendorNav: VendorNavigationService
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) { this.router.navigate(['/login']); return; }
    this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'US';
    this.cargarSolicitudes(usuario.userId);
    this.notifService.iniciarPolling(usuario.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
  }

  get pendientes(): number { return this.todasSolicitudes.filter(s => s.status === 'PENDING').length; }
  get aceptadas(): number { return this.todasSolicitudes.filter(s => s.status === 'ACCEPTED').length; }
  get rechazadas(): number { return this.todasSolicitudes.filter(s => s.status === 'REJECTED').length; }

  cargarSolicitudes(sellerId: number) {
    this.authService.obtenerSolicitudesVendedor(sellerId).subscribe({
      next: (data) => {
        this.todasSolicitudes = data;
        this.solicitudes = data.filter((s: Solicitud) => s.status === 'PENDING' || s.status === 'ACCEPTED');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aceptar(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'ACCEPTED').subscribe({
      next: () => { s.status = 'ACCEPTED'; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  rechazar(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'REJECTED').subscribe({
      next: () => { s.status = 'REJECTED'; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  marcarPendiente(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'PENDING').subscribe({
      next: () => { s.status = 'PENDING'; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  finalizar(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'COMPLETED').subscribe({
      next: () => { s.status = 'COMPLETED'; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  estadoTexto(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada', COMPLETED: 'Completada'
    };
    return map[status] ?? status;
  }

  inicialCliente(nombre: string): string {
    return (nombre || 'CL').substring(0, 2).toUpperCase();
  }

  esFechaHabilitable(dateStr: string): boolean {
    if (!dateStr) return false;
    const fechaServicio = new Date(dateStr);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaServicio.setHours(0, 0, 0, 0);
    return fechaServicio <= hoy;
  }

  manejarNotificacion(n: Notificacion): void {
    this.vendorNav.manejarNotificacion(n, () => { this.notifAbierta = false; });
  }

  marcarTodasLeidas(): void { this.vendorNav.marcarTodasLeidas(); }

  irInicio() { this.vendorNav.irInicio(); }
  irServicios() { this.vendorNav.irMisServicios(); }
  irMisServicios() { this.vendorNav.irMisServicios(); }
  irSolicitudes() { this.vendorNav.irSolicitudes(); }
  irHistorial() { this.vendorNav.irHistorial(); }
  irPerfil() { this.vendorNav.irPerfil(); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

