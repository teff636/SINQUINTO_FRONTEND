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
  terminoBusqueda: string = '';

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
    } else {
      this.nombreCompleto = 'Vendedor';
      this.iniciales = 'VE';
    }

    this.cargarServicios();
  }

  get nombreVisible(): string {
    if (!this.nombreCompleto) return 'Vendedor';

    const nombre = this.nombreCompleto.split('@')[0];

    return nombre
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  get totalServiciosPublicados(): number {
    return this.servicios.length;
  }

  get totalSolicitudes(): number {
    return 0;
  }

  get ratingPromedio(): string {
    return '0.0';
  }

  cargarServicios() {
    this.authService.getServicios().subscribe({
      next: (data) => {
        this.servicios = [...data];
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error cargando servicios:', err);
        this.servicios = [];
        this.serviciosFiltrados = [];
        this.cdr.detectChanges();
      }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.cargarServicios();
  }

  onServicioPublicado() {
    this.mostrarFormulario = false;
    this.cargarServicios();
  }

  filtrarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
    this.aplicarFiltros();
  }

  buscarServicios(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda = input.value || '';
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let resultado = [...this.servicios];

    if (this.categoriaActiva !== 'Todos') {
      resultado = resultado.filter(
        servicio => servicio.category === this.categoriaActiva
      );
    }

    const termino = this.terminoBusqueda.trim().toLowerCase();

    if (termino) {
      resultado = resultado.filter(servicio =>
        servicio.title?.toLowerCase().includes(termino) ||
        servicio.category?.toLowerCase().includes(termino) ||
        servicio.description?.toLowerCase().includes(termino)
      );
    }

    this.serviciosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  getInicialesServicio(servicio: Servicio): string {
    const titulo = servicio.title || 'Servicio';

    return titulo
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(palabra => palabra.charAt(0).toUpperCase())
      .join('');
  }

  getCategoriaVisual(servicio: Servicio): string {
    return servicio.category || 'General';
  }

  irInicio() {
    this.router.navigate(['/vendedor']);
  }

  irMisServicios() {
    this.router.navigate(['/mis-servicios']);
  }

  irPerfil() {
    this.router.navigate(['/perfil-vendedor']);
  }

  irSolicitudes() {
    this.router.navigate(['/solicitudes-vendedor']);
  }

  irHistorial() {
    this.router.navigate(['/historial-vendedor']);
  }
}