import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Solicitud {
  id: number;
  cliente: string;
  servicio: string;
  mensaje: string;
  estado: 'Pendiente' | 'Aceptada' | 'Rechazada';
}

@Component({
  selector: 'app-solicitudes-vendedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitudes-vendedor.html',
  styleUrls: ['./solicitudes-vendedor.css']
})

export class SolicitudesVendedorComponent {
      iniciales: string = 'EC';

  solicitudes: Solicitud[] = [

    {
      id: 1,
      cliente: 'Laura Gómez',
      servicio: 'Diseño de logo',
      mensaje: 'Hola, necesito un logo minimalista.',
      estado: 'Pendiente'
    },

    {
      id: 2,
      cliente: 'Juan Pérez',
      servicio: 'Arreglo de computador',
      mensaje: 'Mi portátil está muy lento.',
      estado: 'Aceptada'
    }

  ];

  constructor(private router: Router) {}

  aceptar(s: Solicitud) {
    s.estado = 'Aceptada';
  }

  rechazar(s: Solicitud) {
    s.estado = 'Rechazada';
  }

  irInicio() {
    this.router.navigate(['/vendedor']);
  }

  irServicios() {
    this.router.navigate(['/mis-servicios']);
  }

  irPerfil() {
    this.router.navigate(['/perfil-vendedor']);
  }

}