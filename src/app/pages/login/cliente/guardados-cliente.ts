import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface ServicioGuardado {
  serviceOfferId: number;
  sellerId: number;
  photo: string;
  title: string;
  description: string;
  category: string;
  
  price: number;
  estimatedDuration: number;
  vendedor?: string;
}

@Component({
  selector: 'app-guardados-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guardados-cliente.html',
  styleUrls: ['./guardados-cliente.css']
})
export class GuardadosClienteComponent implements OnInit {
  iniciales: string = 'CL';
  guardados: ServicioGuardado[] = [];

  pendientesResena: number = 0;
  notifAbierta: boolean = false;
  itemsNotif: any[] = [];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarIniciales();
    this.cargarGuardados();
    this.cargarNotificaciones();
  }

  cargarIniciales(): void {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      this.iniciales = 'CL';
      return;
    }

    try {
      const usuario = JSON.parse(usuarioGuardado);
      const email = usuario?.email || '';
      this.iniciales = email.substring(0, 2).toUpperCase() || 'CL';
    } catch {
      this.iniciales = 'CL';
    }
  }

  cargarGuardados(): void {
    const data = localStorage.getItem('servicios_guardados_cliente');

    if (!data) {
      this.guardados = [];
      return;
    }

    try {
      this.guardados = JSON.parse(data);
    } catch {
      this.guardados = [];
    }

    this.cdr.detectChanges();
  }

  quitarGuardado(servicio: ServicioGuardado): void {
    this.guardados = this.guardados.filter(
      item => item.serviceOfferId !== servicio.serviceOfferId
    );

    localStorage.setItem(
      'servicios_guardados_cliente',
      JSON.stringify(this.guardados)
    );

    this.cdr.detectChanges();
  }

  verServicio(servicio: ServicioGuardado): void {
    this.router.navigate(['/ver-servicio'], {
      state: { servicio }
    });
  }

  irInicio(): void {
    this.router.navigate(['/cliente']);
  }

  volverCliente(): void {
    this.router.navigate(['/cliente']);
  }

  irGuardados(): void {
    this.router.navigate(['/guardados-cliente']);
  }

  irEstado(): void {
    this.router.navigate(['/estado-cliente']);
  }

  irHistorial(): void {
    this.router.navigate(['/historial-cliente']);
  }

  irPerfil(): void {
    this.router.navigate(['/perfil-cliente']);
  }

  private cargarNotificaciones(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;
    this.authService.cargarNotificacionesCliente(usuario.userId).subscribe({
      next: (items: any[]) => {
        this.itemsNotif = items;
        this.pendientesResena = items.length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  marcarLeida(notif: any): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;
    this.authService.marcarNotificacionLeida(usuario.userId, notif.key);
    this.itemsNotif = this.itemsNotif.filter(n => n.key !== notif.key);
    this.pendientesResena = this.itemsNotif.length;
    this.cdr.detectChanges();
  }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
  irAResena(): void { this.notifAbierta = false; this.router.navigate(['/historial-cliente']); }
}