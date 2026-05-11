import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  usuario: string = '';
  password: string = '';
  mensaje: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  irRegistro() {
    this.router.navigate(['/register-usuario']);
  }

  iniciarSesion() {
    // Java espera: email y password
    const data = {
      email: this.usuario,
      password: this.password
    };

    this.authService.login(data).subscribe({
      next: (res) => {
        // Guardar token y datos del usuario
        this.authService.guardarSesion(res);

        // Java devuelve el rol como SALESPERSON o CUSTOMER
        if (res.role === 'SALESPERSON') {
          this.router.navigate(['/vendedor']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: () => {
        this.mensaje = 'Correo o contraseña incorrectos';
      }
    });
  }
}