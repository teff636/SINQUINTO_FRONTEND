import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule],
  template: `<h2>Bienvenido Cliente</h2>`
})
export class ClienteComponent {}