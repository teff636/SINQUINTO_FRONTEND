import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notificacion } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-topbar.html',
  styleUrls: ['./app-topbar.css']
})
export class AppTopbarComponent {
  @Input() variant: 'client' | 'vendor' = 'client';
  @Input() iniciales: string = '';
  @Input() badgeCount: number = 0;
  @Input() notifAbierta: boolean = false;
  @Input() itemsNotif: Notificacion[] = [];

  @Output() toggleNotif = new EventEmitter<void>();
  @Output() cerrarNotif = new EventEmitter<void>();
  @Output() marcarTodas = new EventEmitter<void>();
  @Output() manejarNotif = new EventEmitter<Notificacion>();
  @Output() goInicio = new EventEmitter<void>();
  @Output() goPerfil = new EventEmitter<void>();
}
