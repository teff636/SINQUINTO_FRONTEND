import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { GoogleAuthUiService } from '../../../core/services/google-auth-ui.service';

@Component({
  selector: 'app-register-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register-usuario.html',
  styleUrls: ['./register-usuario.css']
})
export class RegisterUsuarioComponent implements AfterViewInit {

  @Output() cerrar = new EventEmitter<void>();
  mostrarExito: boolean = false;

  nombre = '';
  apellido = '';
  correo = '';
  password = '';
  telefono = '';
  mensaje = '';
  rol: string = 'CUSTOMER';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly googleAuth: GoogleAuthUiService
  ) {}

  ngAfterViewInit() {
    this.googleAuth.iniciarBoton('gBtnRegisterOverlay', () => {
      this.mensaje = 'Error al continuar con Google';
    });
  }

  registrar() {
    if (!this.nombre || !this.apellido || !this.correo || !this.password || !this.telefono) {
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    this.authService.register({
      name: this.nombre,
      lastName: this.apellido,
      email: this.correo,
      password: this.password,
      phoneNumber: this.telefono,
      role: this.rol
    }).subscribe({
      next: () => {
        this.mostrarExito = true;
        setTimeout(() => {
          this.mostrarExito = false;
          this.cerrar.emit();
        }, 2000);
      },
      error: (err) => {
        this.mensaje = err.status === 409
          ? 'Este correo ya está registrado'
          : 'Error al registrar, intenta de nuevo';
      }
    });
  }

  volverLogin() {
    this.cerrar.emit();
  }
}
