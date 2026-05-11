import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface Solicitud {
  appointmentId: number;
  userId: number;
  serviceOfferId: number;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
  const usuario = this.authService.getUsuarioLocal();
  if (usuario) {
    this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'US';
    this.cargarSolicitudes(usuario.userId);
  }
}

cargarSolicitudes(sellerId: number) {
  this.authService.getServiciosPorVendedor(sellerId).subscribe({
    next: (servicios: any[]) => {
      if (servicios.length === 0) {
        this.solicitudes = [];
        return;
      }
      const solicitudesTemp: Solicitud[] = [];
      let completados = 0;
      servicios.forEach((servicio) => {
        this.authService.getCitasPorServicio(servicio.serviceOfferId).subscribe({
          next: (citas: any[]) => {
            solicitudesTemp.push(...citas);
            completados++;
            if (completados === servicios.length) {
              this.solicitudes = solicitudesTemp;
            }
          },
          error: () => {
            completados++;
            if (completados === servicios.length) {
              this.solicitudes = solicitudesTemp;
            }
          }
        });
      });
    },
    error: (err) => console.log('Error:', err)
  });
}

  aceptar(s: Solicitud) {
    const data = { ...s, status: 'CONFIRMED' };
    this.authService.actualizarCita(s.appointmentId, data).subscribe({
      next: () => {
        s.status = 'CONFIRMED';
      },
      error: (err) => console.log('Error:', err)
    });
  }

  rechazar(s: Solicitud) {
    const data = { ...s, status: 'CANCELLED' };
    this.authService.actualizarCita(s.appointmentId, data).subscribe({
      next: () => {
        s.status = 'CANCELLED';
      },
      error: (err) => console.log('Error:', err)
    });
  }

  irInicio() {
    this.router.navigate(['/vendedor']);
  }

  irServicios() {
    this.router.navigate(['/mis-servicios']);
  }

  irPerfil() {
    this.router.navigate(['/perfil-vendedor']);
  }
}