import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicarServicioComponent } from './publicar-servicio';

@Component({
  selector: 'app-vendedor',
  standalone: true,
  imports: [CommonModule, PublicarServicioComponent],
  templateUrl: './vendedor.html',
  template: `<h2>Bienvenido </h2><app-publicar-servicio></app-publicar-servicio>`
})
export class VendedorComponent {
  mostrarFormulario: boolean = false;

abrirFormulario() {
  this.mostrarFormulario = true;
}

cerrarFormulario() {
  this.mostrarFormulario = false;
}
}