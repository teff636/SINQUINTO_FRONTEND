import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendor-quick-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-quick-panel.html',
  styleUrls: ['./vendor-quick-panel.css']
})
export class VendorQuickPanelComponent {
  @Input() activeSection: 'servicios' | 'solicitudes' | 'historial' | '' = '';

  @Output() goServicios = new EventEmitter<void>();
  @Output() goSolicitudes = new EventEmitter<void>();
  @Output() goHistorial = new EventEmitter<void>();
}
