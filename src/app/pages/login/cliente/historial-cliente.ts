import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface SolicitudCompletada {
  appointmentId: number;
  serviceOfferId: number;
  serviceTitle: string;
  sellerName: string;
  category: string;
  date: string;
  price: number;
  status: string;
  hasRating: boolean;
}

@Component({
  selector: 'app-historial-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-cliente.html',
  styleUrls: ['./historial-cliente.css']
})
export class HistorialClienteComponent implements OnInit {

  iniciales: string = 'CL';
  cargando: boolean = true;
  historial: SolicitudCompletada[] = [];

  mostrarModal: boolean = false;
  solicitudActual: SolicitudCompletada | null = null;
  calificacion: number = 0;
  comentario: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';
  enviando: boolean = false;

  estrellas = [1, 2, 3, 4, 5];

  pendientesResena: number = 0;
  notifAbierta: boolean = false;
  itemsNotif: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarIniciales();
    this.cargarHistorial();
    this.cargarNotificaciones();
  }

  private cargarIniciales(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      this.iniciales = (u?.email || '').substring(0, 2).toUpperCase() || 'CL';
    } catch { this.iniciales = 'CL'; }
  }

  cargarHistorial(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) { this.router.navigate(['/login']); return; }
    this.authService.obtenerHistorialCliente(usuario.userId).subscribe({
      next: (data: any[]) => {
        this.historial = (data || []).filter((s: any) => s.status === 'COMPLETED');
        this.actualizarNotificaciones();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.authService.obtenerSolicitudesCliente(usuario.userId).subscribe({
          next: (data2: any[]) => {
            this.historial = (data2 || []).filter((s: any) => s.status === 'COMPLETED');
            this.actualizarNotificaciones();
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => { this.cargando = false; this.cdr.detectChanges(); }
        });
      }
    });
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

  private actualizarNotificaciones(): void {
    if (this.solicitudActual) {
      this.itemsNotif = this.itemsNotif.filter((n: any) => n.appointmentId !== this.solicitudActual!.appointmentId);
      this.pendientesResena = this.itemsNotif.length;
    }
  }

  marcarLeida(notif: any): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;
    this.authService.marcarNotificacionLeida(usuario.userId, notif.key);
    this.itemsNotif = this.itemsNotif.filter((n: any) => n.key !== notif.key);
    this.pendientesResena = this.itemsNotif.length;
    this.cdr.detectChanges();
  }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }

  irAResena(n?: any): void {
    this.notifAbierta = false;
    if (!n) return;
    if (n.tipo === 'RESENA') {
      const item = this.historial.find(h => h.appointmentId === n.appointmentId);
      if (item) this.abrirModal(item);
    } else if (n.appointmentId && !n.tipo) {
      this.abrirModal(n as SolicitudCompletada);
    }
  }

  abrirModal(s: SolicitudCompletada): void {
    this.solicitudActual = s;
    this.calificacion = 0;
    this.comentario = '';
    this.mensajeExito = '';
    this.mensajeError = '';
    this.enviando = false;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.solicitudActual = null;
  }

  seleccionarEstrella(n: number): void { this.calificacion = n; }

  enviarResena(): void {
    if (this.calificacion === 0) {
      this.mensajeError = 'Selecciona una calificación de 1 a 5 estrellas.';
      return;
    }
    if (!this.solicitudActual) return;
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;

    this.enviando = true;
    this.mensajeError = '';

    const payload = {
      serviceOfferId: this.solicitudActual.serviceOfferId,
      userId: usuario.userId,
      appointmentId: this.solicitudActual.appointmentId,
      rating: this.calificacion,
      score: this.calificacion,
      comment: this.comentario
    };

    this.authService.crearCalificacion(payload).subscribe({
      next: () => {
        if (this.solicitudActual) {
          this.solicitudActual.hasRating = true;
          const item = this.historial.find(h => h.appointmentId === this.solicitudActual!.appointmentId);
          if (item) item.hasRating = true;
          this.actualizarNotificaciones();
        }
        this.mensajeExito = '¡Reseña enviada correctamente!';
        this.enviando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.cerrarModal(), 2000);
      },
      error: () => {
        this.mensajeError = 'Error al enviar la reseña. Intenta de nuevo.';
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volverASolicitar(s: SolicitudCompletada): void {
    const servicioObj = {
      serviceOfferId: s.serviceOfferId,
      title: s.serviceTitle,
      vendedor: s.sellerName,
      category: s.category,
      price: s.price,
      photo: null,
      description: '',
      estimatedDuration: null
    };
    this.router.navigate(['/ver-servicio'], { state: { servicio: servicioObj } });
  }

  irInicio(): void { this.router.navigate(['/cliente']); }
  irGuardados(): void { this.router.navigate(['/guardados-cliente']); }
  irEstado(): void { this.router.navigate(['/estado-cliente']); }
  irHistorial(): void { this.router.navigate(['/historial-cliente']); }
  irPerfil(): void { this.router.navigate(['/perfil-cliente']); }
}
