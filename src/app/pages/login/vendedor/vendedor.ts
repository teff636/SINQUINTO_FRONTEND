import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PublicarServicioComponent } from './publicar-servicio';

export interface Servicio {
  id: number;
  imagen: string;
  nombre: string;
  categoria: string;
  precio: string;
  estado: 'Activo' | 'Inactivo';
}

@Component({
  selector: 'app-vendedor',
  standalone: true,
  imports: [CommonModule, PublicarServicioComponent],
  templateUrl: './vendedor.html',
  styleUrls: ['./vendedor.css']
})

export class VendedorComponent {

  mostrarFormulario: boolean = false;

  nombreCompleto: string = 'Juan Reyes';

  servicios: Servicio[] = [];

  serviciosFiltrados: Servicio[] = [];

  categoriaActiva: string = 'Todos';

  constructor(private router: Router) {

    const datos = localStorage.getItem('servicios');

    if (datos) {

      this.servicios = JSON.parse(datos);

      this.serviciosFiltrados = this.servicios;

    }

  }

  get iniciales(): string {

    return this.nombreCompleto
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .substring(0, 2);

  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  /* FILTRAR */
  filtrarCategoria(categoria: string) {

    this.categoriaActiva = categoria;

    if (categoria === 'Todos') {

      this.serviciosFiltrados = this.servicios;

    } else {

      this.serviciosFiltrados = this.servicios.filter(
        s => s.categoria === categoria
      );

    }

  }

  /* IR A MIS SERVICIOS */
  irMisServicios() {
    this.router.navigate(['/mis-servicios']);
  }

  /* IR AL PERFIL */
  irPerfil() {
    this.router.navigate(['/perfil-vendedor']);
  }

  irSolicitudes() {
    this.router.navigate(['/solicitudes-vendedor']);
  }

}