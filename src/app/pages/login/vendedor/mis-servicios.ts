import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PublicarServicioComponent } from './publicar-servicio';

export interface Servicio {
  serviceOfferId: number;
  photo: string;
  title: string;
  category: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-mis-servicios',
  standalone: true,
  imports: [CommonModule, PublicarServicioComponent],
  templateUrl: './mis-servicios.html',
  styleUrls: ['./mis-servicios.css']
})
export class MisServiciosComponent implements OnInit {

  iniciales: string = '';
  servicios: Servicio[] = [];
  mostrarFormulario: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarServicios();
  }

  cargarServicios() {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }
    this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'US';
    this.authService.getServiciosPorVendedor(usuario.userId).subscribe({
      next: (data) => {
        this.servicios = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error:', err)
    });
  }

  eliminar(s: Servicio) {
    if (confirm('¿Seguro que deseas eliminar este servicio?')) {
      this.authService.eliminarServicio(s.serviceOfferId).subscribe({
        next: () => {
          this.servicios = this.servicios.filter(x => x.serviceOfferId !== s.serviceOfferId);
          this.cdr.detectChanges();
        },
        error: (err) => console.log('Error:', err)
      });
    }
  }

  editar(s: Servicio) { console.log('Editar:', s); }
  abrirFormulario() { this.mostrarFormulario = true; }
  onServicioPublicado() { this.cargarServicios(); }
  cerrarFormulario() { this.mostrarFormulario = false; this.cargarServicios(); }
  irInicio() { this.router.navigate(['/vendedor']); }
  irSolicitudes() { this.router.navigate(['/solicitudes-vendedor']); }
  irPerfil() { this.router.navigate(['/perfil-vendedor']); }
}