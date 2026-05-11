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
  selector: 'app-vendedor',
  standalone: true,
  imports: [CommonModule, PublicarServicioComponent],
  templateUrl: './vendedor.html',
  styleUrls: ['./vendedor.css']
})
export class VendedorComponent implements OnInit {

  mostrarFormulario: boolean = false;
  nombreCompleto: string = '';
  iniciales: string = '';
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  categoriaActiva: string = 'Todos';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) {
      this.nombreCompleto = usuario.email || 'Vendedor';
      this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'VE';
    }
    this.cargarServicios();
  }

  cargarServicios() {
    this.authService.getServicios().subscribe({
      next: (data) => {
        this.servicios = [...data];
        this.serviciosFiltrados = [...data];
        this.categoriaActiva = 'Todos';
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error cargando servicios:', err)
    });
  }

  abrirFormulario() { this.mostrarFormulario = true; }
  onServicioPublicado() { this.cargarServicios(); }
  cerrarFormulario() { this.mostrarFormulario = false; this.cargarServicios(); }

  filtrarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
    if (categoria === 'Todos') {
      this.serviciosFiltrados = [...this.servicios];
    } else {
      this.serviciosFiltrados = this.servicios.filter(s => s.category === categoria);
    }
    this.cdr.detectChanges();
  }

  irMisServicios() { this.router.navigate(['/mis-servicios']); }
  irPerfil() { this.router.navigate(['/perfil-vendedor']); }
  irSolicitudes() { this.router.navigate(['/solicitudes-vendedor']); }
}