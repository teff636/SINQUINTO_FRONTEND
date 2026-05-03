import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PublicarServicioComponent } from './publicar-servicio';

@Component({
  selector: 'app-vendedor',
  standalone: true,
  imports: [CommonModule, PublicarServicioComponent],
  templateUrl: './vendedor.html',
  styleUrls: ['./vendedor.css']
})
export class VendedorComponent {

  mostrarFormulario: boolean = false;


  iniciales: string = 'EC';

  constructor(private router: Router) {}

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  /* IR AL PERFIL */
  irPerfil() {
    this.router.navigate(['/perfil-vendedor']);
  }

}