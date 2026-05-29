import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-role.html',
  styleUrls: ['./select-role.css']
})
export class SelectRoleComponent implements OnInit {

  rol: string = 'CUSTOMER';
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  telefono: string = '';
  mensaje: string = '';
  cargando: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    const pendiente = this.authService.getGooglePendiente();
    if (!pendiente) {
      this.router.navigate(['/login']);
      return;
    }
    this.nombre = pendiente.name || '';
    this.apellido = pendiente.lastName || '';
    this.email = pendiente.email || '';
  }

  continuar() {
    if (!this.nombre.trim() || !this.apellido.trim() || !this.telefono.trim()) {
      this.mensaje = 'Nombre, apellido y teléfono son obligatorios';
      return;
    }

    const pendiente = this.authService.getGooglePendiente();
    if (!pendiente) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    this.authService.registrarConGoogle({
      idToken: pendiente.idToken,
      role: this.rol,
      name: this.nombre.trim(),
      lastName: this.apellido.trim(),
      phoneNumber: this.telefono.trim()
    }).subscribe({
      next: (res) => {
        this.authService.limpiarGooglePendiente();
        const combined = {
          ...res,
          name: this.nombre.trim(),
          lastName: this.apellido.trim(),
          phoneNumber: this.telefono.trim()
        };
        this.authService.guardarSesion(combined);
        if (combined.role === 'SALESPERSON') {
          this.router.navigate(['/vendedor']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'Error al registrar. Por favor intenta de nuevo.';
      }
    });
  }

  volver() {
    this.authService.limpiarGooglePendiente();
    this.router.navigate(['/login']);
  }
}
