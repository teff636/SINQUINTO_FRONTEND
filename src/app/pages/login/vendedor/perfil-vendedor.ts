import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-vendedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-vendedor.html',
  styleUrls: ['./perfil-vendedor.css']
})
export class PerfilVendedorComponent {

  nombre: string = 'Juan';
  apellido: string = 'Reyes';

  get iniciales(): string {
    return this.nombre.charAt(0) + this.apellido.charAt(0);
  }

}