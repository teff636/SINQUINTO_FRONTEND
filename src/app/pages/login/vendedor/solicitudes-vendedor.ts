import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
  imports: [CommonModule],
  templateUrl: './solicitudes-vendedor.html',
  styleUrls: ['./solicitudes-vendedor.css']
})
export class SolicitudesVendedorComponent implements OnInit {

  iniciales: string = '';
  solicitudes: Solicitud[] = [];
  todasSolicitudes: Solicitud[] = [];
  cargando: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) { this.router.navigate(['/login']); return; }
    this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'US';
    this.cargarSolicitudes(usuario.userId);
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
      error: (err) => {
        console.log('Error cargando solicitudes:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aceptar(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'ACCEPTED').subscribe({
      next: () => { s.status = 'ACCEPTED'; this.cdr.detectChanges(); },
      error: (err) => console.log('Error al aceptar:', err)
    });
  }

  rechazar(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'REJECTED').subscribe({
      next: () => { s.status = 'REJECTED'; this.cdr.detectChanges(); },
      error: (err) => console.log('Error al rechazar:', err)
    });
  }

  marcarPendiente(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'PENDING').subscribe({
      next: () => { s.status = 'PENDING'; this.cdr.detectChanges(); },
      error: (err) => console.log('Error al marcar pendiente:', err)
    });
  }

  finalizar(s: Solicitud) {
    this.authService.actualizarEstadoSolicitud(s.appointmentId, 'COMPLETED').subscribe({
      next: () => { s.status = 'COMPLETED'; this.cdr.detectChanges(); },
      error: (err) => console.log('Error al finalizar:', err)
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

  irInicio() { this.router.navigate(['/vendedor']); }
  irServicios() { this.router.navigate(['/mis-servicios']); }
  irMisServicios() { this.router.navigate(['/mis-servicios']); }
  irSolicitudes() { this.router.navigate(['/solicitudes-vendedor']); }
  irHistorial() { this.router.navigate(['/historial-vendedor']); }
  irPerfil() { this.router.navigate(['/perfil-vendedor']); }
}
