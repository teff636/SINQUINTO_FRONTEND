import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-publicar-servicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './publicar-servicio.html',
  styleUrls: ['./publicar-servicio.css']
})
export class PublicarServicioComponent {

  nombre: string = '';
  descripcion: string = '';
  precio: string = '';
  mensaje: string = '';

  constructor(private authService: AuthService) {}

  publicar() {

    if (!this.nombre || !this.descripcion || !this.precio) {
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    const data = {
      Nombre: this.nombre,
      Descripcion: this.descripcion,
      Precio: this.precio
    };

    this.authService.crearServicio(data).subscribe({
      next: () => {
        this.mensaje = 'Servicio publicado 🎉';

        this.nombre = '';
        this.descripcion = '';
        this.precio = '';
      },
      error: (err) => {
        console.log(err);
        this.mensaje = 'Error al publicar';
      }
    });
  }
}