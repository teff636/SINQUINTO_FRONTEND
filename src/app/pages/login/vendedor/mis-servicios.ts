import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';
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
  selector: 'app-mis-servicios',
  standalone: true,
  imports: [CommonModule, PublicarServicioComponent, AppTopbarComponent, VendorQuickPanelComponent],
  templateUrl: './mis-servicios.html',
  styleUrls: ['./mis-servicios.css']
})
export class MisServiciosComponent implements OnInit, OnDestroy {

  iniciales: string = '';
  servicios: Servicio[] = [];
  mostrarFormulario: boolean = false;

  notifAbierta: boolean = false;

  get notifCount(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationUiService,
    private readonly vendorNav: VendorNavigationService
  ) {}

  ngOnInit() {
    this.cargarServicios();
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.iniciarPolling(usuario.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
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
      error: () => {}
    });
  }

  eliminar(s: Servicio) {
    if (confirm('¿Seguro que deseas eliminar este servicio?')) {
      this.authService.eliminarServicio(s.serviceOfferId).subscribe({
        next: () => {
          this.servicios = this.servicios.filter(x => x.serviceOfferId !== s.serviceOfferId);
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    }
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  onServicioPublicado() {
    this.mostrarFormulario = false;
    this.cargarServicios();
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.cargarServicios();
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO').format(valor || 0);
  }

  obtenerIdServicio(s: Servicio): string {
    return `#SERV-${String(s.serviceOfferId || 0).padStart(3, '0')}`;
  }

  manejarNotificacion(n: Notificacion): void {
    this.vendorNav.manejarNotificacion(n, () => { this.notifAbierta = false; });
  }

  marcarTodasLeidas(): void { this.vendorNav.marcarTodasLeidas(); }

  irInicio() { this.vendorNav.irInicio(); }
  irSolicitudes() { this.vendorNav.irSolicitudes(); }
  irHistorial() { this.vendorNav.irHistorial(); }
  irPerfil() { this.vendorNav.irPerfil(); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

