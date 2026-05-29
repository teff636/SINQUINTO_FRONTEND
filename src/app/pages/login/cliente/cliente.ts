import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { ClientNavigationService } from '../../../core/services/client-navigation.service';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { ClientQuickPanelComponent } from '../../../shared/client-quick-panel/client-quick-panel';

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
  imports: [CommonModule, FormsModule, AppTopbarComponent, ClientQuickPanelComponent],
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css']
})
export class ClienteComponent implements OnInit, OnDestroy {
  iniciales: string = '';

  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  guardados: Servicio[] = [];

  notifAbierta: boolean = false;

  get pendientesResena(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }

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
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationUiService,
    private readonly clientNav: ClientNavigationService
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarGuardados();
    this.cargarServicios();
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.iniciarPolling(usuario.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
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
    } catch {
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
      error: () => {
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
      .replace(/[̀-ͯ]/g, '');
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

  manejarNotificacion(n: Notificacion): void {
    this.clientNav.manejarNotificacion(n, () => { this.notifAbierta = false; });
  }

  marcarTodasLeidas(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.marcarTodas(usuario.userId);
  }

  irInicio(): void { this.router.navigate(['/cliente']); }
  irGuardados(): void { this.router.navigate(['/guardados-cliente']); }
  irEstado(): void { this.router.navigate(['/estado-cliente']); }
  irHistorial(): void { this.router.navigate(['/historial-cliente']); }
  irPerfil(): void { this.router.navigate(['/perfil-cliente']); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

