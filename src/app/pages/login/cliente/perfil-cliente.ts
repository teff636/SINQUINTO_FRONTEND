import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-cliente.html',
  styleUrls: ['./perfil-cliente.css']
})
export class PerfilClienteComponent implements OnInit {
  iniciales: string = 'CL';
  userId: number = 0;

  nombreCompleto: string = '';
  apellido: string = '';
  correo: string = '';
  telefono: string = '';

  nombreOriginal: string = '';
  apellidoOriginal: string = '';
  correoOriginal: string = '';
  telefonoOriginal: string = '';

  modoEdicion: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  mostrarModalContrasena: boolean = false;
  contrasenaConfirmacion: string = '';
  errorContrasena: string = '';

  totalSolicitudes: number = 0;
  totalGuardados: number = 0;
  serviciosCompletados: number = 0;

  pendientesResena: number = 0;
  notifAbierta: boolean = false;
  itemsNotif: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarMetricasLocales();
    this.cargarNotificaciones();
  }

  get nombreMostrado(): string {
    const nombre = `${this.nombreCompleto || ''} ${this.apellido || ''}`.trim();
    return nombre || this.correo || 'Cliente';
  }

  cargarUsuario(): void {
    const usuario = this.authService.getUsuarioLocal?.();
    if (!usuario) { this.router.navigate(['/login']); return; }

    this.userId = usuario.userId || 0;
    this.correo = usuario.email || '';
    this.nombreCompleto = usuario.name || usuario.nombre || '';
    this.apellido = usuario.lastName || usuario.apellido || '';
    this.telefono = usuario.phoneNumber || usuario.telefono || '';

    this.iniciales = this.obtenerIniciales();
    this.guardarValoresOriginales();

    if (this.userId && (!this.nombreCompleto || !this.telefono)) {
      this.authService.getUsuarioPorId(this.userId).subscribe({
        next: (data: any) => {
          this.nombreCompleto = data.name || data.nombre || this.nombreCompleto;
          this.apellido = data.lastName || data.apellido || this.apellido;
          this.telefono = data.phoneNumber || data.telefono || this.telefono;
          const updated = { ...usuario, name: this.nombreCompleto, lastName: this.apellido, phoneNumber: this.telefono };
          this.authService.guardarSesion(updated);
          this.iniciales = this.obtenerIniciales();
          this.guardarValoresOriginales();
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    }
  }

  cargarMetricasLocales(): void {
    const guardados = localStorage.getItem('servicios_guardados_cliente');

    if (guardados) {
      try {
        this.totalGuardados = JSON.parse(guardados).length || 0;
      } catch {
        this.totalGuardados = 0;
      }
    }

    const solicitudes = localStorage.getItem('solicitudes_cliente');

    if (solicitudes) {
      try {
        const data = JSON.parse(solicitudes);
        this.totalSolicitudes = data.length || 0;
      } catch {
        this.totalSolicitudes = 0;
      }
    }
  }

  obtenerIniciales(): string {
    const nombre = this.nombreCompleto?.trim();
    const apellido = this.apellido?.trim();

    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    }

    if (nombre) {
      return nombre.substring(0, 2).toUpperCase();
    }

    if (this.correo) {
      return this.correo.substring(0, 2).toUpperCase();
    }

    return 'CL';
  }

  guardarValoresOriginales(): void {
    this.nombreOriginal = this.nombreCompleto;
    this.apellidoOriginal = this.apellido;
    this.correoOriginal = this.correo;
    this.telefonoOriginal = this.telefono;
  }

  activarEdicion(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    this.modoEdicion = true;
  }

  cancelarEdicion(): void {
    this.nombreCompleto = this.nombreOriginal;
    this.apellido = this.apellidoOriginal;
    this.correo = this.correoOriginal;
    this.telefono = this.telefonoOriginal;
    this.iniciales = this.obtenerIniciales();

    this.modoEdicion = false;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  pedirContrasena(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.nombreCompleto.trim()) {
      this.mensajeError = 'El nombre no puede estar vacío.';
      return;
    }

    if (!this.apellido.trim()) {
      this.mensajeError = 'El apellido no puede estar vacío.';
      return;
    }

    if (!this.correo.trim()) {
      this.mensajeError = 'El correo no puede estar vacío.';
      return;
    }

    this.mostrarModalContrasena = true;
    this.contrasenaConfirmacion = '';
    this.errorContrasena = '';
  }

  confirmarYGuardar(): void {
    if (!this.contrasenaConfirmacion.trim()) {
      this.errorContrasena = 'Ingresa tu contraseña para confirmar.';
      return;
    }

    this.guardarCambios();
  }

  guardarCambios(): void {
    const usuarioActual = this.authService.getUsuarioLocal?.() || {};
    const data = {
      userId: this.userId || usuarioActual.userId,
      name: this.nombreCompleto,
      lastName: this.apellido,
      email: this.correo,
      phoneNumber: this.telefono
    };

    const actualizarLocal = () => {
      const usuarioActualizado = { ...usuarioActual, ...data };
      this.authService.guardarSesion(usuarioActualizado);
      this.iniciales = this.obtenerIniciales();
      this.guardarValoresOriginales();
      this.modoEdicion = false;
      this.mostrarModalContrasena = false;
      this.contrasenaConfirmacion = '';
      this.errorContrasena = '';
      this.mensajeError = '';
      this.cdr.detectChanges();
    };

    this.authService.actualizarUsuario(data).subscribe({
      next: () => {
        actualizarLocal();
        this.mensajeExito = 'Perfil actualizado correctamente.';
      },
      error: () => {
        actualizarLocal();
        this.mensajeExito = 'Perfil guardado localmente.';
      }
    });
  }

  cancelarContrasena(): void {
    this.mostrarModalContrasena = false;
    this.contrasenaConfirmacion = '';
    this.errorContrasena = '';
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

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('user');
    localStorage.removeItem('usuarioLocal');
    this.router.navigate(['/login']);
  }

  private cargarNotificaciones(): void {
    const usuario = this.authService.getUsuarioLocal?.();
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
    const usuario = this.authService.getUsuarioLocal?.();
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