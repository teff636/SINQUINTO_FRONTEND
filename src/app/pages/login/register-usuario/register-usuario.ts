import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
  rol: string = 'Cliente';

  constructor(private authService: AuthService) {}

  registrar() {
    console.log("CLICK REGISTRAR FUNCIONA");
    
  if (!this.nombre || !this.apellido || !this.correo || !this.password || !this.telefono) {
    this.mensaje = 'Todos los campos son obligatorios';
    return;
  }

  const data = {
    Nombre: this.nombre,
    Apellido: this.apellido,
    Correo: this.correo,
    Contrasena: this.password,
    Telefono: this.telefono,
    Rol: this.rol
  };

  this.authService.registerCliente(data).subscribe({
    next: () => {

      console.log("REGISTRO EXITOSO"); // 👈 PRUEBA

      this.mostrarExito = true;

      setTimeout(() => {
       this.mostrarExito = false;
       this.cerrar.emit();
      }, 2000);

    },
    error: (err) => {
      console.log(err);
      this.mensaje = 'Error al registrar';
    }
  });
  }
}