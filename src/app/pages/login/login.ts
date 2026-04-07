import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router'

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

  irRegistro() {
  this.router.navigate(['/register-usuario']);
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.navigate(['/login']);
  }

  iniciarSesion() {
    const data = {
      Correo: this.usuario,
      Contrasena: this.password
    };

    this.authService.login(data).subscribe({
  next: (res) => {

    console.log(res); // 👈 para verificar

    // 🔥 GUARDA PRIMERO
    localStorage.setItem('usuario', JSON.stringify(res));

    // 🔥 LUEGO NAVEGA
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
}