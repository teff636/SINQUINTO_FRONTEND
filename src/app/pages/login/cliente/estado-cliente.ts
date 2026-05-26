import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
  imports: [CommonModule],
  templateUrl: './estado-cliente.html',
  styleUrls: ['./estado-cliente.css']
})
export class EstadoClienteComponent implements OnInit {
  iniciales: string = 'CL';
  cargando: boolean = true;
  filtroActivo: FiltroEstado = 'TODAS';
  solicitudes: SolicitudCliente[] = [];

  pendientesResena: number = 0;
  notifAbierta: boolean = false;
  itemsNotif: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarIniciales();
    this.cargarSolicitudes();
    this.cargarNotificaciones();
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
    this.authService.obtenerSolicitudesCliente(usuario.userId).subscribe({
      next: (data) => { this.solicitudes = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  get solicitudesFiltradas(): SolicitudCliente[] {
    const active = this.solicitudes.filter(s => s.status !== 'COMPLETED');
    if (this.filtroActivo === 'TODAS') return active;
    return active.filter(s => s.status === this.filtroActivo);
  }

  get totalSolicitudes(): number { return this.solicitudes.length; }
  get pendientes(): number { return this.solicitudes.filter(s => s.status === 'PENDING').length; }
  get aceptadas(): number { return this.solicitudes.filter(s => s.status === 'ACCEPTED').length; }
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

  irInicio(): void { this.router.navigate(['/cliente']); }
  volverCliente(): void { this.router.navigate(['/cliente']); }
  irGuardados(): void { this.router.navigate(['/guardados-cliente']); }
  irEstado(): void { this.router.navigate(['/estado-cliente']); }
  irHistorial(): void { this.router.navigate(['/historial-cliente']); }
  irPerfil(): void { this.router.navigate(['/perfil-cliente']); }
  verSolicitud(solicitud: SolicitudCliente): void { console.log('Solicitud:', solicitud); }

  private cargarNotificaciones(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;
    this.authService.cargarNotificacionesCliente(usuario.userId).subscribe({
      next: (items: any[]) => {
        this.itemsNotif = items;
        this.pendientesResena = items.length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  marcarLeida(notif: any): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;
    this.authService.marcarNotificacionLeida(usuario.userId, notif.key);
    this.itemsNotif = this.itemsNotif.filter(n => n.key !== notif.key);
    this.pendientesResena = this.itemsNotif.length;
    this.cdr.detectChanges();
  }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
  irAResena(): void { this.notifAbierta = false; this.router.navigate(['/historial-cliente']); }
}
