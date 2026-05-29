import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { VendorNavigationService } from '../../../core/services/vendor-navigation.service';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { VendorQuickPanelComponent } from '../../../shared/vendor-quick-panel/vendor-quick-panel';

@Component({
  selector: 'app-perfil-vendedor',
  standalone: true,
  imports: [CommonModule, FormsModule, AppTopbarComponent, VendorQuickPanelComponent],
  templateUrl: './perfil-vendedor.html',
  styleUrls: ['./perfil-vendedor.css']
})
export class PerfilVendedorComponent implements OnInit, OnDestroy {

  userId: number = 0;
  nombreCompleto: string = '';
  apellido: string = '';
  correo: string = '';
  telefono: string = '';

  modoEdicion: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  mostrarModalContrasena: boolean = false;
  contrasenaConfirmacion: string = '';
  errorContrasena: string = '';

  totalServicios: number = 0;
  ratingPromedioCalc: number = 0;
  hayRatings: boolean = false;
  totalClientes: number = 0;

  get ratingPromedio(): string {
    return this.hayRatings ? this.ratingPromedioCalc.toFixed(1) : '–';
  }

  notifAbierta: boolean = false;

  get notifCount(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }

  get iniciales(): string {
    const texto = this.nombreCompleto || this.correo || 'US';
    return texto.substring(0, 2).toUpperCase();
  }

  get nombreMostrado(): string {
    const nombre = `${this.nombreCompleto || ''} ${this.apellido || ''}`.trim();
    return nombre || this.correo || 'Vendedor';
  }

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationUiService,
    private readonly vendorNav: VendorNavigationService
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLocal();

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = Number(usuario.userId);

    this.authService.getUsuarioPorId(this.userId).subscribe({
      next: (data: any) => {
        this.nombreCompleto = data.name || '';
        this.apellido = data.lastName || '';
        this.correo = data.email || '';
        this.telefono = data.phoneNumber || '';
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.authService.getServiciosPorVendedor(this.userId).subscribe({
      next: (servicios: any[]) => {
        this.totalServicios = servicios.length;
        this.cdr.detectChanges();
        const ids = (servicios || []).map((s: any) => s.serviceOfferId).filter(Boolean);
        this.cargarRatingVendedor(ids);
      },
      error: () => {
        this.totalServicios = 0;
        this.cdr.detectChanges();
      }
    });

    this.notifService.iniciarPolling(this.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
  }

  private cargarRatingVendedor(serviceOfferIds: number[]): void {
    if (!serviceOfferIds.length) { this.hayRatings = false; this.cdr.detectChanges(); return; }
    const requests = serviceOfferIds.map(id =>
      this.authService.getCalificacionesPorServicio(id).pipe(catchError(() => of([])))
    );
    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const all = results
          .map(r => Array.isArray(r) ? r : (r?.ratings || r?.content || []))
          .flat();
        const scores = all.map((r: any) => r.rating || r.score || 0).filter((s: number) => s > 0);
        if (scores.length > 0) {
          this.ratingPromedioCalc = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          this.hayRatings = true;
        } else {
          this.hayRatings = false;
        }
        this.cdr.detectChanges();
      },
      error: () => { this.hayRatings = false; this.cdr.detectChanges(); }
    });
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.ngOnInit();
  }

  pedirContrasena() {
    this.contrasenaConfirmacion = '';
    this.errorContrasena = '';
    this.mostrarModalContrasena = true;
  }

  cancelarContrasena() {
    this.mostrarModalContrasena = false;
    this.contrasenaConfirmacion = '';
    this.errorContrasena = '';
  }

  confirmarYGuardar() {
    if (!this.contrasenaConfirmacion) {
      this.errorContrasena = 'Ingresa tu contraseña';
      return;
    }

    this.authService.login({
      email: this.correo,
      password: this.contrasenaConfirmacion
    }).subscribe({
      next: () => {
        this.mostrarModalContrasena = false;
        this.guardarCambios();
      },
      error: () => {
        this.errorContrasena = 'Contraseña incorrecta';
      }
    });
  }

  guardarCambios() {
    const usuario = this.authService.getUsuarioLocal();

    const data = {
      userId: this.userId,
      name: this.nombreCompleto,
      lastName: this.apellido,
      email: this.correo,
      phoneNumber: this.telefono,
      role: usuario?.role
    };

    this.authService.actualizarUsuario(data).subscribe({
      next: () => {
        this.modoEdicion = false;
        this.mensajeExito = 'Datos actualizados correctamente';
        this.mensajeError = '';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.mensajeExito = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.mensajeError = 'Error al actualizar los datos';
        this.mensajeExito = '';
      }
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  manejarNotificacion(n: Notificacion): void {
    this.vendorNav.manejarNotificacion(n, () => { this.notifAbierta = false; });
  }

  marcarTodasLeidas(): void { this.vendorNav.marcarTodasLeidas(); }

  irInicio() { this.vendorNav.irInicio(); }
  irServicios() { this.vendorNav.irMisServicios(); }
  irSolicitudes() { this.vendorNav.irSolicitudes(); }
  irHistorial() { this.vendorNav.irHistorial(); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

