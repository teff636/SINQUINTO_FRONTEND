import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-vendedor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './perfil-vendedor.html',
  styleUrls: ['./perfil-vendedor.css']
})
export class PerfilVendedorComponent {

  constructor(private router: Router) {}

  nombreCompleto: string = 'Juan Reyes';
  correo: string = 'correo@ejemplo.com';
  telefono: string = '+57 000 000 0000';
  ciudad: string = 'Bogotá';

  modoEdicion: boolean = false;

  get iniciales(): string {
    return this.nombreCompleto
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .substring(0, 2);
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
  }

  guardarCambios() {

    const confirmar = confirm(
      '¿Seguro que deseas cambiar estos datos?'
    );

    if (confirmar) {

      this.modoEdicion = false;

      alert('Datos actualizados correctamente');

    }

  }

  irInicio() {
    this.router.navigate(['/vendedor']);
  }

  irServicios() {
    this.router.navigate(['/mis-servicios']);
  }

  irSolicitudes() {
    this.router.navigate(['/solicitudes']);
  }

}