import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-estado-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-cliente.html',
  styleUrls: ['./estado-cliente.css']
})
export class EstadoClienteComponent implements OnInit {

  iniciales: string = '';
  solicitudes: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }
    this.iniciales = usuario.email?.substring(0, 2).toUpperCase() || 'CL';
    this.authService.getCitasPorUsuario(usuario.userId).subscribe({
      next: (data) => {
        this.solicitudes = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error:', err)
    });
  }

  getEstadoLabel(status: string): string {
    const map: any = {
      'PENDING': 'En espera',
      'CONFIRMED': 'Aceptada',
      'CANCELLED': 'Negada',
      'COMPLETED': 'Completada'
    };
    return map[status] || status;
  }

  getEstadoClass(status: string): string {
    const map: any = {
      'PENDING': 'espera',
      'CONFIRMED': 'aceptada',
      'CANCELLED': 'negada',
      'COMPLETED': 'completada'
    };
    return map[status] || '';
  }

  irInicio() { this.router.navigate(['/cliente']); }
  irGuardados() { this.router.navigate(['/guardados-cliente']); }
  irPerfil() { this.router.navigate(['/perfil-cliente']); }
}