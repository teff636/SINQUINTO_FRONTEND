import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-quick-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-quick-panel.html',
  styleUrls: ['./client-quick-panel.css']
})
export class ClientQuickPanelComponent {
  @Input() activeSection: 'guardados' | 'estado' | 'historial' | '' = '';

  @Output() goGuardados = new EventEmitter<void>();
  @Output() goEstado = new EventEmitter<void>();
  @Output() goHistorial = new EventEmitter<void>();
}
