import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { VendorQuickPanelComponent } from '../../../shared/vendor-quick-panel/vendor-quick-panel';

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
  imports: [CommonModule, AppTopbarComponent, VendorQuickPanelComponent],
  templateUrl: './historial-vendedor.html',
  styleUrls: ['./historial-vendedor.css']
})
export class HistorialVendedorComponent implements OnInit, OnDestroy {

  iniciales: string = '';
  historial: SolicitudCompletada[] = [];
  cargando: boolean = true;

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
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) { this.router.navigate(['/login']); return; }
    this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'US';
    this.cargarHistorial(usuario.userId);
    this.notifService.iniciarPolling(usuario.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
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

  manejarNotificacion(n: Notificacion): void {
    this.vendorNav.manejarNotificacion(n, () => { this.notifAbierta = false; });
  }

  marcarTodasLeidas(): void { this.vendorNav.marcarTodasLeidas(); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }

  irInicio() { this.vendorNav.irInicio(); }
  irMisServicios() { this.vendorNav.irMisServicios(); }
  irSolicitudes() { this.vendorNav.irSolicitudes(); }
  irHistorial() { this.vendorNav.irHistorial(); }
  irPerfil() { this.vendorNav.irPerfil(); }
}

