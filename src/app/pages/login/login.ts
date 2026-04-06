import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 👈 IMPORTANTE
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { RegisterUsuarioComponent } from './register-usuario/register-usuario';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RegisterUsuarioComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  usuario: string = '';
  password: string = '';
  mensaje: string = '';

  mostrarRegistro: boolean = false; // 🔥 CONTROL DEL MODAL

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion() {
    const data = {
      Correo: this.usuario,
      Contrasena: this.password
    };

    this.authService.login(data).subscribe({
      next: (res) => {
        this.mensaje = 'Bienvenido ' + res.nombre;

        if (res.rol === 'Cliente') {
          this.router.navigate(['/cliente']);
        } else {
          this.router.navigate(['/vendedor']);
        }
      },
      error: () => {
        this.mensaje = 'Correo o contraseña incorrectos';
      }
    });
  }

  // 🔥 ABRE EL CUADRITO
  abrirRegistro() {
    this.mostrarRegistro = true;
  }

  // 🔥 CIERRA EL CUADRITO
  cerrarRegistro() {
    this.mostrarRegistro = false;
  }
}