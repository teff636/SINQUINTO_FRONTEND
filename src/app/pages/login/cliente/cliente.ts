import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

export interface Servicio {
  serviceOfferId: number;
  sellerId: number;
  photo: string;
  title: string;
  description: string;
  category: string;
  price: number;
  estimatedDuration: number;
}

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css']
})
export class ClienteComponent implements OnInit {

  iniciales: string = '';
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  categoriaActiva: string = 'Todos';
  busqueda: string = '';

  categorias = ['Todos', 'Tecnología', 'Diseño', 'Hogar', 'Clases', 'Legal', 'Otro'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) {
      this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'CL';
    }
    this.cargarServicios();
  }

  cargarServicios() {
    this.authService.getServicios().subscribe({
      next: (data) => {
        this.servicios = [...data];
        this.serviciosFiltrados = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error:', err)
    });
  }

  filtrarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
    this.aplicarFiltros();
  }

  buscar() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let resultado = [...this.servicios];
    if (this.categoriaActiva !== 'Todos') {
      resultado = resultado.filter(s => s.category === this.categoriaActiva);
    }
    if (this.busqueda.trim()) {
      resultado = resultado.filter(s =>
        s.title.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        s.description.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }
    this.serviciosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  verServicio(servicio: Servicio) {
    this.router.navigate(['/ver-servicio'], { state: { servicio } });
  }

  irGuardados() { this.router.navigate(['/guardados-cliente']); }
  irEstado() { this.router.navigate(['/estado-cliente']); }
  irPerfil() { this.router.navigate(['/perfil-cliente']); }
}