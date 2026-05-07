import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Servicio {
  id: number;
  imagen: string;
  nombre: string;
  categoria: string;
  precio: string;
  estado: 'Activo' | 'Inactivo';
}

@Component({
  selector: 'app-mis-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-servicios.html',
  styleUrls: ['./mis-servicios.css']
})

export class MisServiciosComponent {

  iniciales: string = 'EC';

  servicios: Servicio[] = [];

  constructor(private router: Router) {

    const datos = localStorage.getItem('servicios');

    if (datos) {
      this.servicios = JSON.parse(datos);
    }

  }

  editar(s: Servicio) {
    console.log('Editar:', s);
  }

  eliminar(s: Servicio) {

    this.servicios = this.servicios.filter(
      servicio => servicio.id !== s.id
    );

    localStorage.setItem(
      'servicios',
      JSON.stringify(this.servicios)
    );

  }

  irInicio() {
    this.router.navigate(['/vendedor']);
  }

  irPublicar() {
    this.router.navigate(['/publicar-servicio']);
  }

  irSolicitudes() {
    this.router.navigate(['/solicitudes-vendedor']);
  }

  irPerfil() {
    this.router.navigate(['/perfil-vendedor']);
  }
  
  

}