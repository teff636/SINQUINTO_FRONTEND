import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { GoogleAuthUiService } from '../../core/services/google-auth-ui.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit {

  usuario: string = '';
  password: string = '';
  mensaje: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly googleAuth: GoogleAuthUiService
  ) {}

  ngAfterViewInit() {
    this.googleAuth.iniciarBoton('gBtnLoginOverlay', () => {
      this.mensaje = 'Error al iniciar sesión con Google';
    });
  }

  irRegistro() {
    this.router.navigate(['/register-usuario']);
  }

  iniciarSesion() {
    this.authService.login({ email: this.usuario, password: this.password }).subscribe({
      next: (res) => {
        this.authService.guardarSesion(res);
        this.router.navigate([res.role === 'SALESPERSON' ? '/vendedor' : '/cliente']);
      },
      error: () => {
        this.mensaje = 'Correo o contraseña incorrectos';
      }
    });
  }
}
