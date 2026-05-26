import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

export interface Servicio {
  serviceOfferId: number;
  sellerId: number;
  photo: string;
  title: string;
  description: string;
  category: string;
  price: number;
  estimatedDuration: number;
  vendedor?: string;
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
  guardados: Servicio[] = [];

  pendientesResena: number = 0;
  notifAbierta: boolean = false;
  itemsNotif: any[] = [];

  categoriaActiva: string = 'Todos';
  busqueda: string = '';

  categorias: string[] = [
    'Todos',
    'Tecnología',
    'Diseño',
    'Hogar',
    'Clases',
    'Legal',
    'Otro'
  ];

  private readonly STORAGE_GUARDADOS = 'servicios_guardados_cliente';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarGuardados();
    this.cargarServicios();
    this.cargarNotificaciones();
  }

  private cargarUsuario(): void {
    const usuario = this.authService.getUsuarioLocal();

    if (!usuario) {
      this.iniciales = 'CL';
      return;
    }

    const email = usuario.email || '';
    this.iniciales = email.substring(0, 2).toUpperCase() || 'CL';
  }

  private cargarGuardados(): void {
    const data = localStorage.getItem(this.STORAGE_GUARDADOS);

    if (!data) {
      this.guardados = [];
      return;
    }

    try {
      this.guardados = JSON.parse(data) as Servicio[];
    } catch (error) {
      console.error('Error al leer servicios guardados:', error);
      this.guardados = [];
      localStorage.removeItem(this.STORAGE_GUARDADOS);
    }
  }

  private guardarGuardadosEnLocalStorage(): void {
    localStorage.setItem(
      this.STORAGE_GUARDADOS,
      JSON.stringify(this.guardados)
    );
  }

  cargarServicios(): void {
    this.authService.getServicios().subscribe({
      next: (data: Servicio[]) => {
        this.servicios = [...data];
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.servicios = [];
        this.serviciosFiltrados = [];
        this.cdr.detectChanges();
      }
    });
  }

  filtrarCategoria(categoria: string): void {
    this.categoriaActiva = categoria;
    this.aplicarFiltros();
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const termino = this.normalizarTexto(this.busqueda);

    let resultado = [...this.servicios];

    if (this.categoriaActiva !== 'Todos') {
      resultado = resultado.filter((servicio) =>
        this.normalizarTexto(servicio.category) === this.normalizarTexto(this.categoriaActiva)
      );
    }

    if (termino) {
      resultado = resultado.filter((servicio) =>
        this.normalizarTexto(servicio.title).includes(termino) ||
        this.normalizarTexto(servicio.description).includes(termino) ||
        this.normalizarTexto(servicio.category).includes(termino) ||
        this.normalizarTexto(servicio.vendedor || '').includes(termino)
      );
    }

    this.serviciosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  private normalizarTexto(valor: string | undefined | null): string {
    return (valor || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  toggleGuardado(servicio: Servicio): void {
    const index = this.guardados.findIndex(
      (guardado) => guardado.serviceOfferId === servicio.serviceOfferId
    );

    if (index === -1) {
      this.guardados.push(servicio);
    } else {
      this.guardados.splice(index, 1);
    }

    this.guardarGuardadosEnLocalStorage();
    this.cdr.detectChanges();
  }

  estaGuardado(servicio: Servicio): boolean {
    return this.guardados.some(
      (guardado) => guardado.serviceOfferId === servicio.serviceOfferId
    );
  }

  verServicio(servicio: Servicio): void {
    this.router.navigate(['/ver-servicio'], {
      state: { servicio }
    });
  }

  irInicio(): void {
    this.router.navigate(['/cliente']);
  }

  irGuardados(): void {
    this.router.navigate(['/guardados-cliente']);
  }

  irEstado(): void {
    this.router.navigate(['/estado-cliente']);
  }

  irHistorial(): void {
    this.router.navigate(['/historial-cliente']);
  }

  irPerfil(): void {
    this.router.navigate(['/perfil-cliente']);
  }

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