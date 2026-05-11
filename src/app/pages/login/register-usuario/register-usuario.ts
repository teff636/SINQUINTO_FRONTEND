import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register-usuario.html',
  styleUrls: ['./register-usuario.css']
})
export class RegisterUsuarioComponent {

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
    private authService: AuthService,
    private router: Router
  ) {}

  registrar() {
    console.log('CLICK REGISTRAR FUNCIONA');

    if (!this.nombre || !this.apellido || !this.correo || !this.password || !this.telefono) {
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    // Java espera estos campos en inglés
    const data = {
      name: this.nombre,
      lastName: this.apellido,
      email: this.correo,
      password: this.password,
      phoneNumber: this.telefono,
      role: this.rol
    };

    this.authService.register(data).subscribe({
      next: () => {
        console.log('REGISTRO EXITOSO');
        this.mostrarExito = true;
        setTimeout(() => {
          this.mostrarExito = false;
          this.cerrar.emit();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.log(err);
        if (err.status === 409) {
          this.mensaje = 'Este correo ya está registrado';
        } else {
          this.mensaje = 'Error al registrar, intenta de nuevo';
        }
      }
    });
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}