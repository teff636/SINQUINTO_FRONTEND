import { Component } from '@angular/core';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  template: `
    <div style="text-align:center; margin-top:100px;">
      <h2>Acceso denegado</h2>
      <p>No tienes permiso para acceder a esta página</p>
    </div>
  `
})
export class AccesoDenegadoComponent {}