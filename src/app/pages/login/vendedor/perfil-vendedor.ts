import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil-vendedor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-vendedor.html',
  styleUrls: ['./perfil-vendedor.css']
})
export class PerfilVendedorComponent implements OnInit {

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
  ratingPromedio: string = '0.0';
  totalClientes: number = 0;

  get iniciales(): string {
    const texto = this.nombreCompleto || this.correo || 'US';
    return texto.substring(0, 2).toUpperCase();
  }

  get nombreMostrado(): string {
    const nombre = `${this.nombreCompleto || ''} ${this.apellido || ''}`.trim();
    return nombre || this.correo || 'Vendedor';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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
      error: (err) => console.log('Error cargando perfil:', err)
    });

    this.authService.getServiciosPorVendedor(this.userId).subscribe({
      next: (servicios: any[]) => {
        this.totalServicios = servicios.length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.totalServicios = 0;
        this.cdr.detectChanges();
      }
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
      error: (err) => {
        console.log(err);
        this.mensajeError = 'Error al actualizar los datos';
        this.mensajeExito = '';
      }
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  irInicio() {
    this.router.navigate(['/vendedor']);
  }

  irServicios() {
    this.router.navigate(['/mis-servicios']);
  }

  irSolicitudes() {
    this.router.navigate(['/solicitudes-vendedor']);
  }

  irHistorial() {
    this.router.navigate(['/historial-vendedor']);
  }
}