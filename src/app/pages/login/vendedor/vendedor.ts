import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { PublicarServicioComponent } from './publicar-servicio';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { VendorQuickPanelComponent } from '../../../shared/vendor-quick-panel/vendor-quick-panel';

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
  imports: [CommonModule, PublicarServicioComponent, AppTopbarComponent, VendorQuickPanelComponent],
  templateUrl: './vendedor.html',
  styleUrls: ['./vendedor.css']
})
export class VendedorComponent implements OnInit, OnDestroy {

  mostrarFormulario: boolean = false;

  nombreCompleto: string = '';
  iniciales: string = '';

  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];

  categoriaActiva: string = 'Todos';
  terminoBusqueda: string = '';

  solicitudesActivas: number = 0;
  ratingPromedioCalc: number = 0;
  hayRatings: boolean = false;

  notifAbierta: boolean = false;

  get notifCount(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }
  get totalServiciosPublicados(): number { return this.servicios.length; }
  get totalSolicitudes(): number { return this.solicitudesActivas; }
  get ratingPromedio(): string {
    return this.hayRatings ? this.ratingPromedioCalc.toFixed(1) : '–';
  }

  private userId: number = 0;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationUiService
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLocal();

    if (usuario) {
      this.userId = usuario.userId;
      this.nombreCompleto = usuario.name || usuario.email || 'Vendedor';
      this.iniciales = (usuario.name || usuario.email || 'VE').substring(0, 2).toUpperCase();
    } else {
      this.nombreCompleto = 'Vendedor';
      this.iniciales = 'VE';
    }

    this.cargarServicios();
    this.cargarSolicitudesMetrica();
    this.notifService.iniciarPolling(this.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
  }

  get nombreVisible(): string {
    if (!this.nombreCompleto) return 'Vendedor';
    const nombre = this.nombreCompleto.split('@')[0];
    return nombre
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }

  cargarServicios() {
    if (!this.userId) return;
    this.authService.getServiciosPorVendedor(this.userId).subscribe({
      next: (data) => {
        this.servicios = [...data];
        this.aplicarFiltros();
        this.cargarRatingVendedor(this.servicios.map(s => s.serviceOfferId));
        this.cdr.detectChanges();
      },
      error: () => {
        this.servicios = [];
        this.serviciosFiltrados = [];
        this.cdr.detectChanges();
      }
    });
  }

  private cargarSolicitudesMetrica(): void {
    if (!this.userId) return;
    this.authService.obtenerSolicitudesVendedor(this.userId).subscribe({
      next: (data: any[]) => {
        this.solicitudesActivas = (data || []).filter(
          s => s.status === 'PENDING' || s.status === 'ACCEPTED'
        ).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  private cargarRatingVendedor(serviceOfferIds: number[]): void {
    if (!serviceOfferIds.length) {
      this.hayRatings = false;
      this.cdr.detectChanges();
      return;
    }

    const requests = serviceOfferIds.map(id =>
      this.authService.getCalificacionesPorServicio(id).pipe(catchError(() => of([])))
    );

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const all = results
          .map(r => Array.isArray(r) ? r : (r?.ratings || r?.content || []))
          .flat();
        const scores = all
          .map((r: any) => r.rating || r.score || 0)
          .filter((s: number) => s > 0);

        if (scores.length > 0) {
          this.ratingPromedioCalc = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          this.hayRatings = true;
        } else {
          this.hayRatings = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.hayRatings = false;
        this.cdr.detectChanges();
      }
    });
  }

  manejarNotificacion(n: Notificacion): void {
    this.notifService.marcarLeida(n, () => {
      if (n.type === 'APPOINTMENT_REQUESTED') {
        this.notifAbierta = false;
        this.router.navigate(['/solicitudes-vendedor']);
      }
    });
  }

  marcarTodasLeidas(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.marcarTodas(usuario.userId);
  }

  abrirFormulario() { this.mostrarFormulario = true; }

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
      resultado = resultado.filter(s => s.category === this.categoriaActiva);
    }

    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (termino) {
      resultado = resultado.filter(s =>
        s.title?.toLowerCase().includes(termino) ||
        s.category?.toLowerCase().includes(termino) ||
        s.description?.toLowerCase().includes(termino)
      );
    }

    this.serviciosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  getInicialesServicio(servicio: Servicio): string {
    return (servicio.title || 'Servicio')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('');
  }

  getCategoriaVisual(servicio: Servicio): string {
    return servicio.category || 'General';
  }

  irInicio() { this.router.navigate(['/vendedor']); }
  irMisServicios() { this.router.navigate(['/mis-servicios']); }
  irPerfil() { this.router.navigate(['/perfil-vendedor']); }
  irSolicitudes() { this.router.navigate(['/solicitudes-vendedor']); }
  irHistorial() { this.router.navigate(['/historial-vendedor']); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

