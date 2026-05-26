import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface SolicitudCompletada {
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
  selector: 'app-historial-vendedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-vendedor.html',
  styleUrls: ['./historial-vendedor.css']
})
export class HistorialVendedorComponent implements OnInit {

  iniciales: string = '';
  historial: SolicitudCompletada[] = [];
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
    this.cargarHistorial(usuario.userId);
  }

  cargarHistorial(sellerId: number) {
    this.authService.obtenerSolicitudesVendedor(sellerId).subscribe({
      next: (data: any[]) => {
        this.historial = (data || []).filter((s: any) => s.status === 'COMPLETED');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historial = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  inicialCliente(nombre: string): string {
    return (nombre || 'CL').substring(0, 2).toUpperCase();
  }

  irInicio() { this.router.navigate(['/vendedor']); }
  irMisServicios() { this.router.navigate(['/mis-servicios']); }
  irSolicitudes() { this.router.navigate(['/solicitudes-vendedor']); }
  irHistorial() { this.router.navigate(['/historial-vendedor']); }
  irPerfil() { this.router.navigate(['/perfil-vendedor']); }
}
